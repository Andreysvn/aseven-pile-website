const MAX_BODY_BYTES = 8192;
const EVENT_PATH = '/api/events';

export function maskIp(value) {
  if (typeof value !== 'string') return '';
  const address = value.trim().toLowerCase();
  if (!address || address.includes('%')) return '';

  const ipv4Mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(address);
  if (ipv4Mapped) return maskIpv4(ipv4Mapped[1]);

  const ipv4 = maskIpv4(address);
  if (ipv4) return ipv4;

  const groups = expandIpv6(address);
  if (!groups) return '';
  return `${groups[0]}:${groups[1]}:${groups[2]}:0:0:0:0:0/48`;
}

function maskIpv4(address) {
  const parts = address.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return '';
  const octets = parts.map(Number);
  if (octets.some((octet) => octet > 255)) return '';
  return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
}

function expandIpv6(address) {
  let normalized = address;
  const embeddedIpv4 = /(?:^|:)(\d{1,3}(?:\.\d{1,3}){3})$/.exec(normalized);
  if (embeddedIpv4) {
    const masked = maskIpv4(embeddedIpv4[1]);
    if (!masked) return null;
    const octets = embeddedIpv4[1].split('.').map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    normalized = normalized.replace(embeddedIpv4[1], `${high}:${low}`);
  }

  const compressionIndex = normalized.indexOf('::');
  if (compressionIndex !== -1 && normalized.indexOf('::', compressionIndex + 2) !== -1) return null;

  const leftText = compressionIndex === -1
    ? normalized
    : normalized.slice(0, compressionIndex);
  const rightText = compressionIndex === -1
    ? ''
    : normalized.slice(compressionIndex + 2);
  const left = leftText ? leftText.split(':') : [];
  const right = rightText ? rightText.split(':') : [];
  const groups = left.concat(right);
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;

  if (compressionIndex === -1) {
    if (groups.length !== 8) return null;
  } else {
    const missingGroups = 8 - groups.length;
    if (missingGroups < 1) return null;
    groups.splice(left.length, 0, ...Array(missingGroups).fill('0'));
  }

  return groups.map((group) => parseInt(group, 16).toString(16));
}

function visitorIp(headers) {
  const originalIpv6 = maskIp(headers.get('cf-connecting-ipv6') || '');
  if (originalIpv6) return originalIpv6;
  return maskIp(headers.get('cf-connecting-ip') || '');
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function appsScriptUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' ||
        !/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname) ||
        url.search || url.hash || url.username || url.password) {
      return null;
    }
    return url.toString();
  } catch (error) {
    return null;
  }
}

async function readBoundedBody(request) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new RangeError('Request body is too large.');
  }

  const reader = request.body && request.body.getReader();
  if (!reader) return '';

  const chunks = [];
  let byteLength = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    byteLength += result.value.byteLength;
    if (byteLength > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RangeError('Request body is too large.');
    }
    chunks.push(result.value);
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== EVENT_PATH) {
      return jsonResponse({ status: 'error', error: 'Not found.' }, 404);
    }
    if (request.method !== 'POST') {
      return jsonResponse({ status: 'error', error: 'Method not allowed.' }, 405);
    }

    const destination = appsScriptUrl(env && env.APPS_SCRIPT_URL);
    if (!destination) {
      return jsonResponse({ status: 'error', error: 'Event receiver is not configured.' }, 503);
    }

    let payload;
    try {
      const body = await readBoundedBody(request);
      payload = JSON.parse(body);
    } catch (error) {
      if (error instanceof RangeError) {
        return jsonResponse({ status: 'error', error: 'Request body is too large.' }, 413);
      }
      return jsonResponse({ status: 'error', error: 'Request body must contain valid JSON.' }, 400);
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return jsonResponse({ status: 'error', error: 'Request body must be a JSON object.' }, 400);
    }

    payload.ip = visitorIp(request.headers) || '-';
    let upstream;
    try {
      upstream = await fetch(destination, {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
    } catch (error) {
      return jsonResponse({ status: 'error', error: 'Event receiver could not be reached.' }, 502);
    }

    if (!upstream.ok) {
      return jsonResponse({ status: 'error', error: 'Event receiver returned an error.' }, 502);
    }

    let result;
    try {
      result = await upstream.json();
    } catch (error) {
      return jsonResponse({ status: 'error', error: 'Event receiver returned an invalid response.' }, 502);
    }
    if (!result || typeof result !== 'object' ||
        !['accepted', 'duplicate', 'error'].includes(result.status)) {
      return jsonResponse({ status: 'error', error: 'Event receiver returned an invalid response.' }, 502);
    }
    if (result.status === 'error') {
      return jsonResponse(result, 400);
    }

    return jsonResponse(result, 200);
  },
};
