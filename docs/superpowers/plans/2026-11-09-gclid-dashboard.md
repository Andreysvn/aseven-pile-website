# ASeven Pile GCLID Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the existing seven-tab dashboard while connecting real website GCLID/traffic events and related CRM/conversion milestones to one private, cross-device Apps Script dashboard backed by a shared Google Sheet.

**Architecture:** A public, write-only Apps Script project accepts validated website events into the shared Sheet; a separate owner-only Apps Script project serves the dashboard and manages leads, event matching, and offline conversion preparation. The dashboard is based on `preview-dashboard.html`; only agreed Ads/traffic and CRM data become live in this scope. The owner performs Google Ads/Data Manager imports and updates manually.

**Tech Stack:** Astro 5, browser JavaScript, Google Apps Script V8, HtmlService, Google Sheets, Node.js built-in test runner (`node:test`), available browser verification tools.

**Spec:** `docs/superpowers/specs/2026-11-09-google-ads-gclid-dashboard-design.md`

## Global Constraints

- “WhatsApp message text stays unchanged and contains no tracking code.”
- “GCLID must be captured from an actual landing URL; the application must not generate simulated GCLIDs.”
- “IP is internal event-log information only. It is not sent to Google Ads or used as the conversion identifier.”
- “The owner manually matches a lead to a recorded WhatsApp click.”
- “A Google Sheet is the shared source of truth for events and lead/conversion state.”
- “The dashboard must be available from both laptop and phone.”
- “On actual DP receipt, prepare one initial offline conversion with the DP amount and actual DP timestamp.”
- “On project completion, update that same conversion to the final service value; do not create a second conversion for the same project.”
- “Google Ads/Data Manager import and update remain owner-operated/manual.”
- “The existing seven-tab dashboard and its current interactions remain available.”
- “Other tabs and metrics without a real data source remain as preview/demo functionality and must not be presented as live reporting.”
- Google Ads spend, impressions, platform clicks, and bidding metrics have no live source in this scope; label those metrics `PREVIEW DATA`. Only website event attribution and CRM conversion preparation are live.
- Keep the public event receiver in its own Apps Script project with append-only event behavior; keep the dashboard in a separate owner-restricted Apps Script project.
- Use the exact shared Sheet headers below in both projects; event fields are immutable after receiver append, while `linkedLeadId` and `reviewState` are dashboard-managed fields.
- `Events` headers, in order: `eventId,event,timestamp,page,gclid,utmSource,utmMedium,utmCampaign,utmTerm,utmContent,ip,referrer,device,linkedLeadId,reviewState`.
- `Leads` headers, in order: `leadId,createdAt,customerName,phone,service,projectLocation,projectStatus,quoteValue,source,linkedEventId,gclid,dpValue,dpTimestamp,finalServiceValue,completionTimestamp,adsTransactionId,conversionAction,currency,conversionState,notes`.
- `Audit` headers, in order: `auditId,timestamp,actor,action,recordType,recordId,details`.
- Do not overwrite or revert the existing unrelated dirty worktree changes. Keep `preview-dashboard.html` as the local preview and use it as the source for the hosted dashboard.
- Do not commit deployment URLs, Sheet IDs, OAuth tokens, or real lead/customer data.

## File Structure

- Create `apps-script/event-ingest/Code.gs`: public `doPost` receiver, event validation, append-only `Events` sheet access, and duplicate-event protection.
- Create `apps-script/event-ingest/appsscript.json`: minimal manifest for the public receiver.
- Create `apps-script/dashboard/Code.gs`: private HtmlService entry point, Sheet schema, authenticated read/write APIs, lead/event linking, audit trail, and conversion lifecycle.
- Create `apps-script/dashboard/Index.html`: hosted copy of the seven-tab dashboard, adapted to call private Apps Script server functions.
- Create `apps-script/dashboard/appsscript.json`: minimal V8/Jakarta manifest for the private dashboard.
- Modify `src/data/site.config.ts`: public event receiver URL setting, empty by default.
- Create `src/scripts/gclid-attribution.js`: small pure helpers for real-click attribution capture, expiry, and event IDs.
- Modify `src/scripts/main.js`: capture real GCLID/UTM context, send event-only payloads to the public receiver, keep IP internal, and retain clean WhatsApp text.
- Create `tests/apps-script/helpers/load-apps-script.cjs`: Node VM helper for testing Apps Script V8 source with mocked services.
- Create `tests/apps-script/event-ingest.test.cjs`: public receiver payload, dedupe, and no-auto-lead tests.
- Create `tests/apps-script/dashboard.test.cjs`: access guard, Sheet mapping, linking, and conversion-state tests.
- Create `tests/tracking/gclid-attribution.test.mjs`: browser attribution helper tests.
- Create `docs/Google-Ads-GCLID-Tutorial.md`: deployment and daily-use tutorial for the owner.

## Task 1: Build the Public, Append-Only Website Event Receiver

**Files:**
- Create: `apps-script/event-ingest/Code.gs`
- Create: `apps-script/event-ingest/appsscript.json`
- Create: `tests/apps-script/helpers/load-apps-script.cjs`
- Create: `tests/apps-script/event-ingest.test.cjs`

**Interfaces:**
- Consumes: JSON event payloads from the website containing `eventId`, `event`, `timestamp`, `page`, optional `gclid`, UTM fields, `ip`, `referrer`, and `device`.
- Produces: `doPost(e)` returning JSON `{ status, eventId }`; appends only to `Events`; exposes no dashboard HTML or read/CRM methods.
- Sheet ID is read server-side from Script Properties as `SHEET_ID`; never accept a sheet ID from the public payload.

- [ ] **Step 1: Add failing event validation tests**

Use the Node built-in runner and assert that real event payloads preserve GCLID case, unsupported event types fail, and oversized/malformed data is rejected:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppsScript } = require('./helpers/load-apps-script.cjs');

test('accepts a WhatsApp click with an original case-sensitive GCLID', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  const event = context.validateEvent_({
    eventId: 'evt-1',
    event: 'CLICK_WA',
    timestamp: '2026-11-09T01:00:00.000Z',
    page: '/area-layanan/bore-pile/jakarta',
    gclid: 'AbC123',
    ip: '203.0.113.8'
  });
  assert.equal(event.gclid, 'AbC123');
  assert.equal(event.event, 'CLICK_WA');
});

test('rejects unknown event types and missing event IDs', () => {
  const { context } = loadAppsScript('apps-script/event-ingest/Code.gs');
  assert.throws(() => context.validateEvent_({ eventId: 'evt-2', event: 'MAKE_LEAD' }));
  assert.throws(() => context.validateEvent_({ event: 'CLICK_WA' }));
  assert.throws(() => context.validateEvent_({ eventId: 'evt-3', event: 'CLICK_WA', sheetId: 'attacker-value' }));
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `node --test tests/apps-script/event-ingest.test.cjs`

Expected: FAIL because the Apps Script source and test harness do not exist yet.

- [ ] **Step 3: Add the minimal Apps Script VM harness**

Create `load-apps-script.cjs` with this VM loader; do not add a package dependency. The test harness must fail if the source file cannot be read or evaluated:

```js
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAppsScript(relativePath, mocks = {}) {
  const filename = path.resolve(process.cwd(), relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const context = vm.createContext({ console, ...mocks });
  vm.runInContext(source, context, { filename, timeout: 1000 });
  return { context };
}

module.exports = { loadAppsScript };
```

- [ ] **Step 4: Implement the public receiver**

Implement `validateEvent_(data)` to enforce the three event names `LANDING`, `CLICK_WA`, and `CLICK_PHONE`, required bounded `eventId`/timestamp/page fields, and bounded optional strings. Reject non-JSON, oversized payloads, and every key outside the explicit event-field allowlist. Implement `doPost(e)` to:

1. Parse and validate the event.
2. Read `SHEET_ID` from Script Properties and open that exact spreadsheet.
3. Create `Events` only if absent; if an existing header is incompatible, return an explicit error and do not rewrite it.
4. Acquire a script lock, deduplicate `eventId`, and append one event row.
5. Return JSON status without returning sheet contents.

Do not create a lead from `CLICK_WA`. Do not implement fraud verdicts in the public receiver. Add this manifest to the public project with V8 runtime and Jakarta timezone:

```json
{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

- [ ] **Step 5: Add mocked append/deduplication tests and run them**

Mock `LockService`, `PropertiesService`, `SpreadsheetApp`, and `ContentService`. Verify that a repeated event ID appends exactly one row, a valid event creates no `Leads`/`CRM_Deals` sheet, and a missing `SHEET_ID` returns an explicit failure.

Run: `node --test tests/apps-script/event-ingest.test.cjs`

Expected: all receiver tests pass.

- [ ] **Step 6: Commit the receiver**

```text
feat: add write-only GCLID event receiver
```

## Task 2: Capture Real Click Attribution on the Website

**Files:**
- Modify: `src/data/site.config.ts`
- Create: `src/scripts/gclid-attribution.js`
- Modify: `src/scripts/main.js`
- Create: `tests/tracking/gclid-attribution.test.mjs`

**Interfaces:**
- `captureAttribution(search, nowMs, previous)` returns a normalized attribution record containing the original-case GCLID, UTM values, and capture time; absent/expired clicks return no active GCLID.
- `createTrackingEvent(event, details, attribution, now, id)` returns only the event payload accepted by Task 1.
- Website receiver URL is a public configuration value in `siteConfig`, defaulting to an empty string until deployment.

- [ ] **Step 1: Add failing pure-helper tests**

Test that GCLID matching is case-sensitive, no ID is fabricated for organic visits, a later actual GCLID replaces the earlier one, expired attribution is ignored, and IP is present only as an internal event field:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { captureAttribution, createTrackingEvent } from '../../src/scripts/gclid-attribution.js';

test('captures only an actual GCLID and preserves its case', () => {
  const result = captureAttribution('?gclid=AbC123&utm_source=google', 1000, null);
  assert.equal(result.gclid, 'AbC123');
  assert.equal(captureAttribution('', 1000, null).gclid, '');
});

test('does not reuse expired attribution', () => {
  const old = { gclid: 'OldClick', capturedAt: 1 };
  assert.equal(captureAttribution('', 1000 + 91 * 86400000, old).gclid, '');
});

test('does not add IP to an Ads conversion payload', () => {
  const event = createTrackingEvent('CLICK_WA', { ip: '203.0.113.8' }, { gclid: 'AbC123' }, 1000, 'evt-1');
  assert.equal(event.ip, '203.0.113.8');
  assert.equal(event.gclid, 'AbC123');
  assert.equal('conversionValue' in event, false);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run: `node --test tests/tracking/gclid-attribution.test.mjs`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the attribution helper**

Add pure functions with an explicit 90-day expiry and injected current time. Preserve GCLID exactly, accept it only from a real query parameter, and do not use placeholder/default IDs. Generate one unique event ID per event with `crypto.randomUUID()` and a documented browser-safe fallback. Never put IP in conversion records.

- [ ] **Step 4: Wire website tracking to the public receiver**

Add `gclidEventEndpoint: ''` to `siteConfig`. Replace the hard-coded blank local constant in `main.js` with that setting. Store captured attribution with its timestamp; replace it only on a new actual paid click, and ignore it after 90 days. Send `LANDING`, `CLICK_WA`, and `CLICK_PHONE` events with unique IDs. Queue click events with `navigator.sendBeacon` without waiting for a network IP lookup; use the cached IP when available and `'-'` otherwise. Keep the existing WhatsApp text unchanged. Remove the campaign behavior that labels an old stored GCLID as a new paid landing. The receiver URL stays empty in source until the owner deploys the public project.

- [ ] **Step 5: Run focused tests and Astro validation**

Run:

```text
node --test tests/tracking/gclid-attribution.test.mjs tests/apps-script/event-ingest.test.cjs
npm run build
node scripts/linkcheck.mjs dist
```

Expected: tests pass, build succeeds, and link checker reports `NO BROKEN INTERNAL LINKS`.

- [ ] **Step 6: Commit website capture**

```text
feat: capture real GCLID on website events
```

## Task 3: Build the Private Dashboard Sheet API

**Files:**
- Create: `apps-script/dashboard/Code.gs`
- Create: `apps-script/dashboard/appsscript.json`
- Create: `tests/apps-script/dashboard.test.cjs`

**Interfaces:**
- `assertOwner_()` rejects dashboard API calls from an email other than the configured owner.
- `getDashboardData(filterFrom, filterTo)` returns `{ traffic, crm, audit }` with live Sheet rows only for agreed Ads/traffic and CRM fields.
- `saveCrmLead(leadData)`, `linkEventToLead(eventId, leadId)`, and `getUnlinkedEvents()` validate requests server-side and return explicit success/error objects.
- Both Apps Script projects read `SHEET_ID` from their own Script Properties and use the same Google Sheet.

- [ ] **Step 1: Add failing private API tests**

Cover non-owner rejection, expected `Events`/`Leads`/`Audit` mappings, rejection of duplicate event-to-lead links, and explicit errors for invalid lead fields:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadAppsScript } = require('./helpers/load-apps-script.cjs');

test('rejects dashboard calls from a non-owner', () => {
  const { context } = loadAppsScript('apps-script/dashboard/Code.gs', {
    Session: { getActiveUser: () => ({ getEmail: () => 'other@example.com' }) }
  });
  context.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'owner@example.com' }) };
  assert.throws(() => context.assertOwner_());
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/apps-script/dashboard.test.cjs`

Expected: FAIL because the private project does not exist yet.

- [ ] **Step 3: Implement the private Sheet API**

Use `SpreadsheetApp.openById(SHEET_ID)`; do not rely on `getActiveSpreadsheet()` in a standalone web app. Create `Events`, `Leads`, and `Audit` tabs only when absent, using the exact ordered headers in Global Constraints. Never clear or rewrite existing rows during initialization. Validate headers and fail visibly on a mismatch. Store `OWNER_EMAIL` in this project's Script Properties; `assertOwner_()` must reject blank or nonmatching `Session.getActiveUser().getEmail()` values. Deploy the dashboard to execute as the accessing user with access restricted to only the owner, so the owner identity check can be enforced. Add a script lock around lead writes and event linking. Linking must reject an event already assigned to a different lead unless the owner explicitly unlinks it first. Escape/render dynamic dashboard values through the existing `esc()` helper. Do not add `ALLOWALL` framing behavior.

Add the private project's manifest:

```json
{
  "timeZone": "Asia/Jakarta",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

- [ ] **Step 4: Add mocked API tests and verify the focused suite**

Mock owner identity, Script Properties, locks, and spreadsheet ranges. Verify read APIs expose only agreed fields, public event IDs can be linked once, server errors do not return success-shaped data, and existing Sheet rows are not deleted by setup.

Run: `node --test tests/apps-script/dashboard.test.cjs`

Expected: all dashboard API tests pass.

- [ ] **Step 5: Commit the private Sheet API**

```text
feat: add private dashboard sheet api
```

## Task 4: Host the Complete Seven-Tab Dashboard Privately

**Files:**
- Create: `apps-script/dashboard/Index.html`
- Modify: `tests/apps-script/dashboard.test.cjs`

**Interfaces:**
- `doGet(e)` serves `Index.html` only from the owner-restricted web app deployment.
- The hosted UI calls the Task 3 APIs through `google.script.run`; it never contacts the public receiver to read data.

- [ ] **Step 1: Add a dashboard bridge test**

Use the available browser tool with stubbed `google.script.run` to verify initial reads and visible server-failure handling; do not add a browser-test package. Also verify the seven navigation tabs remain visible and keyboard-navigable.

- [ ] **Step 2: Create the hosted HTML from the preview**

Copy the full seven-tab `preview-dashboard.html` to `apps-script/dashboard/Index.html`. Keep `preview-dashboard.html` unchanged. Preserve all navigation and modal interactions. Replace Ads/traffic/CRM live arrays with server data from Task 3 and add visible loading/error states. Show captured website events and CRM conversion preparation as live; mark Google Ads spend, impressions, platform clicks, bidding metrics, and unrelated Overview metrics `PREVIEW DATA` because they have no live source in this scope. Also mark SEO, Konten, and Armada preview data. Remove simulated GCLID generation and localStorage persistence for shared CRM/GCLID records.

- [ ] **Step 3: Wire initial reads and CRM writes**

Call `google.script.run.getDashboardData(...)` during dashboard initialization; use success and failure handlers to render data or show an explicit error. Wire lead save and click-to-lead matching to server functions. Do not toast success before the server confirms the write. Keep all seven tabs present at 390 px and desktop width.

- [ ] **Step 4: Verify dashboard behavior**

Use the browser tool or deployed test fixture to verify all seven tab switches, server read/write error states, and 390 px/1280 px viewports. Parse the inline dashboard script and confirm no uncaught browser errors. Verify the standalone `preview-dashboard.html` still opens unchanged.

- [ ] **Step 5: Commit the hosted dashboard**

```text
feat: host private cross-device operations dashboard
```

## Task 5: Add the DP-to-Final Conversion Lifecycle

**Files:**
- Modify: `apps-script/dashboard/Code.gs`
- Modify: `apps-script/dashboard/Index.html`
- Modify: `tests/apps-script/dashboard.test.cjs`

**Interfaces:**
- `recordDeposit(leadId, amount, occurredAt)` records a real DP milestone and creates one stable transaction ID for the lead.
- `recordProjectCompletion(leadId, finalServiceValue, completedAt)` records final service value and returns either an initial conversion action or a restatement action for the same transaction ID.
- `getPendingAdsActions()` returns explicit `INITIAL_DP` or `UPDATE_FINAL_VALUE` actions with GCLID, conversion action, transaction ID, actual timestamp, value, and currency. IP is never returned.
- `markAdsActionExported(actionId, exportedAt, operatorNote)` records the owner's manual import acknowledgement without claiming Google accepted the data.

- [ ] **Step 1: Add failing conversion lifecycle tests**

Test initial DP creation, stable transaction ID reuse, final-value replacement without a second conversion count, completion with no prior DP, and rejection of missing GCLID/timestamp/invalid amounts:

```js
test('completion prepares an update for the same conversion transaction', () => {
  const lead = { id: 'L-1', gclid: 'AbC123', adsTransactionId: 'TX-L-1', dpValue: 7500000 };
  const action = buildCompletionAction_(lead, 25000000, '2026-11-09T01:00:00.000Z');
  assert.equal(action.type, 'UPDATE_FINAL_VALUE');
  assert.equal(action.transactionId, 'TX-L-1');
  assert.equal(action.conversionValue, 25000000);
  assert.equal(action.gclid, 'AbC123');
  assert.equal('ip' in action, false);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/apps-script/dashboard.test.cjs`

Expected: FAIL because the conversion lifecycle is not implemented.

- [ ] **Step 3: Implement conversion state transitions**

Store DP amount/time, final service amount/completion time, stable Ads transaction ID, selected conversion action, and initial/update export state on the lead. DP creates one initial event. Completion creates an update using the same transaction ID/action; if no DP event was recorded, completion creates one initial event at the actual completion timestamp. Validate positive finite values and valid timestamps. Lock state transitions so repeated clicks cannot create duplicate actions.

- [ ] **Step 4: Verify the current manual Google Ads/Data Manager update format**

Check current official Google documentation for the supported manual initial-import and value-restatement path, including transaction ID matching, conversion action, timestamp, currency, and accepted columns. Implement only a format that supports updating the same conversion. If the currently available manual Google workflow cannot perform the restatement, do not export an update as a new conversion; show a blocked status and record the confirmed alternative in the tutorial.

- [ ] **Step 5: Add the conversion action UI and tests**

Display DP and final project values/timestamps separately in CRM. Add a pending action review that clearly labels initial DP versus final-value update and requires the owner to confirm after manual import. Show “prepared/exported by owner” rather than “uploaded successfully.” Ensure exports contain no IP, use the actual occurrence timestamp, and reuse the stable transaction ID for updates.

Run: `node --test tests/apps-script/dashboard.test.cjs`

Expected: all lifecycle tests pass and no action is created for an unlinked/missing GCLID lead.

- [ ] **Step 6: Commit the conversion workflow**

```text
feat: track DP and final Ads conversion values
```

## Task 6: Write the Owner Tutorial and Verify the End-to-End Workflow

**Files:**
- Create: `docs/Google-Ads-GCLID-Tutorial.md`
- Modify: `apps-script/event-ingest/Code.gs` only if end-to-end tests expose a receiver defect.
- Modify: `apps-script/dashboard/Code.gs` only if end-to-end tests expose an API defect.
- Modify: `src/scripts/main.js` only if end-to-end tests expose a tracking defect.

- [ ] **Step 1: Write the deployment tutorial**

Document how to create one Google Sheet and its `Events`, `Leads`, and `Audit` tabs; deploy the public receiver project with access needed by the website and execute-as-owner behavior; deploy the dashboard project as the accessing user with access restricted to only the owner; set `SHEET_ID` in both projects and `OWNER_EMAIL` in the dashboard project; set `siteConfig.gclidEventEndpoint` to the public receiver URL; and verify the dashboard from laptop and phone. State that the Sheet is owner-only, GCLID/IP/contact details are sensitive operational data, and the owner must set a retention period before production use. Explain that no URL/token/Sheet ID belongs in the user-facing tutorial as a real value.

- [ ] **Step 2: Document daily lead and conversion operations**

Include a worked example using fictional data: a real GCLID click is logged, an actual lead is manually linked to the matching click, DP timestamp/value creates the initial action, and project completion replaces its value with final ASeven service revenue using the same transaction ID. Explain that click time, DP time, and completion time are different; IP is an internal clue only; a WA click is not proof of a chat; and Google Ads import remains manual.

- [ ] **Step 3: Document failure recovery and verification**

Explain how to identify public event write failure, dashboard authorization failure, unlinked/missing-GCLID leads, duplicate event IDs, pending manual import, and an update blocked because the chosen Data Manager workflow cannot restate the existing conversion. State that local preview/demo metrics are not live.

- [ ] **Step 4: Run all automated and build checks**

Run:

```text
node --test tests/apps-script/*.test.cjs tests/tracking/*.test.mjs
npm run build
node scripts/linkcheck.mjs dist
```

Expected: all focused tests pass, Astro build succeeds, and output contains `NO BROKEN INTERNAL LINKS`.

- [ ] **Step 5: Verify dashboard layout and runtime in a browser**

Open the hosted-dashboard HTML in a browser mock with stubbed `google.script.run`, and verify desktop width 1280 px and phone width 390 px. Check all seven navigation tabs, the event-to-lead link flow, DP and final update review, a simulated server error, and the absence of uncaught page errors. Do not claim production deployment verified until the owner deploys both Apps Script projects and confirms the authorized account and Google Ads/Data Manager import.

- [ ] **Step 6: Commit tutorial and final validation changes**

```text
docs: add GCLID dashboard setup tutorial
```

## Plan Self-Review

- Spec coverage: public write-only receiver (Task 1), genuine GCLID capture and event logging (Task 2), owner-only Sheet APIs (Task 3), complete seven-tab cross-device dashboard (Task 4), manual DP-to-final-value conversion lifecycle (Task 5), setup/privacy/daily-use tutorial and validation (Task 6).
- Security coverage: no public CRM read surface, no embedded secret, no GCLID fabrication, no IP in conversion exports, no automatic lead creation from a WhatsApp click, and explicit warning for unsupported restatements.
- Placeholder scan: no `TODO`, `TBD`, or unassigned implementation step.
- Type/interface consistency: website sends only event names accepted by Task 1; dashboard calls only private project APIs from Task 3; conversion actions in Task 5 use the same lead transaction ID and action.
- Deployment boundary: Apps Script deployment permissions and actual Google Ads/Data Manager acceptance require owner verification; repository tests cannot prove the owner's Google account configuration.
