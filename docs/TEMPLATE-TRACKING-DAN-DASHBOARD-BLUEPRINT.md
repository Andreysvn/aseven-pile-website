# Blueprint & Template Arsitektur: Website Tracking, Attribution & Private CRM Dashboard

Dokumen ini adalah **cetak biru (blueprint) siap pakai** untuk menduplikasi sistem pelacakan trafik, atribusi omnichannel, dan dashboard CRM Google Sheets yang telah teruji (*battle-tested*) pada proyek ASeven Pile.

Dokumen ini dirancang agar Anda dapat mengimplementasikannya kembali untuk **klien atau proyek website berikutnya** dengan cepat, tanpa harus memulai dari nol dan tanpa mengulangi *bug-bug* umum pelacakan web.

---

## 1. Arsitektur Sistem (High-Level Overview)

Sistem ini terdiri dari 4 komponen independen tanpa biaya server bulanan (*zero cloud cost*):

```
[ Pengunjung Website ]
         │
         ▼ (Kirim Event: Landing, Scroll 25-100%, Klik WA)
[ Cloudflare Worker Proxy ]  (/api/events)
         │  (Masking IP & Mencegah CORS block)
         ▼
[ Ingest Webhook (Apps Script Publik) ]
         │  (Validasi Payload & Anti-Duplicate eventId)
         ▼
[ Google Sheets Database ]  (Tab: Events, Leads, Audit)
         ▲
         │ (Baca Data Real-Time & Auth via Google Login)
[ Private Dashboard (Apps Script Privat) ]  (Web App Pemilik)
```

### Mengapa Memisahkan 2 Proyek Apps Script?
1. **Proyek Ingest (Publik):** Berjalan sebagai `Execute as: Me` dan `Who has access: Anyone`. Script ini hanya memiliki izin menulis baris baru (`appendRow`) ke tab `Events`. Tidak ada API untuk membaca data atau membuka sheet. Aman diekspos ke publik/website.
2. **Proyek Dashboard (Privat):** Memiliki proteksi otorisasi ketat (`assertOwner_()`). Hanya email pemilik (`OWNER_EMAIL`) yang diizinkan membuka UI, mengelola data CRM, mencatat DP, dan mengekspor konversi iklan.

---

## 2. Struktur Database Google Sheets

Buat satu Google Spreadsheet baru dengan 3 tab berikut:

### Tab 1: `Events`
Menampung seluruh riwayat interaksi pengunjung dari website:
| Kolom | Nama Header | Tipe Data | Keterangan |
|---|---|---|---|
| A | `eventId` | String | ID unik (UUID/Timestamp unik) |
| B | `event` | String | `LANDING`, `SCROLL_25`, `SCROLL_50`, `SCROLL_75`, `SCROLL_90`, `SCROLL_100`, `CLICK_WA` |
| C | `timestamp` | ISO-8601 | Waktu event tercatat (contoh: `2026-11-11T05:30:00.000Z`) |
| D | `page` | String | Path halaman (contoh: `/layanan/bore-pile/`) |
| E | `gclid` | String | Google Click ID jika berasal dari Google Ads |
| F | `utmSource` | String | Sumber kampanye (`google_maps`, `instagram`, dll.) |
| G | `utmMedium` | String | Medium kampanye (`cpc`, `organic`, dll.) |
| H | `utmCampaign` | String | Nama kampanye iklan |
| I | `utmTerm` | String | Kata kunci penelusuran |
| J | `utmContent` | String | Variasi materi iklan |
| K | `ip` | String | Alamat IP tersamar (contoh: `36.70.221.0/24`) |
| L | `referrer` | String | URL perujuk (contoh: `https://l.instagram.com/`) |
| M | `device` | String | Kategori & layar (contoh: `Desktop (1366x768) · Scroll 100%`) |
| N | `linkedLeadId` | String | ID prospek CRM jika event ini terhubung ke deal riil |
| O | `reviewState` | String | Status audit event (`LINKED`, dll.) |

### Tab 2: `Leads`
Menampung data CRM dan pencatatan konversi bisnis:
`leadId`, `createdAt`, `customerName`, `phone`, `service`, `projectLocation`, `projectStatus`, `quoteValue`, `source`, `linkedEventId`, `gclid`, `dpValue`, `dpTimestamp`, `finalServiceValue`, `completionTimestamp`, `adsTransactionId`, `conversionAction`, `currency`, `conversionState`, `notes`.

### Tab 3: `Audit`
Menampung log aktivitas operator untuk keamanan data:
`auditId`, `timestamp`, `actor`, `action`, `recordType`, `recordId`, `details`.

---

## 3. Logika Kunci & Solusi Masalah Nyata (The Secret Sauce)

Bagian ini merangkum solusi teknis terhadap jebakan (*gotchas*) umum yang sering merusak akurasi data:

### A. Deteksi Scroll 100% Mentok Footer (Foolproof Footer Reach)
* **Masalah:** Jika hanya mengandalkan rumus `(window.innerHeight + window.scrollY) >= docEl.scrollHeight - 15`, pengguna yang membuka di HP atau layar laptop tertentu sering kali tertahan di angka `90%` atau `95%` meskipun mereka sudah melihat footer.
* **Solusi Teruji:** Gunakan tiga lapisan deteksi sekaligus:
  ```javascript
  const footerEl = document.querySelector('footer, .footer');
  const footerInView = footerEl ? (footerEl.getBoundingClientRect().top <= window.innerHeight) : false;
  const isAtBottom = (window.innerHeight + window.scrollY) >= (docEl.scrollHeight - 100);
  let currentPercent = Math.min(100, Math.round((window.scrollY / scrollHeight) * 100));

  // Jika footer masuk layar, atau sisa jarak <= 100px, atau scroll >= 95% -> Kunci 100%!
  if (isAtBottom || footerInView || currentPercent >= 95) {
    currentPercent = 100;
  }
  ```

### B. Deduplikasi Sesi Bebas Resizing (Session Consolidation)
* **Masalah:** Jika membandingkan resolusi layar (`Desktop (1036x680)` vs `Desktop (493x681)`), saat pengunjung melakukan *split-screen*, mengubah ukuran jendela browser, atau memutar layar HP (*landscape* ke *portrait*), satu kunjungan akan pecah menjadi 4-5 baris berbeda di dashboard.
* **Solusi Teruji:**
  1. Hapus perbandingan piksel layar dari kunci deduplikasi sesi.
  2. Kelompokkan sesi berdasarkan: **IP + Clean URL (tanpa trailing slash) + Kanal Sumber** dalam jendela waktu 30 menit (atau GCLID yang sama).
  ```javascript
  const url = (ev.url || '/').replace(/\/+$/, '') || '/';
  // Cocokkan sesi aktif sebelumnya dalam jendela 30 menit:
  if (s.ip === ip && sUrl === url && s.source === ev.source) {
    const timeDiff = Math.abs(evTime - s.lastTime);
    if (timeDiff <= 30 * 60 * 1000) {
      matched = s; // GABUNGKAN KE SESI INI
    }
  }
  ```
  3. Hasil di Dashboard: Ditampilkan sebagai **1 baris sesi utuh** dengan rekam jejak: `Tahapan: 25% → 50% → 90% → 100%`, dan kedalaman mengambil nilai tertinggi (`100%`).

### C. Klasifikasi Kanal Otomatis (Omnichannel Engine)
Fungsi `classifyTrafficSource_(event)` di backend memetakan sumber trafik secara akurat tanpa tertukar:
1. **Google Ads (`ADS`):** Memiliki parameter `gclid` valid atau `utm_medium=cpc`.
2. **Google Maps (`MAPS`):** Parameter `utm_source=google_maps` / `gmb` atau referrer `maps.google.com`.
3. **SEO Google Organic (`SEO`):** `utm_medium=organic` atau referrer mesin telusur (`google.com`, `bing.com`).
4. **Instagram (`INSTAGRAM`):** `utm_source=instagram` / `ig` atau referrer `instagram.com`.
5. **TikTok (`TIKTOK`):** `utm_source=tiktok` atau referrer `tiktok.com`.
6. **Facebook (`FACEBOOK`):** `utm_source=facebook` / `fb` atau referrer `facebook.com` / `fb.com`.
7. **YouTube (`YOUTUBE`):** `utm_source=youtube` atau referrer `youtube.com` / `youtu.be`.
8. **WhatsApp (`WHATSAPP`):** `utm_source=whatsapp` / `wa` atau referrer `wa.me` / `whatsapp.com`.
9. **Direct (`DIRECT`):** Tidak ada parameter kampanye dan referrer kosong / internal domain.

Penempatan spesifik (`utm_medium`) otomatis diberi badge di dasbor:
* `qr` $\rightarrow$ `📷 QR Code`
* `bio` $\rightarrow$ `🔗 Bio Link`
* `story` $\rightarrow$ `⚡ Story Link`
* `video` $\rightarrow$ `▶ Video Link`
* `chat` $\rightarrow$ `💬 Chat WA`
* `page` $\rightarrow$ `📄 Halaman Web`
* `offline` $\rightarrow$ `🏷 Spanduk/Fisik`

---

## 4. Panduan Format Tautan Kampanye Klien (Format Siap Pakai)

Untuk diberikan kepada tim marketing atau klien saat menyebarkan tautan website:

| Kanal Distribusi | Format URL Rekomendasi |
|---|---|
| **Google Maps (GBP)** | `https://domain.com/halaman/?utm_source=google_maps&utm_medium=organic` |
| **Instagram (Bio)** | `https://domain.com/halaman/?utm_source=instagram&utm_medium=bio` |
| **Instagram (Story / QR)** | `https://domain.com/halaman/?utm_source=instagram&utm_medium=story` *(atau `utm_medium=qr`)* |
| **TikTok (Bio / Video / QR)** | `https://domain.com/halaman/?utm_source=tiktok&utm_medium=bio` *(atau `utm_medium=qr`)* |
| **Facebook (Post / Halaman / QR)** | `https://domain.com/halaman/?utm_source=facebook&utm_medium=page` *(atau `utm_medium=qr`)* |
| **YouTube (Deskripsi / QR Video)**| `https://domain.com/halaman/?utm_source=youtube&utm_medium=video` *(atau `utm_medium=qr`)* |
| **WhatsApp Chat / Broadcast / QR** | `https://domain.com/halaman/?utm_source=whatsapp&utm_medium=chat` *(atau `utm_medium=qr`)* |
| **Spanduk / Banner Cetak (QR)** | `https://domain.com/halaman/?utm_source=banner&utm_medium=qr&utm_campaign=spanduk_proyek` |

---

## 5. Langkah Cepat Deployment untuk Klien Baru (Cloning Steps)

Jika ingin membuat dashboard yang sama untuk proyek baru, ikuti urutan berikut:

### Langkah 1: Buat Google Spreadsheet
1. Buat Google Sheet baru di akun Google klien.
2. Buat tab `Events`, `Leads`, dan `Audit` dengan susunan header sesuai Bab 2 di atas.
3. Salin `SHEET_ID` dari URL browser: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`.

### Langkah 2: Deploy Event Ingest Script
1. Buat Google Apps Script baru (*standalone* atau via Clasp).
2. Salin kode dari `apps-script/event-ingest/Code.gs`.
3. Buka **Project Settings** $\rightarrow$ **Script Properties** $\rightarrow$ Tambahkan property:
   * Key: `SHEET_ID` | Value: `[SHEET_ID_ANDA]`
4. Klik **Deploy** $\rightarrow$ **New deployment**:
   * Type: `Web app`
   * Execute as: `Me`
   * Who has access: `Anyone`
5. Salin URL Web App yang dihasilkan (ini menjadi URL Webhook penerima event).

### Langkah 3: Deploy Private Dashboard
1. Buat Google Apps Script kedua.
2. Masukkan file `Code.gs` dan `Index.html` dari direktori `apps-script/dashboard/`.
3. Buka **Project Settings** $\rightarrow$ **Script Properties** $\rightarrow$ Tambahkan property:
   * Key: `SHEET_ID` | Value: `[SHEET_ID_ANDA]`
   * Key: `OWNER_EMAIL` | Value: `email_pemilik@gmail.com`
   * Key: `CONVERSION_ACTION` | Value: `DP Proyek Masuk` (sesuaikan dengan nama action di Google Ads)
4. Klik **Deploy** $\rightarrow$ **New deployment**:
   * Type: `Web app`
   * Execute as: `User accessing the web app` (atau `Me` dengan proteksi `assertOwner_()`)
   * Who has access: `Anyone with Google account`
5. Buka URL Web App untuk mengakses dashboard bisnis klien.

### Langkah 4: Pasang Skrip di Website Klien
1. Salin modul `src/scripts/gclid-attribution.js` dan logika scroll di `src/scripts/main.js` ke proyek website baru.
2. Arahkan endpoint pengiriman event (`gclidEventEndpoint`) ke URL Ingest Script (atau via Cloudflare Worker reverse proxy `/api/events`).
3. Pasang tombol WhatsApp dinamis dengan deteksi otomatis.

---

## 6. Fitur Unggulan Dashboard Pemilik

* 📊 **Analitik Kedalaman Minat (5-Tier Funnel):**
  * `0 - 25% (Skimming)`: Pengunjung baru buka halaman.
  * `25 - 50% (Mulai Baca)`: Membaca deskripsi layanan.
  * `50 - 75% (Micro GAds)`: Lolos kualifikasi sinyal minat Google Ads.
  * `75 - 90% (Hampir Tuntas)`: Membaca tabel harga & spesifikasi teknis.
  * `90 - 100% (Tuntas Footer)`: Membaca FAQ dan menembus footer paling bawah.
* 🏷️ **Tab Filter 8 Kanal:** Pisahkan analitik dalam satu klik untuk Google Ads, SEO, Google Maps, Instagram, TikTok, Facebook, WhatsApp, dan Direct.
* 💼 **CRM Pipeline & Offline Conversion:**
  * Hubungkan chat WhatsApp ke data prospek riil.
  * Catat DP dan nilai final proyek.
  * Ekspor file konversi offline berformat standar Google Ads dengan kepatuhan batas waktu penyesuaian 54 hari (*54-day adjustment window*).
