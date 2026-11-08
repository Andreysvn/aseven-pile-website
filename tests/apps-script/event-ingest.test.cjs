const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppsScript } = require('./helpers/load-apps-script.cjs');

const HEADER = [
  'eventId', 'event', 'timestamp', 'page', 'gclid', 'utmSource', 'utmMedium',
  'utmCampaign', 'utmTerm', 'utmContent', 'ip', 'referrer', 'device',
  'linkedLeadId', 'reviewState'
];

function createServices({ sheetId = 'configured-sheet-id', existingSheets = {} } = {}) {
  const sheets = new Map();
  const calls = { openedIds: [], lockWaits: 0, lockReleases: 0 };

  class MockSheet {
    constructor(name, rows = []) {
      this.name = name;
      this.rows = rows.map((row) => row.slice());
    }

    appendRow(row) {
      this.rows.push(row.slice());
      return this;
    }

    getLastRow() {
      return this.rows.length;
    }

    getLastColumn() {
      return this.rows.reduce((max, row) => Math.max(max, row.length), 0);
    }

    getRange(row, column, numRows = 1, numColumns = 1) {
      return {
        getValues: () => Array.from({ length: numRows }, (_, rowOffset) =>
          Array.from({ length: numColumns }, (_, columnOffset) =>
            this.rows[row + rowOffset - 1]?.[column + columnOffset - 1] ?? ''
          )
        )
      };
    }
  }

  for (const [name, rows] of Object.entries(existingSheets)) {
    sheets.set(name, new MockSheet(name, rows));
  }

  const mocks = {
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (key) => key === 'SHEET_ID' ? sheetId : null })
    },
    SpreadsheetApp: {
      openById: (id) => {
        calls.openedIds.push(id);
        return {
          getSheetByName: (name) => sheets.get(name) || null,
          insertSheet: (name) => {
            const sheet = new MockSheet(name);
            sheets.set(name, sheet);
            return sheet;
          }
        };
      }
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => { calls.lockWaits += 1; },
        releaseLock: () => { calls.lockReleases += 1; }
      })
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({
        getContent: () => text,
        setMimeType(mimeType) {
          this.mimeType = mimeType;
          return this;
        }
      })
    }
  };

  return { mocks, sheets, calls };
}

function post(context, payload) {
  return JSON.parse(context.doPost({ postData: { contents: JSON.stringify(payload) } }).getContent());
}

const validEvent = (overrides = {}) => ({
  eventId: 'evt-1',
  event: 'CLICK_WA',
  timestamp: '2026-11-09T01:00:00.000Z',
  page: '/area-layanan/bore-pile/jakarta',
  gclid: 'AbC123',
  ip: '203.0.113.8',
  ...overrides
});

test('accepts a WhatsApp click with an original case-sensitive GCLID', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  const event = context.validateEvent_(validEvent());
  assert.equal(event.gclid, 'AbC123');
  assert.equal(event.event, 'CLICK_WA');
});

test('rejects unknown event types, missing IDs, unknown keys, and overlong fields', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  assert.throws(() => context.validateEvent_(validEvent({ event: 'MAKE_LEAD' })));
  assert.throws(() => context.validateEvent_(validEvent({ eventId: '' })));
  assert.throws(() => context.validateEvent_({ event: 'CLICK_WA' }));
  assert.throws(() => context.validateEvent_(validEvent({ sheetId: 'attacker-value' })));
  assert.throws(() => context.validateEvent_(validEvent({ page: `/${'x'.repeat(2048)}` })));
});

test('enforces every string field maximum', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  const overlong = [
    ['eventId', 'e'.repeat(129)],
    ['event', 'x'.repeat(33)],
    ['timestamp', 'x'.repeat(41)],
    ['page', 'p'.repeat(2049)],
    ['gclid', 'g'.repeat(513)],
    ['utmSource', 's'.repeat(257)],
    ['utmMedium', 'm'.repeat(257)],
    ['utmCampaign', 'c'.repeat(257)],
    ['utmTerm', 't'.repeat(257)],
    ['utmContent', 'c'.repeat(257)],
    ['ip', '1'.repeat(65)],
    ['referrer', 'r'.repeat(2049)],
    ['device', 'd'.repeat(129)]
  ];
  for (const [field, value] of overlong) {
    assert.throws(() => context.validateEvent_(validEvent({ [field]: value })));
  }
  for (const name of ['LANDING', 'CLICK_WA', 'CLICK_PHONE']) {
    assert.equal(context.validateEvent_(validEvent({ event: name })).event, name);
  }
});

test('requires bounded strings and a parseable ISO timestamp with explicit timezone', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  assert.throws(() => context.validateEvent_(validEvent({ timestamp: '2026-11-09T01:00:00' })));
  assert.throws(() => context.validateEvent_(validEvent({ timestamp: '2026-02-30T01:00:00Z' })));
  assert.throws(() => context.validateEvent_(validEvent({ gclid: ['AbC123'] })));
  assert.throws(() => context.validateEvent_(validEvent({ device: { type: 'mobile' } })));
  assert.throws(() => context.validateEvent_(validEvent({ utmSource: 's'.repeat(257) })));
  const value = '2026-11-09T08:00:00.123+07:00';
  assert.equal(context.validateEvent_(validEvent({ timestamp: value })).timestamp, value);
});

test('rejects malformed, non-object, and oversized UTF-8 request bodies explicitly', () => {
  const services = createServices();
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const malformed = context.doPost({ postData: { contents: '{not json' } });
  assert.equal(JSON.parse(malformed.getContent()).status, 'error');
  const oversizedPayload = validEvent({
    eventId: 'e'.repeat(128),
    page: `/${'界'.repeat(2047)}`,
    gclid: 'g'.repeat(512),
    utmSource: 's'.repeat(256),
    utmMedium: 'm'.repeat(256),
    utmCampaign: 'c'.repeat(256),
    utmTerm: 't'.repeat(256),
    utmContent: 'c'.repeat(256),
    ip: '1'.repeat(64),
    referrer: 'r'.repeat(2048),
    device: 'd'.repeat(128)
  });
  const result = post(context, oversizedPayload);
  assert.equal(result.status, 'error');
  assert.match(result.error, /too large/i);
  assert.equal(services.sheets.size, 0);
});

test('rejects requests containing keys outside the event-field allowlist', () => {
  const services = createServices();
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const result = post(context, validEvent({ sheetId: 'attacker-sheet' }));
  assert.equal(result.status, 'error');
  assert.match(result.error, /unsupported|unknown|field/i);
  assert.deepEqual(services.calls.openedIds, []);
});

test('creates only Events and appends the exact shared row with dashboard cells blank', () => {
  const services = createServices();
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const event = validEvent({ event: 'CLICK_WA', utmSource: 'google', device: 'mobile' });
  const result = post(context, event);
  const sheet = services.sheets.get('Events');
  assert.equal(result.status, 'accepted');
  assert.equal(result.eventId, event.eventId);
  assert.deepEqual(services.calls.openedIds, ['configured-sheet-id']);
  assert.deepEqual(Array.from(sheet.rows[0]), HEADER);
  assert.deepEqual(Array.from(sheet.rows[1]), [
    event.eventId, event.event, event.timestamp, event.page, event.gclid,
    'google', '', '', '', '', event.ip, '', 'mobile', '', ''
  ]);
  assert.deepEqual([...services.sheets.keys()], ['Events']);
});

test('deduplicates event IDs while holding the script lock', () => {
  const services = createServices({ existingSheets: { Events: [HEADER] } });
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const event = validEvent();
  assert.equal(post(context, event).status, 'accepted');
  assert.equal(post(context, event).status, 'duplicate');
  assert.equal(services.sheets.get('Events').rows.length, 2);
  assert.equal(services.calls.lockWaits, 2);
  assert.equal(services.calls.lockReleases, 2);
});

test('does not rewrite an incompatible Events header', () => {
  const incompatible = [['event', 'eventId', 'timestamp']];
  const services = createServices({ existingSheets: { Events: incompatible } });
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const result = post(context, validEvent());
  assert.equal(result.status, 'error');
  assert.match(result.error, /header/i);
  assert.deepEqual(services.sheets.get('Events').rows, incompatible);
});

test('does not expose internal spreadsheet errors to the public caller', () => {
  const services = createServices();
  services.mocks.SpreadsheetApp.openById = () => { throw new Error('private spreadsheet detail'); };
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const result = post(context, validEvent());
  assert.equal(result.status, 'error');
  assert.equal(result.error, 'Event could not be recorded.');
  assert.doesNotMatch(JSON.stringify(result), /private spreadsheet detail/);
});

test('returns an explicit configuration error when SHEET_ID is absent', () => {
  const services = createServices({ sheetId: null });
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs', services.mocks);
  const result = post(context, validEvent());
  assert.equal(result.status, 'error');
  assert.match(result.error, /SHEET_ID/i);
  assert.deepEqual(services.calls.openedIds, []);
});

test('never exposes read, dashboard, or CRM endpoint methods', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  assert.equal(typeof context.doGet, 'undefined');
  assert.equal(typeof context.getSheetData, 'undefined');
  assert.equal(typeof context.createLead, 'undefined');
});