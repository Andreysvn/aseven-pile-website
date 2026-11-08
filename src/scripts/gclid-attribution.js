export const ATTRIBUTION_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000;

const UTM_PARAMETERS = [
  ['utm_source', 'utmSource'],
  ['utm_medium', 'utmMedium'],
  ['utm_campaign', 'utmCampaign'],
  ['utm_term', 'utmTerm'],
  ['utm_content', 'utmContent'],
];

const emptyAttribution = () => ({
  gclid: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmTerm: '',
  utmContent: '',
  capturedAt: 0,
});

const readStoredAttribution = (previous, nowMs) => {
  if (!previous || typeof previous !== 'object') return emptyAttribution();
  const capturedAt = Number(previous.capturedAt);
  if (!Number.isFinite(capturedAt) || capturedAt <= 0 ||
      nowMs < capturedAt || nowMs - capturedAt > ATTRIBUTION_EXPIRY_MS) {
    return emptyAttribution();
  }

  return {
    gclid: typeof previous.gclid === 'string' ? previous.gclid : '',
    ...Object.fromEntries(UTM_PARAMETERS.map(([, key]) => [
      key,
      typeof previous[key] === 'string' ? previous[key] : '',
    ])),
    capturedAt,
  };
};

export function captureAttribution(search, nowMs, previous) {
  const params = new URLSearchParams(search);
  const gclid = params.get('gclid') || '';
  const utmValues = Object.fromEntries(UTM_PARAMETERS.map(([param, key]) => [
    key,
    params.get(param) || '',
  ]));
  const hasNewAttribution = Boolean(gclid) || Object.values(utmValues).some(Boolean);

  if (hasNewAttribution) {
    return { gclid, ...utmValues, capturedAt: nowMs };
  }

  return readStoredAttribution(previous, nowMs);
}

export function createTrackingEvent(event, details = {}, attribution = {}, now, id) {
  const stringValue = (value) => typeof value === 'string' ? value : '';
  return {
    eventId: stringValue(id),
    event: stringValue(event),
    timestamp: new Date(now).toISOString(),
    page: stringValue(details.page),
    gclid: stringValue(attribution.gclid),
    utmSource: stringValue(attribution.utmSource),
    utmMedium: stringValue(attribution.utmMedium),
    utmCampaign: stringValue(attribution.utmCampaign),
    utmTerm: stringValue(attribution.utmTerm),
    utmContent: stringValue(attribution.utmContent),
    ip: stringValue(details.ip) || '-',
    referrer: stringValue(details.referrer),
    device: stringValue(details.device),
  };
}
