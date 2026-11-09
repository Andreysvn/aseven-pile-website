import test from 'node:test';
import assert from 'node:assert/strict';
import {
  captureAttribution,
  createTrackingEvent,
  isRecentWhatsAppClick,
  queueTrackingPayload,
} from '../../src/scripts/gclid-attribution.js';

test('captures only actual landing attribution and preserves GCLID case', () => {
  const captured = captureAttribution('?gclid=AbC123&utm_source=google', 1000, null);
  assert.equal(captured.gclid, 'AbC123');
  assert.equal(captured.utmSource, 'google');
  assert.equal(captureAttribution('', 1000, null).gclid, '');
  assert.equal(captureAttribution('?GCLID=AbC123', 1000, null).gclid, '');
});

test('event payload matches the receiver allowlist and never invents a GCLID', () => {
  const event = createTrackingEvent(
    'CLICK_WA',
    { page: '/kontak', referrer: 'https://asevenpile.com/', device: 'Mobile' },
    { gclid: '', utmSource: 'google' },
    1000,
    'evt-1',
  );

  assert.deepEqual(Object.keys(event).sort(), [
    'device', 'event', 'eventId', 'gclid', 'ip', 'page', 'referrer',
    'timestamp', 'utmCampaign', 'utmContent', 'utmMedium', 'utmSource', 'utmTerm',
  ].sort());
  assert.equal(event.eventId, 'evt-1');
  assert.equal(event.timestamp, new Date(1000).toISOString());
  assert.equal(event.event, 'CLICK_WA');
  assert.equal(event.page, '/kontak');
  assert.equal(event.gclid, '');
  assert.equal(event.ip, '-');
  assert.equal('topic' in event, false);
  assert.equal('utm_source' in event, false);
});

test('does not reuse attribution after its 90-day expiry', () => {
  const previous = { gclid: 'OldClick', capturedAt: 1000 };
  assert.equal(captureAttribution('', 1000 + 90 * 86400000, previous).gclid, 'OldClick');
  assert.equal(captureAttribution('', 1001 + 90 * 86400000, previous).gclid, '');
});

test('restores only string attribution fields from stored data', () => {
  const restored = captureAttribution('', 2000, {
    gclid: 123,
    utmSource: 'google',
    capturedAt: 1000,
    unexpected: 'discard this',
  });
  assert.deepEqual(restored, {
    gclid: '',
    utmSource: 'google',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    capturedAt: 1000,
  });
});

test('falls back to keepalive fetch if sendBeacon cannot queue the event', () => {
  let fetchCalls = 0;
  const queued = queueTrackingPayload('/endpoint', 'payload', {
    sendBeacon: () => false,
    fetchKeepalive: () => {
      fetchCalls += 1;
      return Promise.resolve();
    },
  });

  assert.equal(queued, true);
  assert.equal(fetchCalls, 1);
});

test('WhatsApp click debounce fails open if session storage is unavailable', () => {
  assert.equal(isRecentWhatsAppClick(5000, {
    getItem() { throw new Error('storage unavailable'); },
    setItem() { throw new Error('storage unavailable'); },
  }), false);
});
