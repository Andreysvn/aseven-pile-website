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

## Command Telegram Lengkap

### Service Control:
- `/status` — Status semua service
- `/build` — Build Astro
- `/restart` — Restart preview
- `/stop` — Stop semua service
- `/start-svc` — Start semua service
- `/logs` — Lihat log
- `/health` — Cek semua service
- `/preview` — URL tunnel
- `/deploy` — Build + restart
- `/update` — Pull + build + restart
- `/backup` — Commit + push semua

### System Control:
- `/sysinfo` — Info CPU, RAM, Disk
- `/uptime` — Berapa lama nyala
- `/processes` — Running processes
- `/kill [nama/pid]` — Kill proses
- `/monitor-start` — Mulai auto monitor
- `/monitor-stop` — Matikan monitor
- `/monitor-status` — Status monitor

### City Management:
- `/cities` — Daftar semua kota
- `/view-city [slug]` — Detail kota
- `/add-city {json}` — Tambah/edit kota
- `/edit-city [slug]` — Edit kota
- `/delete-city [slug]` — Hapus kota
- `/add-faq [slug] [pertanyaan]` — Tambah FAQ
- `/seo [nama kota]` — Generate via AI

### Price Management:
- `/list-harga` — Daftar harga semua diameter
- `/harga-page [tipe] [d] [kota]` — Lihat URL harga
- `/all-harga-pages` — Semua URL harga
- `/action_update_harga` — Update harga via tombol
- `/action_update_seo-date` — Update tanggal SEO

### SEO Audit:
- `/seo-check` — Cek SEO homepage
- `/seo-audit` — Audit SEO semua halaman kota
- `/seo-page [slug]` — Audit SEO 1 halaman
- `/pricing-check` — Cek konsistensi harga

### Code Quality:
- `/typecheck` — TypeScript check
- `/lint` — Linting
- `/build-check` — Test build
- `/bundle-size` — Cek ukuran bundle

### AI Integration:
- `/ai [pertanyaan]` — Tanya ke AI
- `/ai-model` — Ganti model
- `/ai-status` — Status kuota AI

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

## Data Management dari Telegram

### Tambah Kota:
```
/add-city {"slug":"tangerang","name":"Tangerang","province":"Banten","description":"Jasa bore pile profesional di Tangerang","localFaqs":[{"question":"Tanya?","answer":"Jawab."}]}
```

### Update Harga:
```
/action_update_harga
```
Lalu pilih bore/strauss, masukkan diameter dan harga baru.

### Update Tanggal SEO:
```
/action_update_seo-date
```
Lalu ketik YYYY-MM-DD atau "today".

## Catatan

- Bot memakai long polling, jadi bot tidak membutuhkan Cloudflare Tunnel.
- Quick Tunnel hanya untuk preview website dari HP.
- URL `trycloudflare.com` berubah setiap kali tunnel dibuat ulang.
- Jangan menutup window PowerShell yang menjalankan service.
- Jangan memasukkan token BotFather ke file note atau membagikannya.
- File rahasia berada di `telegram-bot/.env`; template aman ada di `telegram-bot/.env.example`.
- Jika tunnel gagal, lihat log di `.runtime/cloudflared-error.log`.
- WhatsApp: 6285814173761
- Phone: 0858-1417-3761
- Domain: https://asevenpile.com
