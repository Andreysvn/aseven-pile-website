$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$envPath = Join-Path $root "telegram-bot\.env"
$runtimeDir = Join-Path $root ".runtime"
$tunnelLog = Join-Path $runtimeDir "cloudflared.log"
$tunnelErrorLog = Join-Path $runtimeDir "cloudflared-error.log"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

# Stop only processes belonging to this project or its preview tunnel.
$projectProcesses = Get-CimInstance Win32_Process | Where-Object {
  ($_.Name -eq "node.exe" -and $_.CommandLine -like "*$root*") -or
  ($_.Name -eq "cloudflared.exe" -and $_.CommandLine -match "127\.0\.0\.1:4321|localhost:4321")
}
$projectProcesses | ForEach-Object {
  Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

Write-Host "Building Astro..."
Push-Location $root
try {
  npm run build
}
finally {
  Pop-Location
}

Write-Host "Starting Astro preview on port 4321..."
Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location -LiteralPath '$root'; npm start"
)

Start-Sleep -Seconds 2

Write-Host "Starting Cloudflare Quick Tunnel..."
Remove-Item $tunnelLog, $tunnelErrorLog -Force -ErrorAction SilentlyContinue
Start-Process cloudflared.exe -ArgumentList "tunnel", "--url", "http://127.0.0.1:4321" `
  -RedirectStandardOutput $tunnelLog `
  -RedirectStandardError $tunnelErrorLog `
  -WindowStyle Hidden | Out-Null

$previewUrl = $null
for ($attempt = 0; $attempt -lt 30 -and -not $previewUrl; $attempt++) {
  Start-Sleep -Seconds 1
  $log = @(
    Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
    Get-Content $tunnelErrorLog -Raw -ErrorAction SilentlyContinue
  ) -join "`n"
  if ($log -match "https://[a-z0-9-]+\.trycloudflare\.com") {
    $previewUrl = $matches[0]
  }
}

if (-not $previewUrl) {
  Write-Host "Cloudflare Tunnel gagal membuat URL. Cek .runtime/cloudflared-error.log" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $envPath)) {
  throw "File telegram-bot/.env tidak ditemukan."
}

$envText = [System.IO.File]::ReadAllText($envPath)
if ($envText -match "(?m)^\s*PREVIEW_URL\s*=") {
  $envText = [regex]::Replace($envText, "(?m)^\s*PREVIEW_URL\s*=.*$", "PREVIEW_URL=$previewUrl")
}
else {
  $envText = $envText.TrimEnd() + "`r`nPREVIEW_URL=$previewUrl`r`n"
}
[System.IO.File]::WriteAllText($envPath, $envText)

Write-Host "Preview URL: $previewUrl" -ForegroundColor Green
Write-Host "Starting Telegram bot in watch mode..."
Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location -LiteralPath '$root'; node --watch telegram-bot/bot.js"
)

Write-Host "All services started. Use /preview in Telegram for the current URL." -ForegroundColor Green