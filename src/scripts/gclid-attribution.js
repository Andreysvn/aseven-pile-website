const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const TRACKED_EVENTS = new Set([
  'LANDING', 'CLICK_WA', 'CLICK_PHONE',
  'SCROLL_50', 'SCROLL_75', 'SCROLL_90', 'SCROLL_100', 'SCROLL'
]);

const EMPTY_ATTRIBUTION = {
  gclid: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
  capturedAt: 0,
};

export function captureAttribution(search, now = Date.now(), previous = null) {
  const params = new URLSearchParams(search);
  const gclid = params.get('gclid');
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmTerm = params.get('utm_term');
  const utmContent = params.get('utm_content');

  if ([gclid, utmSource, utmMedium, utmCampaign, utmTerm, utmContent].some(Boolean)) {
    return {
      gclid: gclid || '',
      utmSource: utmSource || '',
      utmMedium: utmMedium || '',
      utmCampaign: utmCampaign || '',
      utmTerm: utmTerm || '',
      utmContent: utmContent || '',
      capturedAt: now,
    };
  }

  if (previous && Number.isFinite(previous.capturedAt)) {
    const age = now - previous.capturedAt;
    if (age >= 0 && age <= ATTRIBUTION_TTL_MS) {
      return {
        gclid: typeof previous.gclid === 'string' ? previous.gclid : '',
        utmSource: typeof previous.utmSource === 'string' ? previous.utmSource : '',
        utmMedium: typeof previous.utmMedium === 'string' ? previous.utmMedium : '',
        utmCampaign: typeof previous.utmCampaign === 'string' ? previous.utmCampaign : '',
        utmTerm: typeof previous.utmTerm === 'string' ? previous.utmTerm : '',
        utmContent: typeof previous.utmContent === 'string' ? previous.utmContent : '',
        capturedAt: previous.capturedAt,
      };
    }
  }

  return { ...EMPTY_ATTRIBUTION };
}

export function createTrackingEvent(event, details, attribution, now, eventId) {
  if (!TRACKED_EVENTS.has(event)) {
    throw new TypeError(`Unsupported tracking event: ${event}`);
  }
  if (typeof eventId !== 'string' || !eventId.trim()) {
    throw new TypeError('Tracking event requires an event ID');
  }

  const source = attribution || EMPTY_ATTRIBUTION;
  const info = details || {};
  return {
    eventId,
    event,
    timestamp: new Date(now).toISOString(),
    page: info.page || '/',
    gclid: source.gclid || '',
    utmSource: source.utmSource || '',
    utmMedium: source.utmMedium || '',
    utmCampaign: source.utmCampaign || '',
    utmTerm: source.utmTerm || '',
    utmContent: source.utmContent || '',
    referrer: info.referrer || '-',
    device: info.device || '-',
    ip: info.ip || '-',
  };
}

export function queueTrackingPayload(endpoint, payload, transport) {
  if (!endpoint || !transport) return false;

  try {
    if (typeof transport.sendBeacon === 'function' && transport.sendBeacon(endpoint, payload)) {
      return true;
    }
  } catch (_) {}

  try {
    if (typeof transport.fetchKeepalive !== 'function') return false;
    Promise.resolve(transport.fetchKeepalive(endpoint, payload)).catch(() => {});
    return true;
  } catch (_) {
    return false;
  }
}

export function isRecentWhatsAppClick(now, storage, key = 'aseven_last_wa_click', debounceMs = 3000) {
  try {
    const previous = Number(storage.getItem(key) || 0);
    if (now - previous >= 0 && now - previous < debounceMs) return true;
    storage.setItem(key, String(now));
  } catch (_) {}
  return false;
}
