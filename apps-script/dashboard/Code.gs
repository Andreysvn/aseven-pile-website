var EVENT_HEADERS_ = [
  'eventId', 'event', 'timestamp', 'page', 'gclid', 'utmSource', 'utmMedium',
  'utmCampaign', 'utmTerm', 'utmContent', 'ip', 'referrer', 'device',
  'linkedLeadId', 'reviewState'
];
var LEAD_HEADERS_ = [
  'leadId', 'createdAt', 'customerName', 'phone', 'service', 'projectLocation',
  'projectStatus', 'quoteValue', 'source', 'linkedEventId', 'gclid', 'dpValue',
  'dpTimestamp', 'finalServiceValue', 'completionTimestamp', 'adsTransactionId',
  'conversionAction', 'currency', 'conversionState', 'notes'
];
var AUDIT_HEADERS_ = ['auditId', 'timestamp', 'actor', 'action', 'recordType', 'recordId', 'details'];
var MAX_ADJUSTMENT_AGE_MS_ = 54 * 24 * 60 * 60 * 1000;
var FORM_NOTE_FIELDS_ = [
  'address', 'rigId', 'dia', 'depth', 'depthActual', 'points', 'unitPrice',
  'dpVal', 'piutangVal', 'payStatus', 'campaign', 'keyword', 'page', 'soilNotes'
];

function doGet() {
  assertOwner_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ASeven Pile — Dashboard');
}

function assertOwner_() {
  var properties = PropertiesService.getScriptProperties();
  var configuredOwner = String(properties.getProperty('OWNER_EMAIL') || '').trim().toLowerCase();
  if (!configuredOwner) {
    throw publicError_('Dashboard owner is not configured.');
  }
  var activeEmail = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!activeEmail || activeEmail !== configuredOwner) {
    throw publicError_('You are not authorized to access this dashboard.');
  }
  return activeEmail;
}

function getDashboardData(filterFrom, filterTo) {
  return runApi_(function () {
    var actor = assertOwner_();
    var tables = getTables_();
    var from = filterFrom ? parseTimestamp_(filterFrom, 'filterFrom') : null;
    var to = filterTo ? parseTimestamp_(filterTo, 'filterTo') : null;
    if (from && to && from.getTime() > to.getTime()) {
      throw publicError_('Date range start must not be after its end.');
    }

    return {
      ok: true,
      traffic: tables.Events.rows.map(eventToDashboard_).filter(function (event) {
        return isWithinRange_(event.timestamp, from, to);
      }),
      crm: tables.Leads.rows.map(leadToDashboard_).filter(function (lead) {
        return isWithinRange_(lead.createdAt, from, to);
      }),
      audit: tables.Audit.rows.map(auditToDashboard_),
      freshness: {
        traffic: 'LIVE',
        crm: 'LIVE',
        adsSpend: 'PREVIEW DATA',
        seo: 'PREVIEW DATA',
        content: 'PREVIEW DATA',
        armada: 'PREVIEW DATA'
      },
      actor: actor
    };
  });
}

function saveCrmLead(leadData) {
  return runApi_(function () {
    var actor = assertOwner_();
    var input = validateLeadInput_(leadData);
    return withLock_(function () {
      var tables = getTables_();
      var existing = input.id ? findRow_(tables.Leads, 'leadId', input.id) : null;
      if (input.id && !existing) {
        throw publicError_('Prospek tidak ditemukan.');
      }

      var now = new Date().toISOString();
      var leadId = existing ? input.id : 'L-' + Utilities.getUuid();
      var prior = existing ? rowObject_(tables.Leads, existing.values) : {};
      var formNotes = existing ? parseNotes_(prior.notes) : {};
      FORM_NOTE_FIELDS_.forEach(function (field) {
        if (Object.prototype.hasOwnProperty.call(input, field)) {
          formNotes[field] = input[field];
        }
      });
      formNotes.operatorNotes = input.operatorNotes || formNotes.operatorNotes || '';
      var row = [
        leadId,
        existing ? prior.createdAt : now,
        input.name,
        input.phone,
        input.service,
        input.loc,
        input.status,
        input.dealVal,
        input.source,
        prior.linkedEventId || '',
        input.gclid,
        input.dpVal,
        prior.dpTimestamp || '',
        prior.finalServiceValue || 0,
        prior.completionTimestamp || '',
        prior.adsTransactionId || '',
        prior.conversionAction || '',
        prior.currency || 'IDR',
        prior.conversionState || '',
        JSON.stringify(formNotes)
      ];

      writeRow_(tables.Leads, existing ? existing.rowNumber : tables.Leads.sheet.getLastRow() + 1, row);
      audit_(tables.Audit, actor, existing ? 'UPDATE_LEAD' : 'CREATE_LEAD', 'LEAD', leadId, {
        projectStatus: input.status,
        source: input.source
      });
      return { ok: true, lead: leadToDashboard_(rowObject_(tables.Leads, row)) };
    });
  });
}

function getUnlinkedEvents() {
  return runApi_(function () {
    assertOwner_();
    var tables = getTables_();
    return {
      ok: true,
      events: tables.Events.rows
        .filter(function (event) { return !event.linkedLeadId; })
        .map(eventToDashboard_)
    };
  });
}

function linkEventToLead(eventId, leadId) {
  return runApi_(function () {
    var actor = assertOwner_();
    if (!isBoundedString_(eventId, 128) || !isBoundedString_(leadId, 128)) {
      throw publicError_('Event dan prospek harus dipilih.');
    }
    return withLock_(function () {
      var tables = getTables_();
      var event = findRow_(tables.Events, 'eventId', eventId);
      var lead = findRow_(tables.Leads, 'leadId', leadId);
      if (!event) throw publicError_('Event tidak ditemukan.');
      if (event.values.event !== 'CLICK_WA') {
        throw publicError_('Hanya event klik WhatsApp yang dapat dicocokkan ke prospek.');
      }
      if (!lead) throw publicError_('Prospek tidak ditemukan.');
      var linkedLeadId = String(event.values.linkedLeadId || '');
      if (linkedLeadId && linkedLeadId !== leadId) {
        throw publicError_('Event sudah terhubung ke prospek lain. Lepaskan tautan lama terlebih dahulu.');
      }
      if (lead.values.linkedEventId && lead.values.linkedEventId !== eventId) {
        throw publicError_('Prospek sudah memiliki event tertaut. Lepaskan tautan lama terlebih dahulu.');
      }

      var eventRow = event.values._row.slice();
      eventRow[13] = leadId;
      eventRow[14] = 'LINKED';
      writeRow_(tables.Events, event.rowNumber, eventRow);

      var leadRow = lead.values._row.slice();
      leadRow[9] = eventId;
      if (event.values.gclid && !isDummyGclid_(event.values.gclid)) {
        leadRow[10] = event.values.gclid;
        leadRow[8] = 'ADS';
      }
      writeRow_(tables.Leads, lead.rowNumber, leadRow);
      audit_(tables.Audit, actor, 'LINK_EVENT', 'EVENT', eventId, { leadId: leadId });
      return { ok: true, eventId: eventId, leadId: leadId };
    });
  });
}

function recordDeposit(leadId, amount, occurredAt) {
  return runApi_(function () {
    var actor = assertOwner_();
    var value = positiveAmount_(amount, 'DP');
    var timestamp = validateConversionTimestamp_(occurredAt);
    return withLock_(function () {
      var tables = getTables_();
      var row = findRow_(tables.Leads, 'leadId', leadId);
      if (!row) throw publicError_('Prospek tidak ditemukan.');
      var adsLead = assertAdsLead_(tables, row.values);
      var conversionAction = getConversionAction_(row.values);
      var state = parseConversionState_(row.values.conversionState);
      if (state.initial) {
        if (Number(state.initial.conversionValue) === value && state.initial.occurredAt === timestamp) {
          return { ok: true, action: sanitizeAction_(state.initial) };
        }
        throw publicError_('DP awal sudah tercatat. Nilai atau waktunya tidak dapat diganti tanpa meninjau konversi yang sudah ada.');
      }

      var transactionId = String(adsLead.adsTransactionId || '') || 'TX-' + Utilities.getUuid();
      var action = createConversionAction_({
        type: 'INITIAL_DP',
        milestone: 'DEPOSIT',
        lead: adsLead,
        transactionId: transactionId,
        conversionAction: conversionAction,
        value: value,
        occurredAt: timestamp
      });
      state.initial = action;
      var leadRow = row.values._row.slice();
      leadRow[11] = value;
      leadRow[12] = timestamp;
      leadRow[15] = transactionId;
      leadRow[16] = conversionAction;
      leadRow[17] = 'IDR';
      leadRow[18] = JSON.stringify(state);
      writeRow_(tables.Leads, row.rowNumber, leadRow);
      audit_(tables.Audit, actor, 'RECORD_DEPOSIT', 'LEAD', leadId, {
        value: value,
        occurredAt: timestamp,
        transactionId: transactionId
      });
      return { ok: true, action: sanitizeAction_(action) };
    });
  });
}

function recordProjectCompletion(leadId, finalServiceValue, completedAt) {
  return runApi_(function () {
    var actor = assertOwner_();
    var value = positiveAmount_(finalServiceValue, 'Nilai final proyek');
    var timestamp = validateConversionTimestamp_(completedAt);
    return withLock_(function () {
      var tables = getTables_();
      var row = findRow_(tables.Leads, 'leadId', leadId);
      if (!row) throw publicError_('Prospek tidak ditemukan.');
      var adsLead = assertAdsLead_(tables, row.values);
      var conversionAction = getConversionAction_(row.values);
      var state = parseConversionState_(row.values.conversionState);
      var transactionId = String(adsLead.adsTransactionId || '') || 'TX-' + Utilities.getUuid();
      var action;
      if (state.initial) {
        var completedAction = buildCompletionAction_({
          leadId: adsLead.leadId,
          gclid: adsLead.gclid,
          adsTransactionId: transactionId,
          conversionAction: conversionAction,
          currency: 'IDR'
        }, value, timestamp);
        var previousUpdate = state.update;
        if (previousUpdate &&
            Number(previousUpdate.conversionValue) === value &&
            previousUpdate.occurredAt === timestamp) {
          return { ok: true, action: sanitizeAction_(previousUpdate) };
        }
        completedAction.actionId = 'C-' + Utilities.getUuid();
        var blockedReason = adjustmentBlockReason_(state.initial.occurredAt, timestamp);
        completedAction.status = blockedReason ? 'BLOCKED' : 'PENDING';
        if (blockedReason) completedAction.blockedReason = blockedReason;
        action = completedAction;
        state.update = action;
      } else {
        action = createConversionAction_({
          type: 'INITIAL_DP',
          milestone: 'PROJECT_COMPLETION',
          lead: adsLead,
          transactionId: transactionId,
          conversionAction: conversionAction,
          value: value,
          occurredAt: timestamp
        });
        state.initial = action;
      }

      var leadRow = row.values._row.slice();
      leadRow[6] = 'Selesai';
      leadRow[13] = value;
      leadRow[14] = timestamp;
      leadRow[15] = transactionId;
      leadRow[16] = conversionAction;
      leadRow[17] = 'IDR';
      leadRow[18] = JSON.stringify(state);
      writeRow_(tables.Leads, row.rowNumber, leadRow);
      audit_(tables.Audit, actor, 'RECORD_COMPLETION', 'LEAD', leadId, {
        value: value,
        completedAt: timestamp,
        transactionId: transactionId,
        actionType: action.type
      });
      return { ok: true, action: sanitizeAction_(action) };
    });
  });
}

function getPendingAdsActions() {
  return runApi_(function () {
    assertOwner_();
    var tables = getTables_();
    var actions = [];
    tables.Leads.rows.forEach(function (row) {
      if (!row.linkedEventId || isDummyGclid_(row.gclid)) return;
      var state = parseConversionState_(row.conversionState);
      ['initial', 'update'].forEach(function (key) {
        var action = state[key];
        if (action && (action.status === 'PENDING' || action.status === 'BLOCKED') &&
            action.gclid === row.gclid && action.transactionId === row.adsTransactionId) {
          actions.push(sanitizeAction_(action));
        }
      });
    });
    actions.sort(function (a, b) {
      return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
    });
    return { ok: true, actions: actions };
  });
}

function markAdsActionExported(actionId, exportedAt, operatorNote) {
  return runApi_(function () {
    var actor = assertOwner_();
    if (!isBoundedString_(actionId, 128)) throw publicError_('Conversion action ID is required.');
    var timestamp = validateConversionTimestamp_(exportedAt);
    var note = cleanString_(operatorNote, 1000);
    return withLock_(function () {
      var tables = getTables_();
      for (var index = 0; index < tables.Leads.rows.length; index += 1) {
        var row = tables.Leads.rows[index];
        var state = parseConversionState_(row.conversionState);
        var matchKey = state.initial && state.initial.actionId === actionId
          ? 'initial'
          : (state.update && state.update.actionId === actionId ? 'update' : '');
        if (!matchKey) continue;
        var action = state[matchKey];
        if (action.status !== 'PENDING') {
          throw publicError_('Hanya konversi berstatus PENDING yang dapat ditandai sebagai impor manual.');
        }
        action.status = 'PREPARED_BY_OWNER';
        action.exportedAt = timestamp;
        action.operatorNote = note;
        var leadRow = row._row.slice();
        leadRow[18] = JSON.stringify(state);
        writeRow_(tables.Leads, index + 2, leadRow);
        audit_(tables.Audit, actor, 'OWNER_MARKED_ADS_EXPORT', 'CONVERSION', actionId, {
          exportedAt: timestamp,
          note: note
        });
        return { ok: true, status: 'PREPARED_BY_OWNER', actionId: actionId };
      }
      throw publicError_('Conversion action tidak ditemukan.');
    });
  });
}

function buildCompletionAction_(lead, finalServiceValue, completedAt) {
  var timestamp = validateConversionTimestamp_(completedAt);
  var value = positiveAmount_(finalServiceValue, 'Nilai final proyek');
  var transactionId = String(lead.adsTransactionId || '') || 'TX-' + String(lead.leadId || 'lead');
  return {
    actionId: '',
    type: 'UPDATE_FINAL_VALUE',
    milestone: 'PROJECT_COMPLETION',
    leadId: String(lead.leadId || ''),
    gclid: String(lead.gclid || ''),
    conversionAction: String(lead.conversionAction || ''),
    transactionId: transactionId,
    occurredAt: timestamp,
    conversionValue: value,
    currency: String(lead.currency || 'IDR')
  };
}

function createConversionAction_(options) {
  return {
    actionId: 'C-' + Utilities.getUuid(),
    type: options.type,
    milestone: options.milestone,
    leadId: String(options.lead.leadId || ''),
    gclid: String(options.lead.gclid || ''),
    conversionAction: options.conversionAction,
    transactionId: options.transactionId,
    occurredAt: options.occurredAt,
    conversionValue: options.value,
    currency: 'IDR',
    status: 'PENDING'
  };
}

function assertAdsLead_(tables, lead) {
  if (!lead.linkedEventId || isDummyGclid_(lead.gclid)) {
    throw publicError_('Tautkan prospek ke klik WhatsApp ber-GCLID nyata sebelum menyiapkan konversi.');
  }
  var event = findRow_(tables.Events, 'eventId', lead.linkedEventId);
  if (!event || event.values.event !== 'CLICK_WA' ||
      event.values.linkedLeadId !== lead.leadId ||
      isDummyGclid_(event.values.gclid) ||
      event.values.gclid !== lead.gclid) {
    throw publicError_('Prospek belum terhubung ke event klik WhatsApp ber-GCLID yang valid.');
  }
  return leadToDashboard_(lead);
}

function getConversionAction_(lead) {
  var configured = String(lead.conversionAction || PropertiesService.getScriptProperties().getProperty('CONVERSION_ACTION') || '').trim();
  if (!configured) {
    throw publicError_('CONVERSION_ACTION belum dikonfigurasi dengan nama conversion action Google Ads.');
  }
  if (configured.length > 200) throw publicError_('Nama conversion action terlalu panjang.');
  return configured;
}

function parseConversionState_(value) {
  if (!value) return {};
  try {
    var state = JSON.parse(String(value));
    return state && typeof state === 'object' && !Array.isArray(state) ? state : {};
  } catch (error) {
    throw publicError_('Status konversi pada Sheet tidak valid. Periksa data sebelum melanjutkan.');
  }
}

function positiveAmount_(value, label) {
  var amount = Number(value);
  if (!isFinite(amount) || amount <= 0) {
    throw publicError_(label + ' harus lebih besar dari nol.');
  }
  return amount;
}

function validateConversionTimestamp_(value) {
  if (typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) ||
      !isFinite(new Date(value).getTime())) {
    throw publicError_('Waktu konversi harus berupa timestamp ISO-8601 dengan zona waktu.');
  }
  return value;
}

function adjustmentBlockReason_(initialAt, completedAt) {
  var initialTime = new Date(initialAt).getTime();
  var completedTime = new Date(completedAt).getTime();
  if (!isFinite(initialTime) || !isFinite(completedTime)) {
    return 'Waktu konversi awal atau penyelesaian tidak valid; tinjau timestamp di Sheet.';
  }
  if (completedTime <= initialTime) {
    return 'Waktu penyelesaian harus setelah konversi DP awal.';
  }
  if (completedTime - initialTime > MAX_ADJUSTMENT_AGE_MS_) {
    return 'Update nilai final melewati jendela penyesuaian 54 hari Google Ads.';
  }
  return '';
}

function sanitizeAction_(action) {
  return {
    actionId: String(action.actionId || ''),
    type: String(action.type || ''),
    milestone: String(action.milestone || ''),
    leadId: String(action.leadId || ''),
    gclid: String(action.gclid || ''),
    conversionAction: String(action.conversionAction || ''),
    transactionId: String(action.transactionId || ''),
    occurredAt: String(action.occurredAt || ''),
    conversionValue: Number(action.conversionValue) || 0,
    currency: String(action.currency || 'IDR'),
    status: String(action.status || 'PENDING'),
    blockedReason: String(action.blockedReason || '')
  };
}

function getTables_() {
  var sheetId = String(PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '').trim();
  if (!sheetId) throw publicError_('Shared Sheet ID is not configured.');
  var spreadsheet = SpreadsheetApp.openById(sheetId);
  return {
    Events: getTable_(spreadsheet, 'Events', EVENT_HEADERS_),
    Leads: getTable_(spreadsheet, 'Leads', LEAD_HEADERS_),
    Audit: getTable_(spreadsheet, 'Audit', AUDIT_HEADERS_)
  };
}

function getTable_(spreadsheet, name, headers) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var lastColumn = sheet.getLastColumn();
    var actual = lastColumn ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0] : [];
    if (actual.length !== headers.length || headers.some(function (header, index) {
      return actual[index] !== header;
    })) {
      throw publicError_(name + ' sheet header is incompatible. No rows were changed.');
    }
  }

  var lastRow = sheet.getLastRow();
  var rows = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, headers.length).getValues().map(function (values, index) {
      return rowObject_({ headers: headers }, values, index + 2);
    })
    : [];
  return { sheet: sheet, headers: headers, rows: rows };
}

function rowObject_(table, row, rowNumber) {
  var object = {};
  table.headers.forEach(function (header, index) { object[header] = row[index] === undefined ? '' : row[index]; });
  object._row = row.slice();
  if (rowNumber) object._rowNumber = rowNumber;
  return object;
}

function findRow_(table, key, value) {
  for (var index = 0; index < table.rows.length; index += 1) {
    if (String(table.rows[index][key] || '') === String(value)) {
      return { values: table.rows[index], rowNumber: index + 2 };
    }
  }
  return null;
}

function writeRow_(table, rowNumber, row) {
  table.sheet.getRange(rowNumber, 1, 1, table.headers.length).setValues([row]);
}

function validateLeadInput_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw publicError_('Data prospek tidak valid.');
  }
  var input = {
    id: cleanString_(data.id, 128),
    name: cleanString_(data.name, 200),
    phone: cleanString_(data.phone, 64),
    service: cleanString_(data.service, 120),
    loc: cleanString_(data.loc, 200),
    status: cleanString_(data.status, 32),
    source: cleanString_(data.source, 16),
    gclid: cleanString_(data.gclid, 512),
    dealVal: positiveOrZero_(data.dealVal, 'Nilai proyek'),
    dpVal: positiveOrZero_(data.dpVal, 'Nilai DP')
  };
  if (!input.name || !input.phone || !input.service || !input.loc) {
    throw publicError_('Nama, WhatsApp, layanan, dan lokasi prospek wajib diisi.');
  }
  if (['Baru', 'Diskusi', 'Survei', 'DP Masuk', 'Selesai', 'Batal'].indexOf(input.status) === -1) {
    throw publicError_('Status prospek tidak valid.');
  }
  if (['ADS', 'SEO', 'DIRECT'].indexOf(input.source) === -1) {
    throw publicError_('Sumber prospek tidak valid.');
  }
  FORM_NOTE_FIELDS_.forEach(function (field) {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      input[field] = typeof data[field] === 'number' ? data[field] : cleanString_(data[field], 512);
    }
  });
  input.operatorNotes = cleanString_(data.operatorNotes, 2000);
  return input;
}

function leadToDashboard_(lead) {
  var notes = parseNotes_(lead.notes);
  return {
    id: String(lead.leadId || ''),
    createdAt: isoString_(lead.createdAt),
    name: String(lead.customerName || ''),
    phone: String(lead.phone || ''),
    service: String(lead.service || ''),
    loc: String(lead.projectLocation || ''),
    status: String(lead.projectStatus || 'Baru'),
    dealVal: Number(lead.quoteValue) || 0,
    source: String(lead.source || 'DIRECT'),
    gclid: String(lead.gclid || ''),
    linkedEventId: String(lead.linkedEventId || ''),
    dpVal: Number(lead.dpValue) || Number(notes.dpVal) || 0,
    dpTimestamp: isoString_(lead.dpTimestamp),
    finalServiceValue: Number(lead.finalServiceValue) || 0,
    completionTimestamp: isoString_(lead.completionTimestamp),
    adsTransactionId: String(lead.adsTransactionId || ''),
    conversionAction: String(lead.conversionAction || ''),
    currency: String(lead.currency || 'IDR'),
    conversionState: String(lead.conversionState || ''),
    address: String(notes.address || ''),
    rigId: String(notes.rigId || ''),
    dia: Number(notes.dia) || 40,
    depth: Number(notes.depth) || 0,
    depthActual: Number(notes.depthActual) || 0,
    points: Number(notes.points) || 0,
    unitPrice: Number(notes.unitPrice) || 0,
    piutangVal: Number(notes.piutangVal) || 0,
    payStatus: String(notes.payStatus || 'Belum Ada'),
    campaign: String(notes.campaign || ''),
    keyword: String(notes.keyword || ''),
    page: String(notes.page || ''),
    soilNotes: String(notes.soilNotes || ''),
    operatorNotes: String(notes.operatorNotes || '')
  };
}

function eventToDashboard_(event) {
  var time = isoString_(event.timestamp);
  var eventType = String(event.event || '');
  var source = classifyTrafficSource_(event);
  return {
    eventId: String(event.eventId || ''),
    timestamp: time,
    time: time,
    event: eventType === 'CLICK_WA' ? 'Klik WhatsApp' :
      (eventType === 'CLICK_PHONE' ? 'Klik Telepon' : 'Lihat Halaman'),
    eventType: eventType,
    url: String(event.page || ''),
    source: source,
    campaign: String(event.utmCampaign || ''),
    gclid: String(event.gclid || ''),
    ip: String(event.ip || '-'),
    loc: '',
    device: String(event.device || ''),
    referrer: String(event.referrer || ''),
    leadName: '',
    leadId: String(event.linkedLeadId || ''),
    fraud: false,
    daysAgo: daysAgo_(time)
  };
}

function classifyTrafficSource_(event) {
  var gclid = String(event.gclid || '').trim();
  if (gclid && !isDummyGclid_(gclid)) return 'ADS';

  var utmSource = String(event.utmSource || '').trim().toLowerCase();
  var utmMedium = String(event.utmMedium || '').trim().toLowerCase();
  var hasCampaign = Boolean(
    utmSource || utmMedium || event.utmCampaign || event.utmTerm || event.utmContent
  );
  if (utmMedium === 'organic' && (!utmSource || isSearchEngineName_(utmSource))) return 'SEO';

  var paidMedium = /^(cpc|ppc|paid|paidsearch|paid-search)$/.test(utmMedium);
  if (utmSource === 'google' && paidMedium) return 'ADS';
  if (hasCampaign) return 'CAMPAIGN';

  var host = referrerHost_(event.referrer);
  if (!host || host === 'asevenpile.com' || /\.asevenpile\.com$/.test(host)) return 'DIRECT';
  if (isSearchEngineHost_(host)) return 'SEO';
  return 'REFERRAL';
}

function referrerHost_(referrer) {
  var match = /^https?:\/\/([^/?#]+)/i.exec(String(referrer || '').trim());
  if (!match) return '';
  return match[1].toLowerCase().replace(/:\d+$/, '').replace(/^www\./, '');
}

function isSearchEngineHost_(host) {
  return /(^|\.)google\.[a-z.]+$/.test(host) ||
    /(^|\.)bing\.com$/.test(host) ||
    /(^|\.)yahoo\.[a-z.]+$/.test(host) ||
    /(^|\.)duckduckgo\.com$/.test(host) ||
    /(^|\.)ecosia\.org$/.test(host) ||
    /(^|\.)yandex\.[a-z.]+$/.test(host) ||
    /(^|\.)baidu\.com$/.test(host) ||
    /(^|\.)search\.brave\.com$/.test(host) ||
    /(^|\.)startpage\.com$/.test(host);
}

function isSearchEngineName_(source) {
  return source === 'google' || source === 'bing' || source === 'yahoo' ||
    source === 'duckduckgo' || source === 'ecosia' || source === 'yandex' ||
    source === 'baidu' || source === 'brave' || source === 'startpage' ||
    isSearchEngineHost_(source);
}

function auditToDashboard_(entry) {
  return {
    id: String(entry.auditId || ''),
    timestamp: isoString_(entry.timestamp),
    actor: String(entry.actor || ''),
    action: String(entry.action || ''),
    recordType: String(entry.recordType || ''),
    recordId: String(entry.recordId || ''),
    details: String(entry.details || '')
  };
}

function audit_(table, actor, action, recordType, recordId, details) {
  table.sheet.appendRow([
    'A-' + Utilities.getUuid(),
    new Date().toISOString(),
    actor,
    action,
    recordType,
    recordId,
    JSON.stringify(details || {})
  ]);
}

function parseNotes_(value) {
  if (!value) return {};
  try {
    var parsed = JSON.parse(String(value));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch (error) {
    return { operatorNotes: String(value) };
  }
  return {};
}

function isWithinRange_(value, from, to) {
  if (!from && !to) return true;
  var date = new Date(value);
  if (!isFinite(date.getTime())) return false;
  return (!from || date.getTime() >= from.getTime()) && (!to || date.getTime() <= to.getTime());
}

function parseTimestamp_(value, name) {
  var date = new Date(value);
  if (typeof value !== 'string' || !isFinite(date.getTime())) {
    throw publicError_(name + ' must be a valid timestamp.');
  }
  return date;
}

function isoString_(value) {
  if (value instanceof Date) return value.toISOString();
  if (!value) return '';
  var date = new Date(value);
  return isFinite(date.getTime()) ? date.toISOString() : String(value);
}

function daysAgo_(value) {
  var timestamp = new Date(value).getTime();
  if (!isFinite(timestamp)) return 0;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var eventDay = new Date(timestamp);
  eventDay.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - eventDay.getTime()) / 86400000));
}

function isDummyGclid_(value) {
  return !value || value === '-' || /^SIM-/i.test(String(value));
}

function cleanString_(value, maxLength) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw publicError_('Field teks memiliki format tidak valid.');
  }
  var result = String(value).trim();
  if (result.length > maxLength) throw publicError_('Salah satu field teks terlalu panjang.');
  return result;
}

function isBoundedString_(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function positiveOrZero_(value, label) {
  var number = value === '' || value === undefined || value === null ? 0 : Number(value);
  if (!isFinite(number) || number < 0) throw publicError_(label + ' harus berupa angka nol atau lebih.');
  return number;
}

function withLock_(callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function runApi_(callback) {
  try {
    return callback();
  } catch (error) {
    return {
      ok: false,
      error: error && error.isPublic
        ? error.message
        : 'Dashboard request failed. Check authorization and the shared Sheet configuration.'
    };
  }
}

function publicError_(message) {
  var error = new Error(message);
  error.isPublic = true;
  return error;
}
