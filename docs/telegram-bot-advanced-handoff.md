# Telegram Bot Advanced Handoff

## Goal

Upgrade the local Telegram bot so the owner can monitor and control this Astro project from a phone. Keep the solution local, free where possible, secure, and responsive.

The bot uses Telegram long polling. Cloudflare Quick Tunnel is only for viewing the Astro preview from a phone. Do not expose the bot or Antigravity hub through Cloudflare.

## Current State

Repository root:

```text
C:\Users\Asus\OneDrive\Dokumen\aseven-pile-website-main
```

Relevant files:

- `telegram-bot/bot.js`
- `telegram-bot/package.json`
- `telegram-bot/.env`
- `telegram-bot/.env.example`
- `start-all.ps1`
- `RUNBOOK.md`

The bot currently:

- Uses CommonJS Node.js.
- Uses `node-telegram-bot-api` version `2.1.0`.
- Uses the v2 API: `new TelegramBot.Bot(token)` and `bot.startPolling()`.
- Loads `.env` relative to `bot.js`.
- Requires `TELEGRAM_BOT_TOKEN`.
- Restricts all updates to `TELEGRAM_ALLOWED_USER_ID`.
- Runs in development with `node --watch telegram-bot/bot.js`.
- Supports `/start`, `/help`, `/status`, and `/preview`.

Astro currently:

- Builds as static output.
- Uses `npm run build`.
- Uses Vite preview on `0.0.0.0:4321`.
- Produces `dist/index.html`.

## Startup Automation

`start-all.ps1` currently:

1. Stops project Node processes and a tunnel targeting port `4321`.
2. Runs `npm run build`.
3. Starts Astro preview.
4. Starts `cloudflared tunnel --url http://127.0.0.1:4321`.
5. Reads the Quick Tunnel URL from both stdout and stderr.
6. Updates only `PREVIEW_URL` in `telegram-bot/.env`.
7. Starts the bot in Node watch mode.

The Windows Task Scheduler task is:

```text
ASeven Pile - Start Services
```

It runs `start-all.ps1` at login for the local Windows user, including on battery.

Manual startup:

```powershell
.\start-all.ps1
```

Do not print or commit the real `telegram-bot/.env` file.

## Environment

Expected keys in `telegram-bot/.env`:

```env
TELEGRAM_BOT_TOKEN=token-from-BotFather
TELEGRAM_ALLOWED_USER_ID=owner-numeric-telegram-id
PREVIEW_URL=https://current-quick-tunnel.trycloudflare.com
```

The token is secret. Never include it in logs, replies, documentation, or test output. `PREVIEW_URL` is intentionally rewritten by `start-all.ps1`.

## Antigravity Constraint

The user operates Google Antigravity through the VS Code extension `google.google-antigravity`.

Known facts:

- No `agy` or `antigravity` command was available in PATH during investigation.
- The extension manifest mentions `antigravity.serverPort` and an Antigravity background server.
- The manifest references `agy --hub`.
- The actual binary, port, protocol, authentication, and prompt API are not yet verified.

Before implementing `/prompt`, investigate the installed extension and local runtime to find an official local API. Do not expose its port to the internet. Do not assume that the VS Code webview can be controlled remotely. Do not fall back to arbitrary shell execution or fragile UI automation without explicit approval.

## Desired Commands

```text
/help       list capabilities
/status     bot, preview, build, job, and queue status
/preview    current public preview URL
/build      run the fixed Astro build task
/prompt     submit a scoped prompt after Antigravity API verification
/logs       show bounded, sanitized recent progress
/stop       cancel the active job
/restart    restart one named project service
```

Never add a generic `/exec`, `/cmd`, or `/powershell` command.

## Recommended Architecture

```text
Telegram phone
    |
    | long polling
    v
Local Telegram bot
    +--> allowlisted task runner
    |       +--> build
    |       +--> preview health check
    |       +--> controlled restart/stop
    |
    +--> verified local Antigravity hub
    |
    +--> in-memory queue and progress reporter

Quick Tunnel --> Astro preview only
```

## Implementation Phases

### Phase 1: Bot foundation

- Preserve whitelist middleware before all handlers.
- Add one active-job lock and a predictable queue policy.
- Add graceful shutdown.
- Add structured sanitized logs.
- Add consistent Telegram error handling.
- Validate prompt size and output size.

### Phase 2: Safe task runner

Use a fixed task registry, for example:

```js
const tasks = {
  build: { command: "npm", args: ["run", "build"] },
};
```

Rules:

- Fixed executable and argument arrays.
- Working directory fixed to the repository root.
- No user-controlled executable, cwd, or argument interpolation.
- Timeout every task.
- Bound output and truncate long lines.
- Kill only the active child process tree on Windows.
- Report queued, started, progress, success, failure, and cancelled states.

### Phase 3: Realtime UX

- Send one initial job message.
- Edit that message periodically instead of spamming new messages.
- Throttle updates to respect Telegram limits.
- Include job ID, phase, elapsed time, and final result.
- Keep a short in-memory log buffer.
- Make `/logs` bounded and sanitized.

### Phase 4: Antigravity integration

Verify before coding:

- How the local hub starts.
- Which port it uses.
- Its transport and request format.
- Authentication requirements.
- How to scope a prompt to this repository.
- Progress and completion events.
- Cancellation support.

If the official interface cannot be verified, report the blocker. Do not expose a broad shell as a substitute.

### Phase 5: Recovery

- Keep `start-all.ps1` as the single startup entry point.
- Avoid duplicate polling processes.
- Make startup failures visible in `.runtime` logs.
- Add crash recovery only after lifecycle behavior is tested.

## Security Requirements

- Only `TELEGRAM_ALLOWED_USER_ID` may operate the bot.
- Never expose the BotFather token.
- Never expose Antigravity or arbitrary localhost ports.
- Never accept arbitrary shell commands from Telegram.
- Scope filesystem access to the repository root.
- Add timeouts, queue limits, prompt limits, and output limits.
- Do not log full sensitive prompts or environment values.

## Acceptance Criteria

1. Unauthorized Telegram accounts receive no useful response.
2. The owner can use `/help`, `/status`, and `/preview`.
3. `/build` runs only the fixed Astro build task.
4. Concurrent jobs are rejected or queued predictably.
5. `/stop` cancels only the active allowlisted job.
6. Progress updates are throttled.
7. Replies and logs contain no token or secret values.
8. Windows login starts services once.
9. Quick Tunnel URL changes update `/preview` automatically.
10. Antigravity control uses a verified local interface, or the blocker is clearly reported.

## Useful Commands

```powershell
# Start everything manually
.\start-all.ps1

# Run bot only with auto-reload
node --watch telegram-bot/bot.js

# Build Astro only
npm run build

# Check startup task
Get-ScheduledTask -TaskName 'ASeven Pile - Start Services'

# Disable startup task
Disable-ScheduledTask -TaskName 'ASeven Pile - Start Services'

# Enable startup task
Enable-ScheduledTask -TaskName 'ASeven Pile - Start Services'
```

## Handoff Rule

Before changing behavior, read the current `telegram-bot/bot.js`, `start-all.ps1`, `telegram-bot/package.json`, and `telegram-bot/.env.example`. Preserve user changes. Never read or print the real `.env` value. Run a focused validation after every edit.
