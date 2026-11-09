const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('preview-dashboard.html', 'utf8');

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return '';
  const end = source.indexOf('\n}', start);
  return end < 0 ? '' : source.slice(start, end + 2);
}

function loadFunction(name, globals = {}) {
  const code = functionSource(name);
  assert.ok(code, `Expected ${name} to be defined`);
  const context = vm.createContext(globals);
  vm.runInContext(`${code}; this.result = ${name};`, context);
  return context.result;
}

test('calendar-month filter uses actual dates rather than an arbitrary 7-day window', () => {
  const inRange = loadFunction('inRange', {
    State: { dateRange: 'this_month' },
    Date,
    Number,
    Math
  });
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const priorMonth = new Date(start.getTime() - 1);
  assert.equal(inRange({ timestamp: now.toISOString(), daysAgo: 0 }), true);
  assert.equal(inRange({ timestamp: priorMonth.toISOString(), daysAgo: 0 }), false);
});

test('offline CSV rejects dummy GCLIDs and uses the actual DP or completion timestamp', () => {
  const formatTime = loadFunction('formatAdsConversionTimestamp', { Date });
  const isExportable = loadFunction('isAdsLeadExportable', {
    Date,
    Number,
    formatAdsConversionTimestamp: formatTime,
    isClosed: (lead) => lead.status === 'DP Masuk' || lead.status === 'Selesai'
  });
  assert.equal(isExportable({
    source: 'ADS', status: 'DP Masuk', gclid: 'AbC123',
    dpTimestamp: '2026-11-09T01:02:03.000Z', dpVal: 45000000
  }), true);
  assert.equal(formatTime({
    status: 'DP Masuk', dpTimestamp: '2026-11-09T01:02:03.000Z'
  }), '2026-11-09 08:02:03+07:00');
  assert.equal(isExportable({
    source: 'ADS', status: 'DP Masuk', gclid: 'SIM-test',
    dpTimestamp: '2026-11-09T01:02:03.000Z', dpVal: 45000000
  }), false);
  assert.equal(isExportable({ source: 'ADS', status: 'Selesai', gclid: 'AbC123', dealVal: 1 }), false);
});

test('dashboard declares only one focusPin helper', () => {
  assert.equal((source.match(/function focusPin\(/g) || []).length, 1);
});

test('spend modal closes on backdrop clicks without bubbling from its card', () => {
  assert.match(source, /id="spend-modal"[^>]*onclick="closeSpendModal\(\)"/);
  assert.match(source, /<div class="modal" onclick="event\.stopPropagation\(\)">/);
});

test('numeric tab shortcuts are blocked while an overlay or drawer is open', () => {
  assert.match(source, /\^\[1-7\]\$\/\.test\(e\.key\)[\s\S]{0,180}modal-backdrop\.open[\s\S]{0,120}return;/);
});

test('mobile navigation shows horizontal overflow affordance below 480px', () => {
  const mobile = source.match(/@media\s*\(max-width:\s*480px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(mobile, 'Expected a narrow-mobile navigation rule');
  assert.match(mobile[1], /overflow-x:\s*auto/);
  assert.match(mobile[1], /scrollbar-width:\s*thin|::-webkit-scrollbar-thumb|linear-gradient/);
});

test('CRM total deal can be entered directly and is not locked behind technical details', () => {
  const drawer = source.slice(source.indexOf("$('#drawer-body').innerHTML = `"), source.indexOf('`;', source.indexOf("$('#drawer-body').innerHTML = `")));
  assert.match(drawer, /Nilai (?:Total )?(?:Proyek|Kontrak Deal).*?data-field="dealVal"/s);
  const amountInput = drawer.match(/<input[^>]*data-field="dealVal"[^>]*>/);
  assert.ok(amountInput);
  assert.doesNotMatch(amountInput[0], /\b(?:disabled|readonly)\b/i);
});

test('optional project calculator applies enabled add-ons without changing manual totals otherwise', () => {
  const drawer = source.slice(source.indexOf("$('#drawer-body').innerHTML = `"), source.indexOf('`;', source.indexOf("$('#drawer-body').innerHTML = `")));
  assert.match(drawer, /<details[^>]*class="[^"]*calc-details/);
  assert.match(drawer, /Mob-demob/);
  assert.match(drawer, /Sedot lumpur/);
  assert.match(drawer, /Bak sirkulasi/);
  assert.match(drawer, /material/i);
  assert.match(drawer, /\+ Tambah Biaya Kustom/);
  assert.match(drawer, /Terapkan ke Total/);
  const calculateTotal = loadFunction('calculateProjectTotal', { Number });
  assert.equal(calculateTotal(40000000, [3500000, 1500000]), 45000000);
});

test('CRM never fabricates GCLIDs', () => {
  assert.doesNotMatch(source, /function generateSimulatedGclid|generateSimulatedGclid\(/);
});

test('hosted dashboard loads and writes live data through explicit Apps Script handlers', () => {
  assert.match(source, /function loadDashboardData\(/);
  assert.match(source, /withSuccessHandler/);
  assert.match(source, /withFailureHandler/);
  assert.match(source, /getDashboardData/);
  assert.match(source, /runDashboardCall\(['"]saveCrmLead['"]/);
  assert.match(source, /runDashboardCall\(['"]linkEventToLead['"]/);
  assert.match(source, /PREVIEW DATA/);
});

test('Ads conversion exports use the official initial and restatement column shapes', () => {
  const formatTime = loadFunction('formatGoogleAdsActionTime', { Date });
  const buildRows = loadFunction('buildAdsActionCsv', {
    formatGoogleAdsActionTime: formatTime
  });
  const initial = buildRows({
    type: 'INITIAL_DP',
    gclid: 'AbC123',
    conversionAction: 'ASeven Offline Conversion',
    transactionId: 'TX-1',
    occurredAt: '2026-11-09T01:02:03.000Z',
    conversionValue: 7500000,
    currency: 'IDR'
  });
  assert.deepEqual(Array.from(initial[0]), [
    'Google Click ID', 'Conversion Name', 'Conversion Time',
    'Conversion Value', 'Conversion Currency', 'Order ID'
  ]);
  assert.equal(initial[1][2], '2026-11-09 08:02:03+07:00');
  assert.equal(initial[1][5], 'TX-1');

  const adjustment = buildRows({
    type: 'UPDATE_FINAL_VALUE',
    gclid: 'AbC123',
    conversionAction: 'ASeven Offline Conversion',
    transactionId: 'TX-1',
    occurredAt: '2026-11-10T01:02:03.000Z',
    conversionValue: 25000000,
    currency: 'IDR',
    ip: '203.0.113.1'
  });
  assert.deepEqual(Array.from(adjustment[0]), [
    'Order ID', 'Conversion Name', 'Adjustment Time',
    'Adjustment Type', 'Adjusted Value', 'Adjusted Value Currency'
  ]);
  assert.deepEqual(Array.from(adjustment[1]), [
    'TX-1', 'ASeven Offline Conversion', '2026-11-10 08:02:03+0700',
    'RESTATE', 25000000, 'IDR'
  ]);
  assert.equal(JSON.stringify(adjustment).includes('203.0.113.1'), false);
});

test('blocked Ads adjustments cannot be exported or confirmed as imported', () => {
  const renderer = functionSource('renderConversionActions');
  assert.match(renderer, /action\.status === 'BLOCKED'/);
  assert.match(renderer, /blockedReason/);
  const exporter = functionSource('exportAdsAction');
  assert.match(exporter, /action\.status !== 'PENDING'/);
  const confirmation = functionSource('confirmAdsActionImported');
  assert.match(confirmation, /action\.status !== 'PENDING'/);
});

test('CRM milestone writes preserve the actual timestamps entered by the owner', () => {
  const saveLead = functionSource('saveLead');
  const quickStatus = functionSource('quickUpdateLeadStatus');
  assert.match(saveLead, /savedLead\.dpTimestamp \|\| lead\.dpTimestamp \|\| new Date\(\)\.toISOString\(\)/);
  assert.match(saveLead, /savedLead\.completionTimestamp \|\| lead\.completionTimestamp \|\| new Date\(\)\.toISOString\(\)/);
  assert.match(quickStatus, /savedLead\.dpTimestamp \|\| updated\.dpTimestamp \|\| new Date\(\)\.toISOString\(\)/);
  assert.match(quickStatus, /savedLead\.completionTimestamp \|\| updated\.completionTimestamp \|\| new Date\(\)\.toISOString\(\)/);
});
