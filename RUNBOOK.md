# ASeven Pile - Runbook

## Start otomatis

Setelah login Windows, Task Scheduler menjalankan project otomatis.

Untuk menjalankan manual dari root project:

```powershell
.\start-all.ps1
```

Script ini menjalankan build Astro, preview port `4321`, Cloudflare Quick Tunnel, update `telegram-bot/.env`, dan bot Telegram mode watch.

## Cek dari Telegram

```text
/status
/preview
/help
```

## Stop sementara

Menghentikan proses sekarang, tetapi auto-start tetap aktif:

```powershell
$root = 'C:\Users\Asus\OneDrive\Dokumen\aseven-pile-website-main'
Get-CimInstance Win32_Process |
  Where-Object { $_.Name -eq 'cloudflared.exe' -or ($_.Name -eq 'node.exe' -and $_.CommandLine -like "*$root*") } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

## Nonaktifkan auto-start

```powershell
Disable-ScheduledTask -TaskName 'ASeven Pile - Start Services'
```

Aktifkan lagi:

```powershell
Enable-ScheduledTask -TaskName 'ASeven Pile - Start Services'
```

## Cek Task Scheduler

```powershell
Get-ScheduledTask -TaskName 'ASeven Pile - Start Services'
```

Status yang diharapkan: `Ready`.

## Catatan

- Bot memakai long polling, jadi bot tidak membutuhkan Cloudflare Tunnel.
- Quick Tunnel hanya untuk preview website dari HP.
- URL `trycloudflare.com` berubah setiap kali tunnel dibuat ulang.
- Jangan menutup window PowerShell yang menjalankan service.
- Jangan memasukkan token BotFather ke file note atau membagikannya.
- File rahasia berada di `telegram-bot/.env`; template aman ada di `telegram-bot/.env.example`.
- Jika tunnel gagal, lihat log di `.runtime/cloudflared-error.log`.
