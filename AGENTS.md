# AGENTS.md — Panduan untuk AI Agent

Dokumen ini untuk AI agent yang melanjutkan pekerjaan di repo ini. Baca ini dulu sebelum mengubah apa pun.

## Ringkasan proyek
Website **ASeven Pile** (jasa pondasi bore pile & strauss pile), **Astro 5 static site**, bahasa Indonesia, fokus **local SEO** (ratusan halaman kota). Build menghasilkan ~111 halaman.

## Perintah penting
- Build: `npm run build` → output ke `dist/`
- Dev server: `npm run dev` (port 4321)
- **Cek link rusak (WAJIB setelah edit):** `node scripts/linkcheck.mjs dist` → harus keluar `NO BROKEN INTERNAL LINKS`
- Tidak ada lint/typecheck khusus; build yang jadi gate.

## Struktur kunci
```
src/
├── pages/
│   ├── area-layanan/
│   │   ├── index.astro                 # hub area
│   │   ├── [kota].astro                # hub kota (direktori layanan)
│   │   ├── bore-pile/index.astro       # hub layanan bore pile (daftar kota)
│   │   ├── bore-pile/[kota].astro      # ★ HALAMAN MONEY: jasa bore pile per kota
│   │   ├── strauss-pile/index.astro    # hub layanan strauss pile
│   │   └── strauss-pile/[kota].astro   # ★ halaman money: strauss pile per kota
│   ├── harga/
│   │   ├── index.astro                 # kalkulator
│   │   ├── bore-pile/[diameter]-[kota].astro
│   │   └── strauss-pile/[diameter]-[kota].astro
│   └── layanan/...                     # halaman diameter (30/40/50/60/80), mini-crane, dll
├── components/
│   ├── layout/LocalSEOLayout.astro     # layout + SCHEMA semua halaman lokal
│   ├── ui/                             # PricingTable, CostAddons, SoilCharacter, FAQSection, dll
│   └── interactive/                    # CalculatorUI.astro + calculator-logic.ts + calculator.config.ts (VANILLA JS)
└── data/
    ├── cities.json                     # ★ SUMBER DATA per kota
    ├── pricing.ts                      # harga (single source of truth)
    ├── soil.ts                         # karakteristik tanah unik per kota (HTML + link studi)
    ├── projects.ts                     # dokumentasi proyek per kota (galeri + caption lokasi/diameter/kedalaman)
    ├── example.ts                      # generator contoh hitungan biaya per kota (pintar, angka beda tiap wilayah)
    ├── seo-data.ts                     # SERVICE_CITIES, GLOBAL_FAQS, getCityFaqs()
    ├── site.config.ts                  # brand, kontak, contentUpdated
    └── references.ts                   # daftar sumber (dokumentasi)
```

## Arsitektur konten (data-driven pSEO)
- Halaman kota digenerate dari `[kota].astro` + data `cities.json`. **Satu template untuk ratusan kota.**
- Kunci menghindari duplikat: **data per kota harus unik** (lihat "Aturan konten").
- FAQ per layanan via `getCityFaqs(city, 'borepile'|'strauss')` (memisahkan FAQ bore vs strauss; dukung field `localFaqsBore`/`localFaqsStrauss` bila ada).

## ATURAN KONTEN (WAJIB — dari pemilik)
1. **Relevan & sesuai data. Jangan mengarang.** Kalau data tidak ada, tulis umum/apa adanya atau minta ke pemilik.
2. **Klaim faktual harus bersumber nyata.** Tautan studi/riset asli ditaruh **di dalam kalimat (inline)**, BUKAN section "Daftar Referensi" terpisah. Semua URL wajib diverifikasi aktif dulu.
3. **Section "Karakteristik Tanah" hanya membahas karakteristik tanah** — JANGAN bahas batasan pengeboran (kedalaman/metode/limit).
4. **Metode & bahan (fakta pemilik):** tidak pakai polimer/bentonite/mud circulation → pakai **"sirkulasi air"**. Metode: **wash boring (bor basah)** untuk tanah berair, **dry boring (bor kering)** untuk tanah lempung yang lengket.
5. **Hindari frasa "jasa murni" / "jasa pengeboran murni"** → pakai **"jasa bor saja"**.
6. **Jangan menawarkan menghitungkan kebutuhan material klien.** Material mengikuti desain struktur perencana klien.
7. **Konten unik per halaman.** Hindari paragraf identik antar kota (duplikat). Data kota yang masih generik (mis. Tangerang Selatan & Jakarta Selatan) harus diisi.
8. **Jangan pasang link untuk istilah definisi** (mis. "sondir"). Link hanya untuk sumber riset/studi relevan atau halaman internal yang memang relevan (artikel/layanan lain).
9. Bahasa natural, tidak berlebihan/"alay", tanpa tanda "-" yang tidak perlu.
10. Kata "sondir wajib" boleh (untuk menentukan target & tanah keras), tapi jangan bahas limit kedalaman.

## Tugas PENDING (lanjutkan ini)
1. **Data unik per kota** di `cities.json`: `description`, `localFaqs`, `terrain`, `soilType`, `soilDescription`. Isi **Tangerang Selatan & Jakarta Selatan** (masih generik/identik).
2. **Dokumentasi proyek per kota** di `src/data/projects.ts`: isi array per slug (img, area, diameterCm, depthM, method). Foto WAJIB beda per kota. Kalau ada, galeri otomatis ganti dari galeri umum ke galeri proyek (dengan caption lokasi/diameter/kedalaman). Bisa tag `service: 'strauss'` bila proyek manual.
3. **Studi kasus riil per kota**: tambah field `caseStudy` di `cities.json`:
   ```json
   "caseStudy": { "isReal": true, "diameter": 30, "depthM": 10, "points": 15 }
   ```
   Tanpa field ini, `example.ts` menampilkan "Contoh Perhitungan" (angka beda tiap kota, dari `averageDepth`). Bila diisi, berubah jadi "Studi Kasus".
4. **Blok unik tambahan** biar tidak duplikat: intro per kota, dan/atau konten lain berbasis data kota.
5. **Update `siteConfig.contentUpdated`** (di `site.config.ts`) HANYA saat konten benar-benar berubah.
6. Karakteristik tanah tambahan: tambah entri di `src/data/soil.ts` (HTML + link studi terverifikasi).

**Catatan strategi:** konten TETAP berada di halaman kota (jangan dipindah ke halaman layanan). Keunikan diperoleh dari **data unik per wilayah** (karakteristik tanah, FAQ, proyek, contoh hitungan), bukan dari memindah section.

## Konvensi teknis
- **React sudah DIHAPUS.** Kalkulator = `CalculatorUI.astro` (vanilla). Jangan menambah React/island.
- Styling halaman lokal pakai class di `src/styles/local-seo.css` (bukan inline style). Tambah class di sana bila perlu.
- Tanggal "Last Updated" & schema `dateModified` memakai `siteConfig.contentUpdated` (bukan `new Date()`).
- Schema `LocalBusiness` name = `siteConfig.brand` (jangan di-dekorasi keyword per kota).
- Gambar: kompres sebelum commit (font/gambar berat = lambat).

## Alur kerja yang disarankan
1. Ubah data/komponen.
2. `npm run build`
3. `node scripts/linkcheck.mjs dist`
4. Cek halaman hasil di `dist/` (grep konten) atau screenshot.

## Kontak
- Brand: ASeven Pile · Domain: https://asevenpile.com · WA: 6285814173761
