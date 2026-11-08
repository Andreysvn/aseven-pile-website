# Task 2: Capture Real Click Attribution on the Website

## Result

Implemented Task 2 website attribution capture and event delivery. The receiver
configuration remains empty (`siteConfig.gclidEventEndpoint: ''`); no external
deployment or account changes were made.

## Implementation

- Added pure helpers in `src/scripts/gclid-attribution.js`:
  - Reads only the exact, case-sensitive `gclid` query parameter and keeps its
    original case.
  - Captures the UTM fields and timestamp alongside a new tracked visit.
  - Reuses stored attribution only while it is within the 90-day expiry; a new
    tracked visit replaces the older record.
  - Creates event objects using only Task 1's accepted keys, including `ip`
    solely as an internal event-log field (there is no conversion value or
    Ads conversion record).
- Added the empty public receiver setting in `src/data/site.config.ts`.
- Replaced the legacy logger in `src/scripts/main.js`:
  - Persists normalized attribution and sends `LANDING`, `CLICK_WA`, and
    `CLICK_PHONE` payloads with unique event IDs.
  - `LANDING` uses only attribution in the current URL, so an old stored GCLID
    is not represented as a new paid landing. Clicks can still use unexpired
    stored attribution.
  - Uses `sendBeacon` synchronously (with a `fetch` keepalive fallback), without
    a network IP lookup. It includes only a cached same-origin IP from
    `aseven_same_origin_visitor_ip`, or `-`.
  - Keeps the existing page-topic WhatsApp copy behavior and does not add
    tracking identifiers to WhatsApp URLs or messages. Webhook payloads do not
    include `topic` or `cta_location`.
  - Retains the existing GTM `generate_lead` event for compatibility while
    marking it as `lead_stage: 'click_intent'` and
    `confirmed_conversation: false`; it is not evidence of a conversation.
- Added pure-helper tests in `tests/tracking/gclid-attribution.test.mjs`.

## TDD and validation evidence

### RED

Before creating the helper, ran:

```text
node --test tests/tracking/gclid-attribution.test.mjs
```

The test failed at module resolution with `ERR_MODULE_NOT_FOUND` for
`src/scripts/gclid-attribution.js`, as expected because the helper did not yet
exist.

### GREEN and project checks

Ran:

```text
node --test tests/tracking/gclid-attribution.test.mjs tests/apps-script/event-ingest.test.cjs
```

Result: **18 tests passed, 0 failed** (5 tracking tests and 13 receiver tests).

Ran:

```text
npm run build
```

Result: Astro build succeeded; **41 pages built**.

Ran:

```text
node scripts/linkcheck.mjs dist
```

Result: `NO BROKEN INTERNAL LINKS`.

## Files changed for Task 2

- `src/data/site.config.ts`
- `src/scripts/gclid-attribution.js`
- `src/scripts/main.js`
- `tests/tracking/gclid-attribution.test.mjs`
- `.superpowers/sdd/2026-11-09-gclid-dashboard/task-2-report.md`

## Review and concerns

The website endpoint is still empty, so event delivery is intentionally disabled
until the owner deploys/configures the receiver. The fallback event ID uses
`crypto.randomUUID()` where available, then cryptographic random bytes, with a
timestamp/random fallback for older browsers lacking Web Crypto.

The pre-existing untracked `preview-dashboard.html` was not changed or staged.
The separately modified Task 1 report was not changed or staged by this task.

## Commit

`feat: capture real GCLID on website events`
