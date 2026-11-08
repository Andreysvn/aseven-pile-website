var EVENT_HEADER_ = [
  'eventId', 'event', 'timestamp', 'page', 'gclid', 'utmSource', 'utmMedium',
  'utmCampaign', 'utmTerm', 'utmContent', 'ip', 'referrer', 'device',
  'linkedLeadId', 'reviewState'
];

var EVENT_FIELD_LIMITS_ = {
  eventId: 128,
  event: 32,
  timestamp: 40,
  page: 2048,
  gclid: 512,
  utmSource: 256,
  utmMedium: 256,
  utmCampaign: 256,
  utmTerm: 256,
  utmContent: 256,
  ip: 64,
  referrer: 2048,
  device: 128
};

var ALLOWED_EVENTS_ = ['LANDING', 'CLICK_WA', 'CLICK_PHONE'];
var MAX_BODY_BYTES_ = 8192;

function validateEvent_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw requestError_('Request body must be a JSON object.');
  }

  Object.keys(data).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(EVENT_FIELD_LIMITS_, key)) {
      throw requestError_('Unsupported event field: ' + key + '.');
    }
  });

  ['eventId', 'event', 'timestamp', 'page'].forEach(function (key) {
    if (typeof data[key] !== 'string' || data[key].length === 0) {
      throw requestError_(key + ' must be a non-empty string.');
    }
  });

  var event = {};
  Object.keys(EVENT_FIELD_LIMITS_).forEach(function (key) {
    var value = data[key];
    if (value === undefined) {
      if (key === 'eventId' || key === 'event' || key === 'timestamp' || key === 'page') {
        throw requestError_(key + ' is required.');
      }
      event[key] = '';
      return;
    }
    if (typeof value !== 'string') {
      throw requestError_(key + ' must be a string.');
    }
    if (stringLength_(value) > EVENT_FIELD_LIMITS_[key]) {
      throw requestError_(key + ' exceeds its maximum length.');
    }
    event[key] = value;
  });

  if (event.eventId.trim().length === 0) {
    throw requestError_('eventId must not be blank.');
  }
  if (ALLOWED_EVENTS_.indexOf(event.event) === -1) {
    throw requestError_('Unsupported event type.');
  }
  var timestampParts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(event.timestamp);
  if (!timestampParts || !isFinite(Date.parse(event.timestamp))) {
    throw requestError_('timestamp must be a parseable ISO-8601 value with an explicit timezone.');
  }
  var year = Number(timestampParts[1]);
  var month = Number(timestampParts[2]);
  var day = Number(timestampParts[3]);
  var hour = Number(timestampParts[4]);
  var minute = Number(timestampParts[5]);
  var second = Number(timestampParts[6]);
  var daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1] ||
      hour > 23 || minute > 59 || second > 59 ||
      (timestampParts[8] && (Number(timestampParts[8]) > 23 || Number(timestampParts[9]) > 59))) {
    throw requestError_('timestamp must be a parseable ISO-8601 value with an explicit timezone.');
  }
  return event;
}

function doPost(e) {
  var lock = null;
  try {
    var contents = e && e.postData && e.postData.contents;
    if (typeof contents !== 'string') {
      throw requestError_('Request body is required.');
    }
    if (utf8ByteLength_(contents) > MAX_BODY_BYTES_) {
      throw requestError_('Request body is too large.');
    }

    var data;
    try {
      data = JSON.parse(contents);
    } catch (parseError) {
      throw requestError_('Request body must contain valid JSON.');
    }
    var event = validateEvent_(data);
    var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (typeof sheetId !== 'string' || sheetId.trim().length === 0) {
      throw requestError_('SHEET_ID is not configured.');
    }

    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    var spreadsheet = SpreadsheetApp.openById(sheetId);
    var sheet = spreadsheet.getSheetByName('Events');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Events');
      sheet.appendRow(EVENT_HEADER_);
    } else if (!hasExpectedHeader_(sheet)) {
      throw requestError_('Events sheet header is incompatible.');
    }

    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var eventIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < eventIds.length; i += 1) {
        if (eventIds[i][0] === event.eventId) {
          return jsonOutput_({ status: 'duplicate', eventId: event.eventId });
        }
      }
    }

    sheet.appendRow([
      event.eventId,
      event.event,
      event.timestamp,
      event.page,
      event.gclid,
      event.utmSource,
      event.utmMedium,
      event.utmCampaign,
      event.utmTerm,
      event.utmContent,
      event.ip,
      event.referrer,
      event.device,
      '',
      ''
    ].map(sheetLiteral_));
    return jsonOutput_({ status: 'accepted', eventId: event.eventId });
  } catch (error) {
    return jsonOutput_({
      status: 'error',
      error: error && error.isRequestError ? error.message : 'Event could not be recorded.'
    });
  } finally {
    if (lock) {
      try {
        lock.releaseLock();
      } catch (ignored) {
        // Do not mask the response if lock cleanup itself fails.
      }
    }
  }
}

function hasExpectedHeader_(sheet) {
  if (sheet.getLastColumn() !== EVENT_HEADER_.length) {
    return false;
  }
  var actual = sheet.getRange(1, 1, 1, EVENT_HEADER_.length).getValues()[0];
  return EVENT_HEADER_.every(function (name, index) {
    return actual[index] === name;
  });
}

function jsonOutput_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function stringLength_(value) {
  var length = 0;
  for (var i = 0; i < value.length; i += 1) {
    var code = value.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < value.length) {
      var next = value.charCodeAt(i + 1);
      if (next >= 0xDC00 && next <= 0xDFFF) {
        i += 1;
      }
    }
    length += 1;
  }
  return length;
}

function utf8ByteLength_(value) {
  var bytes = 0;
  for (var i = 0; i < value.length; i += 1) {
    var code = value.charCodeAt(i);
    if (code <= 0x7F) {
      bytes += 1;
    } else if (code <= 0x7FF) {
      bytes += 2;
    } else if (code >= 0xD800 && code <= 0xDBFF && i + 1 < value.length &&
        value.charCodeAt(i + 1) >= 0xDC00 && value.charCodeAt(i + 1) <= 0xDFFF) {
      bytes += 4;
      i += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}
function requestError_(message) {
  var error = new Error(message);
  error.isRequestError = true;
  return error;
}
function sheetLiteral_(value) {
  if (typeof value === 'string' && /^\s*[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}
