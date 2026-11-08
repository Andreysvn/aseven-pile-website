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
## Formula-injection review fix

- Fixed the P1 append-boundary finding by routing each event-row cell through `sheetLiteral_` before `appendRow`. Strings whose first non-whitespace character is `=`, `+`, `-`, or `@` receive the Sheets-compatible leading apostrophe text marker; ordinary strings are passed unchanged. Google Sheets treats this marker as a literal-text entry indicator, so the marker is not part of the visible value when read back.
- Added a regression test for formula-looking `page`, whitespace-prefixed `referrer`, tab-prefixed `gclid`, and `+`/`-` UTM values. The Apps Script mock models `appendRow` input semantics at the boundary, confirms dangerous entries carry the marker and are not formulas, and confirms reads return the original visible string. It also checks a normal UTM string is submitted unchanged.
- Focused validation command: `node --test tests/apps-script/event-ingest.test.cjs`

```text
✔ accepts a WhatsApp click with an original case-sensitive GCLID (8.2969ms)
✔ rejects unknown event types, missing IDs, unknown keys, and overlong fields (4.1642ms)
✔ enforces every string field maximum (4.726ms)
✔ requires bounded strings and a parseable ISO timestamp with explicit timezone (3.026ms)
✔ rejects malformed, non-object, and oversized UTF-8 request bodies explicitly (4.2888ms)
✔ rejects requests containing keys outside the event-field allowlist (4.8162ms)
✔ creates only Events and appends the exact shared row with dashboard cells blank (3.6217ms)
✔ stores formula-like event strings as literal text without changing visible values (3.1253ms)
✔ deduplicates event IDs while holding the script lock (4.5191ms)
✔ does not rewrite an incompatible Events header (3.1922ms)
✔ does not expose internal spreadsheet errors to the public caller (2.7744ms)
✔ returns an explicit configuration error when SHEET_ID is absent (2.4976ms)
✔ never exposes read, dashboard, or CRM endpoint methods (2.3627ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 248.023
```
### Final verification after report update

Command: `node --test tests/apps-script/event-ingest.test.cjs`

```text
✔ accepts a WhatsApp click with an original case-sensitive GCLID (6.9271ms)
✔ rejects unknown event types, missing IDs, unknown keys, and overlong fields (3.3332ms)
✔ enforces every string field maximum (4.2197ms)
✔ requires bounded strings and a parseable ISO timestamp with explicit timezone (3.0655ms)
✔ rejects malformed, non-object, and oversized UTF-8 request bodies explicitly (4.8246ms)
✔ rejects requests containing keys outside the event-field allowlist (3.8148ms)
✔ creates only Events and appends the exact shared row with dashboard cells blank (3.5891ms)
✔ stores formula-like event strings as literal text without changing visible values (4.1616ms)
✔ deduplicates event IDs while holding the script lock (3.4638ms)
✔ does not rewrite an incompatible Events header (2.7033ms)
✔ does not expose internal spreadsheet errors to the public caller (2.522ms)
✔ returns an explicit configuration error when SHEET_ID is absent (2.362ms)
✔ never exposes read, dashboard, or CRM endpoint methods (2.0739ms)
ℹ tests 13
ℹ suites 0
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 231.019
```