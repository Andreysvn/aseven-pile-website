# ASeven Pile - Architecture & pSEO Master Plan

File ini berfungsi sebagai panduan arsitektur (Brain/Memory) agar agent AI di masa depan memahami bagaimana sistem ASeven Pile dibangun, khususnya terkait **Telegram Bot Automation** dan **Programmatic SEO (pSEO)**.

## 1. Arsitektur Telegram Bot (Pusat Komando)
Bot Telegram di folder `telegram-bot/` bukan sekadar *chatbot*. Ini adalah **Pusat Komando CI/CD dan CMS**.
- **Fitur Tersedia:** Deploy otomatis, Update Git, Backup Git, Mode Berpikir AI (High Thinking), dan Ganti Model AI.
- **Cara Kerja:** Bot menggunakan `child_process` untuk menjalankan PowerShell script (`start-all.ps1`, `git pull`, `npm run build`).
- **Rule of Thumb:** Untuk fitur otomatisasi/deploy, gunakan *InlineKeyboard* (tombol) di UI `/menu` agar *user* tidak perlu mengetik panjang. Jangan merusak error handler API Google (selalu gunakan `try-catch` atau periksa `result.success`).

## 2. Programmatic SEO (pSEO) Data-Driven
Alih-alih menggunakan ratusan file Markdown statis, ASeven Pile menggunakan pendekatan **Dynamic Data-Driven pSEO** untuk halaman kota/lokal.

- **Single Source of Truth:** `src/data/seo-data.ts`. Di sinilah data master disimpan. 
  - `GLOBAL_FAQS`: FAQ yang muncul di setiap halaman.
  - `SERVICE_CITIES`: Daftar kota target (slug, name, deskripsi unik, dan `localFaqs` khusus kota tsb).
- **Dynamic Router:** `src/pages/area/[kota].astro`. File ini me-looping `SERVICE_CITIES` menggunakan `getStaticPaths`.
- **Aturan Komponen PSEO:** Setiap halaman pSEO **WAJIB** mengandung:
  1. `<PriceCalculator />` (Sama di semua halaman).
  2. `<FAQSection>` yang merupakan gabungan dari `GLOBAL_FAQS` + `localFaqs` kota tersebut.
  3. `<LastUpdated />` untuk memberikan sinyal *freshness* ke Google.

## 3. Strategi SEO "Freshness" (Whitehat)
- **Dynamic Date / Last Updated:** Menggunakan komponen `src/components/ui/LastUpdated.astro`.
- **Cara Kerja:** Komponen ini mengambil `new Date()` pada saat **Build-Time**. Artinya, tanggal hanya akan berubah jika User menekan tombol `[🚀 Deploy]` dari Telegram atau saat ada build ulang server. Ini 100% aman dan disukai Google karena mencerminkan pembaruan server yang sesungguhnya (Bukan pemalsuan Client-Side JavaScript).
- **JSON-LD Schema:** Diletakkan di `src/components/layout/LocalSEOLayout.astro`. Menggunakan tipe `LocalBusiness`. Pastikan selalu menyisipkan `dateModified` sesuai standar.

## 4. Master Plan Selanjutnya (Fase Integrasi CMS)
Agent di masa depan diharapkan membantu mewujudkan Fase 2: **Pembuatan Script CMS Telegram**.
- **Goal:** Menambahkan command `/seo [Kota]` di Telegram Bot.
- **Tugas Bot:** Bot harus membaca command, menggunakan AI untuk membuat teks/FAQ unik untuk kota tersebut, lalu menginjeksikannya (append) ke dalam array `SERVICE_CITIES` di file `src/data/seo-data.ts`, lalu otomatis menjalankan *commit* dan *deploy*.