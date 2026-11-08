# Task 1 implementation report: public GCLID event receiver

## Result
Implemented the public, append-only Apps Script receiver and focused Node VM tests. Implementation commit: `dfe86f4` — `feat: add write-only GCLID event receiver`.

## TDD record

- Initial prescribed command before the focused test existed: `node --test tests/apps-script/event-ingest.test.cjs` exited 1 with `Could not find 'tests/apps-script/event-ingest.test.cjs'`.
- Added the test and VM harness first, then reran the same command before creating `Code.gs`: RED, with all 10 then-defined tests failing because the Apps Script source was absent.
- Implemented the receiver and expanded coverage for every field maximum and safe service-error responses. One intermediate run caught invalid calendar-date normalization by `Date.parse` and VM cross-realm array comparisons; both were corrected before the final GREEN run.

## Implementation

- `doPost(e)` parses and bounds the UTF-8 request body at 8,192 bytes, validates the explicit event allowlist and supported names (`LANDING`, `CLICK_WA`, `CLICK_PHONE`), and emits JSON responses for successes, duplicates, and errors.
- Validation enforces bounded string fields, rejects unsupported keys and non-string values (including arrays/objects), and requires a parseable ISO-8601 timestamp with an explicit timezone while storing the original timestamp text.
- The receiver reads only `SHEET_ID` from Script Properties, opens that exact configured ID, and creates `Events` only if absent. Existing incompatible headers are rejected without modification.
- Under a script lock, `eventId` is checked for duplicates and a single row is appended using the exact shared header order: `eventId,event,timestamp,page,gclid,utmSource,utmMedium,utmCampaign,utmTerm,utmContent,ip,referrer,device,linkedLeadId,reviewState`. The final two dashboard-managed cells are blank.
- `CLICK_WA` creates no lead; the receiver has no dashboard/read/CRM endpoint and no Google Ads or fraud-verdict behavior. Unexpected spreadsheet-service errors are returned generically rather than exposing internal details.
- Added the V8/Jakarta Apps Script manifest and a Node built-in `node:test` VM harness. No package dependency was added.

## Final GREEN validation

Command: `node --test tests/apps-script/event-ingest.test.cjs`

Output summary:

```text
ℹ tests 12
ℹ suites 0
ℹ pass 12
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 217.8251
```

`git diff --cached --check` passed for the implementation files, and `appsscript.json` parsed as valid JSON.

## Exact implementation files

1. `apps-script/event-ingest/Code.gs`
2. `apps-script/event-ingest/appsscript.json`
3. `tests/apps-script/helpers/load-apps-script.cjs`
4. `tests/apps-script/event-ingest.test.cjs`

This report is the separately requested deliverable at `.superpowers/sdd/2026-11-09-gclid-dashboard/task-1-report.md`.

## Self-review and concerns

- Verified case-sensitive GCLID preservation, supported/unsupported event names, each field maximum, timezone and calendar validation, UTF-8 body-size rejection, unknown-key rejection, exact configured Sheet ID use, header non-rewriting, lock-protected deduplication, exact row mapping, no automatic lead/CRM sheet creation, and explicit missing-`SHEET_ID` errors.
- Preserved the pre-existing user changes to `src/scripts/main.js` and `preview-dashboard.html`; neither is part of the implementation commit.
- No live Apps Script deployment or real spreadsheet was available, so Apps Script service behavior was validated with mocks, not against a deployed project. No deployment URL, Sheet ID, token, or real lead/customer data was used or committed.
- A worktree-wide `git diff --check` reports trailing whitespace in the pre-existing modified `src/scripts/main.js`; that user file was deliberately left unchanged. The staged Task 1 files passed `git diff --cached --check`.