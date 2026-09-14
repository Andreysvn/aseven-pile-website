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

# Auto-detect OpenCode server BEFORE starting bot
Write-Host "Detecting OpenCode server..."
$detectedPort = $null

$opencodeProcesses = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -match "opencode" -and $_.CommandLine -match "serve"
}
foreach ($proc in $opencodeProcesses) {
    if ($proc.CommandLine -match "--port\s+(\d+)") {
        $detectedPort = [int]$matches[1]
        Write-Host "Found OpenCode server on port $detectedPort (from process)" -ForegroundColor Green
        break
    }
}

if (-not $detectedPort) {
    $nodeProcesses = Get-CimInstance Win32_Process | Where-Object {
        $_.Name -eq "node.exe" -and $_.CommandLine -match "opencode.*serve"
    }
    foreach ($proc in $nodeProcesses) {
        if ($proc.CommandLine -match "--port\s+(\d+)") {
            $detectedPort = [int]$matches[1]
            Write-Host "Found OpenCode server on port $detectedPort (from node process)" -ForegroundColor Green
            break
        }
    }
}

if (-not $detectedPort) {
    $commonPorts = @(4096, 57777, 8080, 3000, 5000)
    foreach ($port in $commonPorts) {
        try {
            $tcp = New-Object System.Net.Sockets.TcpClient
            $tcp.Connect("127.0.0.1", $port)
            $tcp.Close()
            $detectedPort = $port
            Write-Host "Found OpenCode server on port $detectedPort (from port scan)" -ForegroundColor Green
            break
        } catch {}
    }
}

if (-not $detectedPort) {
    Write-Host "OpenCode server not detected. Starting automatically..." -ForegroundColor Yellow
    try {
        $opencodePath = Get-Command opencode -ErrorAction SilentlyContinue
        if ($opencodePath) {
            Start-Process powershell.exe -ArgumentList @(
                "-NoExit",
                "-Command",
                "opencode serve --port 4096"
            )
            $detectedPort = 4096
            Write-Host "OpenCode server started on port 4096" -ForegroundColor Green
            Start-Sleep -Seconds 3
        } else {
            Write-Host "opencode command not found. Bot will auto-detect when server is available." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Failed to start OpenCode server: $_" -ForegroundColor Red
    }
} else {
    Write-Host "OpenCode server is running on port $detectedPort" -ForegroundColor Green
}

Write-Host "Starting Telegram bot in watch mode..."
Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location -LiteralPath '$root'; node --watch telegram-bot/bot.js"
)

Write-Host "All services started. Use /preview in Telegram for the current URL." -ForegroundColor Green