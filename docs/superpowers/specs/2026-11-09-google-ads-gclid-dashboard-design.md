# ASeven Pile GCLID and Offline Conversion Dashboard Design

Date: 2026-11-09

## Status

Approved for implementation planning after owner review on 2026-11-09. No application code changes are included in this design phase.

## Goal

Capture real Google Ads click identifiers and WhatsApp click events, link the right click to each lead, and maintain shared operational data accessible from the owner's laptop and phone. The owner will manually import or update offline conversion data in Google Ads/Data Manager.

The final Google Ads conversion value should represent ASeven Pile's final service revenue for the completed project. Material revenue that does not belong to ASeven Pile is excluded.

The existing seven-tab dashboard and its current interactions remain available. This scope connects the Ads/traffic event trail and related CRM lead/conversion workflow to shared data. Other tabs and metrics without a real data source remain as preview/demo functionality and must not be presented as live reporting.

## Confirmed decisions

- WhatsApp message text stays unchanged and contains no tracking code.
- GCLID must be captured from an actual landing URL; the application must not generate simulated GCLIDs.
- IP is internal traffic-log information only. It is not sent to Google Ads or used as the conversion identifier.
- The owner manually matches a lead to a recorded WhatsApp click.
- A Google Sheet is the shared source of truth for events and lead/conversion state.
- The dashboard must be available from both laptop and phone.
- On actual DP receipt, prepare one initial offline conversion with the DP amount and actual DP timestamp.
- On project completion, update that same conversion to the final service value; do not create a second conversion for the same project.
- Google Ads/Data Manager import and update remain owner-operated/manual.

## Current repository behavior

- `src/scripts/main.js` already reads `gclid` and UTM parameters from the current URL and stores them in browser storage.
- The tracking Apps Script webhook URL in `src/scripts/main.js` is empty, so site tracking is not currently sent to a Sheet.
- The website has a WhatsApp contact flow, but WhatsApp clicks do not identify whether a message was actually sent or received.
- `preview-dashboard.html` is a standalone HTML file with in-memory CRM/demo events and localStorage state. That state does not synchronize between devices.
- The dashboard currently offers simulated GCLID generation and an export using a legacy-shaped CSV and the export time as conversion time. These behaviors must be replaced for real offline conversion use.
- The supplied AI-generated `Code.gs` currently places public `doPost` and HTML `doGet` in one script, returns the dashboard with `ALLOWALL`, and exposes `getDashboardData`/`saveCrmLead` as server functions. Its `doPost` also creates a CRM lead automatically for each WhatsApp click, although a click is not a confirmed conversation or a qualified lead. Its fraud label is inferred from a small recent IP sample. The implementation must split public ingestion from private dashboard access, stop auto-creating qualified CRM leads on clicks, and treat IP repetition as an investigation clue rather than a fraud verdict.

## Proposed architecture

### 1. Public, write-only website event receiver (Apps Script project A)

Deploy a small, separate Apps Script project as a web app dedicated to receiving website events and appending them to an `Events` tab in the owner's Google Sheet. This project has no dashboard HTML and no functions for reading leads, GCLIDs, IP history, or conversions. It accepts only an allowlist of event types such as landing, WhatsApp click, and phone click. Each event has a unique ID and event timestamp, and may include the original GCLID, UTM values, page path, referrer, device label, and IP for internal investigation.

The receiver must not expose spreadsheet reads, lead data, or conversion exports. It must validate and bound payload size and fields, deduplicate event IDs, and use a lock when appending rows. Because its URL is public and the browser is not a trusted client, any rate limit or origin check is best-effort abuse mitigation, not authentication. No secret embedded in the static website is treated as a security boundary.

The existing WhatsApp text remains unchanged. A click event is labeled as a click only; it is not represented as a confirmed WhatsApp conversation or qualified lead.

### 2. Private shared dashboard (Apps Script project B)

Deploy the dashboard in a second, separate Apps Script project as an HtmlService web app restricted to the owner's Google account. The dashboard reads and writes operational data through server-side Apps Script functions and the same Google Sheet used by project A. The owner operates one dashboard URL; the public website receiver is a separate background endpoint and is not another dashboard. Do not combine the public receiver and private dashboard in one publicly accessible deployment: the provided Code.gs places `doPost` beside `doGet`, `getDashboardData`, and `saveCrmLead`, which would expose sensitive read/write surfaces if deployed with public access.

Preserve all seven existing tabs—Ads, SEO, Konten, CRM, Armada, Traffic, and Overview—and their current layout/interactions where practical. In this implementation, only the captured Ads/traffic event data and the CRM fields needed for lead matching and conversion lifecycle become shared, live data. Existing SEO, roadmap, fleet, and unrelated overview demo metrics remain visible as preview data until separately integrated; label them clearly so they cannot be mistaken for live business measurements.

Google Sheet tabs:

- `Events`: immutable event ID, timestamp, page, source/UTMs, GCLID, IP, device/referrer, and event type; admin-controlled lead link and review state are separate fields.
- `Leads`: lead ID and contact/project information, source, linked event ID/GCLID, project status, DP value/time, final service value/completion time, stable Ads transaction ID, and import/update state.
- `Audit`: administrative changes and export/import acknowledgements, with timestamps and record IDs.

The owner imports or reviews events in the dashboard and manually selects the event that matches each lead. A click event can be linked to no more than one lead unless an explicit correction/reassignment is recorded. GCLID remains case-sensitive. If no defensible match exists, the lead remains unlinked and is not exported as an Ads-attributed offline conversion.

### 3. Conversion lifecycle and manual Ads transfer

Each lead has one stable transaction ID and one configured Google Ads conversion action.

- When DP is actually received, prepare the initial conversion with the real DP timestamp and amount.
- When the project is actually completed, prepare a value restatement for the same transaction ID and conversion action, replacing the initial value with the final service value.
- If a project completes without a previously recorded DP conversion, prepare one initial conversion at completion using its actual completion timestamp and final value.
- A completion update must not be emitted as a second new conversion. The dashboard shows an explicit pending/exported/confirmed state and makes the operator verify the transaction ID, action, timestamp, value, and GCLID before preparing a manual import.

The CSV/data-source format and exact Google Ads/Data Manager operation must follow current Google-supported import/adjustment requirements at implementation time. The design does not assume the old Google Ads API upload path is available. If the chosen manual Google workflow cannot apply an adjustment by transaction ID, the UI must not silently export the update as a new conversion; it must show a blocking explanation and an alternative supported workflow.

### 4. Attribution and event privacy

Capture a GCLID only when it is present in the URL. Keep its original case and capture timestamp. A later real paid click may replace the stored browser attribution according to a documented last-paid-click rule; expired or unrelated stored GCLIDs must not be attached to a lead. The Sheet event is the durable record used for cross-device matching.

IP is an internal event-log field only, is not used to assert a person's identity or fraud, and is never included in the conversion export. The tutorial must call out that IP/GCLID/contact details are sensitive operational data, restrict Sheet sharing to the owner, and describe a retention policy to confirm before production use.

## User experience

- Dashboard shows connection/sync errors clearly and never reports a successful save/import when the server call failed.
- All seven existing dashboard tabs remain available. Sections whose data is still demo/preview are visibly distinguished from the connected Ads/traffic and CRM records.
- The event picker shows event time, page, campaign/UTM, and GCLID. IP is a secondary internal clue, not the primary matching key.
- Lead details show DP status/time/value separately from project completion time/final value.
- Conversion preparation displays whether it is an initial DP conversion or an update to an existing transaction.
- The tutorial explains deployment, account restriction, Sheet setup, website receiver configuration, manual event-to-lead matching, DP recording, final-value update, and manual Google Ads/Data Manager operation.

## Out of scope

- Automatic Google Ads uploads or bidding changes.
- Changing WhatsApp message contents.
- Sending IP to Google Ads or making automated fraud decisions from IP.
- Replacing the marketing website, building a general-purpose CRM, or implementing multi-user roles.
- Guaranteeing that a WhatsApp click became a conversation or that Google will attribute every matched conversion.

## Acceptance criteria

1. A visit with a real GCLID and a WhatsApp click produce distinct, timestamped Sheet events with the same original GCLID; a visit without a GCLID never gets a fabricated one.
2. The public receiver can append validated events but cannot read leads, GCLIDs, IP history, or conversion records.
3. WhatsApp message text is unchanged.
4. The owner can open the same dashboard and see the same events/leads on laptop and phone after signing in with the authorized Google account.
5. All seven original tabs remain present; only agreed Ads/traffic and CRM records are presented as connected live data, and the remaining preview data is labeled as such.
6. The owner can manually link a click to a lead; a linked event cannot be accidentally reused for another lead.
7. DP creates one initial conversion record. Project completion produces an update with the same transaction ID/action and final service value, not a second conversion. Google Ads import timestamps reflect the actual event being initially recorded; value restatement preserves the original conversion identity.
8. An unlinked lead, missing GCLID, invalid amount/date, failed save, or uncertain Ads update is surfaced and is not presented as a successful attributed conversion.
9. The tutorial documents setup and day-to-day steps, including the boundary between the click timestamp, DP timestamp, and project completion timestamp.
10. Validate the website build, internal links, dashboard JavaScript, the two browser viewport classes (phone and desktop), and Apps Script logic with mocks. Deployment and Google Ads import must be verified by the owner in their Google account because credentials and account configuration are not available in the repository.

## Risks and mitigations

- **Public endpoint abuse:** keep ingestion write-only, constrain event schema/size, deduplicate, and monitor the Sheet. Do not embed an API secret in client JavaScript.
- **Sensitive data exposure:** restrict the private dashboard and Sheet to the owner's account; do not expose Sheet reads through the public receiver.
- **Incorrect attribution:** require manual linking and show event context; never infer identity from IP alone.
- **Duplicate Ads conversions:** stable transaction ID and action, explicit initial/update state, and operator confirmation before each manual transfer.
- **Long conversion delay or sparse data:** keep the chosen DP-to-final lifecycle visible in reporting; do not promise improved bidding performance.
- **Apps Script quotas or deployment changes:** surface failed event writes/syncs and include deployment health checks in the tutorial.
