import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { maskIp } from '../../cloudflare/traffic-worker.js';

const endpoint = 'https://script.google.com/macros/s/deployment-id/exec';
const env = { APPS_SCRIPT_URL: endpoint };

test('masks IPv4 to its /24 subnet', () => {
  assert.equal(maskIp('203.0.113.47'), '203.0.113.0/24');
  assert.equal(maskIp('255.255.255.255'), '255.255.255.0/24');
});

test('masks compressed and expanded IPv6 to their /48 subnet', () => {
  assert.equal(maskIp('2001:db8:abcd::1'), '2001:db8:abcd:0:0:0:0:0/48');
  assert.equal(maskIp('2001:0db8:abcd:0000:0000:0000:0000:0001'), '2001:db8:abcd:0:0:0:0:0/48');
  assert.equal(maskIp('2001:db8::192.0.2.10'), '2001:db8:0:0:0:0:0:0/48');
  assert.equal(maskIp('::ffff:192.0.2.10'), '192.0.2.0/24');
});

test('does not produce a value for invalid addresses', () => {
  assert.equal(maskIp('not-an-ip'), '');
  assert.equal(maskIp('256.1.1.1'), '');
  assert.equal(maskIp('2001:::1'), '');
});

test('overwrites browser-supplied IP with Cloudflare address before forwarding', async () => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;
  globalThis.fetch = async (url, options) => {
    upstreamRequest = { url, options };
    return Response.json({ status: 'accepted', eventId: 'evt-1' });
  };

  try {
    const request = new Request('https://asevenpile.com/api/events', {
      method: 'POST',
      headers: {
        'content-type': 'text/plain',
        'cf-connecting-ip': '203.0.113.47',
      },
      body: JSON.stringify({ eventId: 'evt-1', event: 'CLICK_WA', ip: '198.51.100.99' }),
    });
    const response = await worker.fetch(request, env);

    assert.equal(response.status, 200);
    assert.equal(upstreamRequest.url, endpoint);
    assert.deepEqual(JSON.parse(upstreamRequest.options.body).ip, '203.0.113.0/24');
    assert.equal(upstreamRequest.options.headers['cf-connecting-ip'], undefined);
    assert.equal(upstreamRequest.options.headers['x-forwarded-for'], undefined);
    assert.equal(upstreamRequest.options.redirect, 'follow');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('prefers Cloudflare original IPv6 when Pseudo IPv4 overwrites the IPv4 header', async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (_url, options) => {
    forwarded = JSON.parse(options.body);
    return Response.json({ status: 'accepted', eventId: 'evt-2' });
  };

  try {
    const request = new Request('https://asevenpile.com/api/events', {
      method: 'POST',
      headers: {
        'cf-connecting-ip': '240.0.0.10',
        'cf-connecting-ipv6': '2001:db8:abcd::1234',
      },
      body: JSON.stringify({ eventId: 'evt-2', event: 'LANDING' }),
    });
    await worker.fetch(request, env);
    assert.equal(forwarded.ip, '2001:db8:abcd:0:0:0:0:0/48');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('records an explicit placeholder when Cloudflare provides no valid IP header', async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (_url, options) => {
    forwarded = JSON.parse(options.body);
    return Response.json({ status: 'accepted', eventId: 'evt-3' });
  };

  try {
    const request = new Request('https://asevenpile.com/api/events', {
      method: 'POST',
      headers: { 'cf-connecting-ip': 'spoofed' },
      body: JSON.stringify({ eventId: 'evt-3', event: 'LANDING', ip: '203.0.113.47' }),
    });
    await worker.fetch(request, env);
    assert.equal(forwarded.ip, '-');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects invalid methods, paths, payloads, and Apps Script destinations', async () => {
  const getResponse = await worker.fetch(
    new Request('https://asevenpile.com/api/events'),
    env,
  );
  assert.equal(getResponse.status, 405);

  const pathResponse = await worker.fetch(
    new Request('https://asevenpile.com/not-events', { method: 'POST', body: '{}' }),
    env,
  );
  assert.equal(pathResponse.status, 404);

  const invalidJson = await worker.fetch(
    new Request('https://asevenpile.com/api/events', { method: 'POST', body: '{bad' }),
    env,
  );
  assert.equal(invalidJson.status, 400);

  const untrustedDestination = await worker.fetch(
    new Request('https://asevenpile.com/api/events', { method: 'POST', body: '{}' }),
    { APPS_SCRIPT_URL: 'https://example.com/collect' },
  );
  assert.equal(untrustedDestination.status, 503);
});

test('rejects oversized payloads before forwarding', async () => {
  let called = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    called = true;
    return Response.json({ status: 'accepted' });
  };

  try {
    const request = new Request('https://asevenpile.com/api/events', {
      method: 'POST',
      body: JSON.stringify({ event: 'LANDING', data: 'x'.repeat(9000) }),
    });
    const response = await worker.fetch(request, env);
    assert.equal(response.status, 413);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('surfaces Apps Script validation errors and upstream failures', async () => {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => Response.json({ status: 'error', error: 'Unsupported event type.' });
    const invalidEvent = await worker.fetch(
      new Request('https://asevenpile.com/api/events', { method: 'POST', body: '{"event":"BAD"}' }),
      env,
    );
    assert.equal(invalidEvent.status, 400);

    globalThis.fetch = async () => new Response('unavailable', { status: 503 });
    const upstreamFailure = await worker.fetch(
      new Request('https://asevenpile.com/api/events', { method: 'POST', body: '{"event":"LANDING"}' }),
      env,
    );
    assert.equal(upstreamFailure.status, 502);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
