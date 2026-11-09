const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { loadAppsScript } = require('./helpers/load-apps-script.cjs');

const EVENT_HEADERS = [
  'eventId', 'event', 'timestamp', 'page', 'gclid', 'utmSource', 'utmMedium',
  'utmCampaign', 'utmTerm', 'utmContent', 'ip', 'referrer', 'device',
  'linkedLeadId', 'reviewState'
];
const LEAD_HEADERS = [
  'leadId', 'createdAt', 'customerName', 'phone', 'service', 'projectLocation',
  'projectStatus', 'quoteValue', 'source', 'linkedEventId', 'gclid', 'dpValue',
  'dpTimestamp', 'finalServiceValue', 'completionTimestamp', 'adsTransactionId',
  'conversionAction', 'currency', 'conversionState', 'notes'
];
const AUDIT_HEADERS = ['auditId', 'timestamp', 'actor', 'action', 'recordType', 'recordId', 'details'];

function createServices({ owner = 'owner@example.com', email = 'owner@example.com', sheetId = 'sheet-1', sheets: initialSheets = {} } = {}) {
  const sheets = new Map();
  const calls = { locks: 0, releases: 0, openedIds: [] };

  class MockSheet {
    constructor(name, rows = []) {
      this.name = name;
      this.rows = rows.map((row) => row.slice());
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
        ),
        setValues: (values) => {
          values.forEach((valueRow, rowOffset) => {
            const target = this.rows[row + rowOffset - 1] || [];
            valueRow.forEach((value, columnOffset) => {
              target[column + columnOffset - 1] = value;
            });
            this.rows[row + rowOffset - 1] = target;
          });
          return this;
        },
        setValue: (value) => {
          const target = this.rows[row - 1] || [];
          target[column - 1] = value;
          this.rows[row - 1] = target;
          return this;
        }
      };
    }

    appendRow(row) {
      this.rows.push(row.slice());
      return this;
    }
  }

  Object.entries(initialSheets).forEach(([name, rows]) => sheets.set(name, new MockSheet(name, rows)));
  const mocks = {
    console,
    Session: { getActiveUser: () => ({ getEmail: () => email }) },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => key === 'OWNER_EMAIL' ? owner :
          (key === 'SHEET_ID' ? sheetId : (key === 'CONVERSION_ACTION' ? 'ASeven Offline Conversion' : null))
      })
    },
    Utilities: { getUuid: (() => { let id = 0; return () => `uuid-${++id}`; })() },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => { calls.locks += 1; },
        releaseLock: () => { calls.releases += 1; }
      })
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
    }
  };
  return { mocks, sheets, calls };
}

function loadDashboard(services = createServices()) {
  return { ...services, context: loadAppsScript('apps-script/dashboard/Code.gs', services.mocks).context };
}

test('rejects dashboard calls from a non-owner and blank owner configuration', () => {
  const nonOwner = loadDashboard(createServices({ email: 'other@example.com' }));
  assert.throws(() => nonOwner.context.assertOwner_(), /not authorized/i);
  const blankOwner = loadDashboard(createServices({ owner: '' }));
  assert.throws(() => blankOwner.context.assertOwner_(), /not configured/i);
});

test('initializes the exact shared headers without deleting existing data', () => {
  const priorLead = LEAD_HEADERS.map((_, index) => index === 0 ? 'L-existing' : '');
  const services = loadDashboard(createServices({
    sheets: {
      Leads: [LEAD_HEADERS, priorLead]
    }
  }));
  const result = services.context.getDashboardData();

  assert.equal(result.ok, true);
  assert.deepEqual(Array.from(services.sheets.get('Events').rows[0]), EVENT_HEADERS);
  assert.deepEqual(Array.from(services.sheets.get('Leads').rows[0]), LEAD_HEADERS);
  assert.deepEqual(Array.from(services.sheets.get('Audit').rows[0]), AUDIT_HEADERS);
  assert.equal(services.sheets.get('Leads').rows.length, 2);
});

test('saves and maps a CRM lead using shared Sheet field names', () => {
  const services = loadDashboard();
  const saved = services.context.saveCrmLead({
    name: 'Pak Andi',
    phone: '08123456789',
    service: 'Bore Pile Mesin',
    loc: 'Jakarta Selatan',
    status: 'DP Masuk',
    source: 'ADS',
    gclid: 'AbC123',
    dealVal: 45000000,
    dpVal: 10000000,
    dia: 40,
    depth: 12,
    points: 10,
    soilNotes: 'Catatan lapangan'
  });

  assert.equal(saved.ok, true);
  assert.equal(saved.lead.name, 'Pak Andi');
  assert.equal(saved.lead.dealVal, 45000000);
  assert.equal(saved.lead.gclid, 'AbC123');
  const data = services.context.getDashboardData();
  assert.equal(data.crm[0].id, saved.lead.id);
  assert.equal(data.crm[0].soilNotes, 'Catatan lapangan');
});

test('returns explicit errors for invalid leads and never reports success', () => {
  const services = loadDashboard();
  const result = services.context.saveCrmLead({ name: '', phone: '0812' });
  assert.equal(result.ok, false);
  assert.match(result.error, /nama|prospek/i);
});

test('classifies paid, organic, referral, campaign, and direct events from available evidence', () => {
  const { context } = loadDashboard();
  const classify = (event) => context.eventToDashboard_({
    eventId: 'evt-1',
    event: 'CLICK_WA',
    timestamp: '2026-11-09T08:00:00+07:00',
    page: '/area-layanan/bore-pile/jakarta',
    ...event
  });

  assert.equal(classify({ gclid: 'AbC123', referrer: 'https://google.com/' }).source, 'ADS');
  assert.equal(classify({ referrer: 'https://www.google.com/' }).source, 'SEO');
  assert.equal(classify({ utmMedium: 'organic', utmSource: 'google' }).source, 'SEO');
  assert.equal(classify({ utmMedium: 'organic', utmSource: 'facebook' }).source, 'CAMPAIGN');
  assert.equal(classify({ utmSource: 'google', utmMedium: 'cpc' }).source, 'ADS');
  assert.equal(classify({ utmSource: 'newsletter', utmMedium: 'email' }).source, 'CAMPAIGN');
  assert.equal(classify({ referrer: 'https://example.com/article' }).source, 'REFERRAL');
  assert.equal(classify({ referrer: '-' }).source, 'DIRECT');
});

test('hosted traffic dashboard counts CLICK_WA rows and exposes Direct/referral source filters', () => {
  const html = fs.readFileSync('apps-script/dashboard/Index.html', 'utf8');
  const renderTraffic = html.match(/function renderTraffic\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  const sourceStats = html.match(/function sourceStats\(source\) \{[\s\S]*?\n\}/)?.[0] || '';
  const renderTrafficTable = html.match(/function renderTrafficTable\(\) \{[\s\S]*?\n\}/)?.[0] || '';
  const whatsappHelper = html.match(/function isWhatsAppTrafficEvent\(event\) \{[\s\S]*?\n\}/)?.[0] || '';
  assert.ok(whatsappHelper, 'Expected a WhatsApp event classifier');
  const context = vm.createContext({});
  vm.runInContext(`${whatsappHelper}; this.isWhatsAppTrafficEvent = isWhatsAppTrafficEvent;`, context);

  assert.match(renderTraffic, /tr\.filter\(isWhatsAppTrafficEvent\)/);
  assert.match(sourceStats, /tr\.filter\(isWhatsAppTrafficEvent\)/);
  assert.match(renderTrafficTable, /list = list\.filter\(isWhatsAppTrafficEvent\)/);
  assert.match(renderTraffic, /key:'DIRECT'/);
  assert.match(renderTraffic, /key:'REFERRAL'/);
  assert.match(renderTraffic, /key:'CAMPAIGN'/);
  assert.match(renderTrafficTable, /sourceMeta/);
  assert.equal(context.isWhatsAppTrafficEvent({ eventType: 'CLICK_WA', event: 'Klik WhatsApp' }), true);
  assert.equal(context.isWhatsAppTrafficEvent({ event: 'Chat WhatsApp' }), true);
  assert.equal(context.isWhatsAppTrafficEvent({ eventType: 'CLICK_PHONE', event: 'Klik Telepon' }), false);
});

test('links an event once and rejects reassignment to another lead', () => {
  const services = loadDashboard(createServices({
    sheets: {
      Events: [EVENT_HEADERS, ['evt-1', 'CLICK_WA', '2026-11-09T08:00:00+07:00', '/jakarta', 'AbC123', '', '', '', '', '', '203.0.113.1', '', 'mobile', '', '']],
      Leads: [LEAD_HEADERS,
        ['L-1', '2026-11-09T08:00:00+07:00', 'Pak One', '0811', 'Bore Pile Mesin', 'Jakarta', 'Baru', 0, 'ADS', '', 'AbC123', 0, '', 0, '', '', '', 'IDR', '', '{}'],
        ['L-2', '2026-11-09T08:00:00+07:00', 'Pak Two', '0812', 'Bore Pile Mesin', 'Jakarta', 'Baru', 0, 'ADS', '', '', 0, '', 0, '', '', '', 'IDR', '', '{}']]
    }
  }));
  const linked = services.context.linkEventToLead('evt-1', 'L-1');
  assert.equal(linked.ok, true);
  assert.equal(services.context.linkEventToLead('evt-1', 'L-1').ok, true);
  const rejected = services.context.linkEventToLead('evt-1', 'L-2');
  assert.equal(rejected.ok, false);
  assert.match(rejected.error, /terhubung/i);
  assert.equal(services.sheets.get('Events').rows[1][13], 'L-1');
});

test('returns unlinked events with no lead or conversion creation', () => {
  const services = loadDashboard(createServices({
    sheets: {
      Events: [EVENT_HEADERS, ['evt-1', 'CLICK_WA', '2026-11-09T08:00:00+07:00', '/jakarta', 'AbC123', '', '', '', '', '', '-', '', 'mobile', '', '']]
    }
  }));
  const events = services.context.getUnlinkedEvents();
  assert.equal(events.ok, true);
  assert.equal(events.events.length, 1);
  assert.equal(events.events[0].eventId, 'evt-1');
  assert.equal(services.sheets.get('Leads').rows.length, 1);
});

function linkedLeadSheets({ gclid = 'AbC123', linkedEventId = 'evt-1', conversionState = '' } = {}) {
  return {
    Events: [EVENT_HEADERS, ['evt-1', 'CLICK_WA', '2026-11-09T08:00:00+07:00', '/jakarta', gclid, '', '', '', '', '', '-', '', 'mobile', 'L-1', 'LINKED']],
    Leads: [LEAD_HEADERS, [
      'L-1', '2026-11-09T08:00:00+07:00', 'Pak Satu', '0811', 'Bore Pile Mesin',
      'Jakarta', 'DP Masuk', 45000000, 'ADS', linkedEventId, gclid, 7500000,
      '', 0, '', '', '', 'IDR', conversionState, '{}'
    ]]
  };
}

test('records an initial deposit once with a stable transaction ID and actual timestamp', () => {
  const services = loadDashboard(createServices({ sheets: linkedLeadSheets() }));
  const occurredAt = '2026-11-09T10:15:00+07:00';
  const first = services.context.recordDeposit('L-1', 7500000, occurredAt);
  const duplicate = services.context.recordDeposit('L-1', 7500000, occurredAt);
  assert.equal(first.ok, true);
  assert.equal(first.action.type, 'INITIAL_DP');
  assert.equal(first.action.occurredAt, occurredAt);
  assert.equal(duplicate.ok, true);
  assert.equal(duplicate.action.actionId, first.action.actionId);
  const data = services.context.getDashboardData();
  assert.equal(data.crm[0].adsTransactionId, first.action.transactionId);
  assert.equal(services.context.getPendingAdsActions().actions.length, 1);
});

test('completion prepares a final-value update for the same conversion transaction', () => {
  const { context } = loadAppsScript('apps-script/dashboard/Code.gs', createServices().mocks);
  const action = context.buildCompletionAction_({
    leadId: 'L-1',
    gclid: 'AbC123',
    adsTransactionId: 'TX-L-1',
    conversionAction: 'ASeven Offline Conversion',
    currency: 'IDR',
    dpValue: 7500000
  }, 25000000, '2026-11-09T11:00:00+07:00');
  assert.equal(action.type, 'UPDATE_FINAL_VALUE');
  assert.equal(action.transactionId, 'TX-L-1');
  assert.equal(action.conversionValue, 25000000);
  assert.equal(action.gclid, 'AbC123');
  assert.equal(action.occurredAt, '2026-11-09T11:00:00+07:00');
  assert.equal('ip' in action, false);
});

test('completion without a recorded deposit creates one initial action at completion time', () => {
  const services = loadDashboard(createServices({ sheets: linkedLeadSheets({ conversionState: '' }) }));
  const completedAt = '2026-11-09T15:00:00+07:00';
  const result = services.context.recordProjectCompletion('L-1', 25000000, completedAt);
  assert.equal(result.ok, true);
  assert.equal(result.action.type, 'INITIAL_DP');
  assert.equal(result.action.milestone, 'PROJECT_COMPLETION');
  assert.equal(result.action.conversionValue, 25000000);
  assert.equal(result.action.occurredAt, completedAt);
  assert.equal(services.context.getPendingAdsActions().actions.length, 1);
});

test('completion outside the 54-day restatement window or before DP is visibly blocked', () => {
  const cases = [
    {
      label: 'at the recorded DP time',
      dpAt: '2026-11-09T10:00:00+07:00',
      completedAt: '2026-11-09T10:00:00+07:00',
      reason: /after|setelah/i
    },
    {
      label: 'before the recorded DP',
      dpAt: '2026-11-09T10:00:00+07:00',
      completedAt: '2026-11-09T09:59:59+07:00',
      reason: /after|setelah/i
    },
    {
      label: 'after the restatement window',
      dpAt: '2026-11-09T10:00:00+07:00',
      completedAt: '2027-01-03T10:00:00+07:00',
      reason: /54 days|54 hari/i
    }
  ];

  for (const scenario of cases) {
    const services = loadDashboard(createServices({ sheets: linkedLeadSheets() }));
    services.context.recordDeposit('L-1', 7500000, scenario.dpAt);
    const result = services.context.recordProjectCompletion('L-1', 25000000, scenario.completedAt);
    assert.equal(result.ok, true, scenario.label);
    assert.equal(result.action.status, 'BLOCKED', scenario.label);
    assert.match(result.action.blockedReason, scenario.reason, scenario.label);
    const actions = services.context.getPendingAdsActions().actions;
    const blockedAction = actions.find((action) => action.status === 'BLOCKED');
    assert.ok(blockedAction, scenario.label);
    assert.equal(blockedAction.type, 'UPDATE_FINAL_VALUE', scenario.label);
    assert.equal(actions.filter((action) => action.status === 'PENDING').length, 1, scenario.label);
  }
});

test('does not prepare conversion actions for unlinked, missing, or dummy GCLIDs', () => {
  const missingGclid = loadDashboard(createServices({ sheets: linkedLeadSheets({ gclid: '-' }) }));
  assert.equal(missingGclid.context.recordDeposit('L-1', 1000, '2026-11-09T10:00:00+07:00').ok, false);
  assert.equal(missingGclid.context.getPendingAdsActions().actions.length, 0);

  const unlinked = loadDashboard(createServices({ sheets: linkedLeadSheets({ linkedEventId: '' }) }));
  assert.equal(unlinked.context.recordProjectCompletion('L-1', 1000, '2026-11-09T10:00:00+07:00').ok, false);
  assert.equal(unlinked.context.getPendingAdsActions().actions.length, 0);
});

test('rejects invalid conversion values and timestamps', () => {
  const services = loadDashboard(createServices({ sheets: linkedLeadSheets() }));
  assert.equal(services.context.recordDeposit('L-1', 0, '2026-11-09T10:00:00+07:00').ok, false);
  assert.equal(services.context.recordDeposit('L-1', 1000, 'not-a-date').ok, false);
  assert.equal(services.context.recordProjectCompletion('L-1', -1, '2026-11-09T10:00:00+07:00').ok, false);
});

test('manual export acknowledgement is labeled prepared by owner and returns no IP', () => {
  const services = loadDashboard(createServices({ sheets: linkedLeadSheets() }));
  const created = services.context.recordDeposit('L-1', 7500000, '2026-11-09T10:15:00+07:00');
  const result = services.context.markAdsActionExported(
    created.action.actionId,
    '2026-11-09T12:00:00+07:00',
    'Imported manually'
  );
  assert.equal(result.ok, true);
  assert.equal(result.status, 'PREPARED_BY_OWNER');
  assert.equal('ip' in result, false);
  assert.equal(services.context.getPendingAdsActions().actions.length, 0);
});
