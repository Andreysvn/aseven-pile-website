$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Cari PID bot lama (node.exe yang jalankan bot.js)
$oldBot = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -eq "node.exe" -and $_.CommandLine -like "*bot.js*"
} | Select-Object -First 1

# Start bot baru di window baru
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; node --watch telegram-bot/bot.js"

Start-Sleep -Seconds 3

# Kill bot lama
if ($oldBot) {
  Stop-Process -Id $oldBot.ProcessId -Force -ErrorAction SilentlyContinue
}
