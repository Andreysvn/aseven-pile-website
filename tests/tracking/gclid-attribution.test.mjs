import test from 'node:test';
import assert from 'node:assert/strict';
import { captureAttribution, createTrackingEvent } from '../../src/scripts/gclid-attribution.js';

test('captures only an actual GCLID and preserves its case', () => {
  const result = captureAttribution('?gclid=AbC123&utm_source=google', 1000, null);
  assert.equal(result.gclid, 'AbC123');
  assert.equal(result.utmSource, 'google');
  assert.equal(result.capturedAt, 1000);
  assert.equal(captureAttribution('', 1000, null).gclid, '');
  assert.equal(captureAttribution('?GCLID=AbC123', 1000, null).gclid, '');
});

test('a later actual paid click replaces earlier attribution', () => {
  const previous = {
    gclid: 'EarlierClick',
    utmSource: 'old-source',
    capturedAt: 1000,
  };
  const result = captureAttribution('?gclid=NewClick&utm_campaign=spring', 2000, previous);

  assert.equal(result.gclid, 'NewClick');
  assert.equal(result.utmSource, '');
  assert.equal(result.utmCampaign, 'spring');
  assert.equal(result.capturedAt, 2000);
});

test('does not reuse expired attribution', () => {
  const old = { gclid: 'OldClick', capturedAt: 1 };
  assert.equal(captureAttribution('', 1 + 90 * 86400000, old).gclid, 'OldClick');
  assert.equal(captureAttribution('', 1000 + 91 * 86400000, old).gclid, '');
});

test('does not add IP to an Ads conversion payload', () => {
  const event = createTrackingEvent(
    'CLICK_WA',
    { ip: '203.0.113.8', page: '/kontak', referrer: 'https://example.test', device: 'Mobile' },
    { gclid: 'AbC123', utmSource: 'google' },
    1000,
    'evt-1',
  );

  assert.equal(event.event, 'CLICK_WA');
  assert.equal(event.eventId, 'evt-1');
  assert.equal(event.timestamp, new Date(1000).toISOString());
  assert.equal(event.ip, '203.0.113.8');
  assert.equal(event.gclid, 'AbC123');
  assert.equal(event.utmSource, 'google');
  assert.equal('conversionValue' in event, false);
  assert.deepEqual(Object.keys(event).sort(), [
    'device', 'event', 'eventId', 'gclid', 'ip', 'page', 'referrer',
    'timestamp', 'utmCampaign', 'utmContent', 'utmMedium', 'utmSource', 'utmTerm',
  ].sort());
});

test('does not fabricate click identifiers for organic traffic', () => {
  const result = captureAttribution('', 1000, null);
  assert.equal(result.gclid, '');
  const event = createTrackingEvent('LANDING', {}, result, 1000, 'evt-organic');
  assert.equal(event.gclid, '');
  assert.equal(event.ip, '-');
});
