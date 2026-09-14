# ASeven Pile - Architecture & pSEO Master Plan

File ini berfungsi sebagai panduan arsitektur (Brain/Memory) agar agent AI di masa depan memahami bagaimana sistem ASeven Pile dibangun, khususnya terkait **Telegram Bot Automation** dan **Programmatic SEO (pSEO)**.

## 1. Arsitektur Telegram Bot (Pusat Komando)
Bot Telegram di folder `telegram-bot/` bukan sekadar *chatbot*. Ini adalah **Pusat Komando CI/CD dan CMS**.

### Fitur yang Tersedia:
- **Service Control:** Deploy, Restart, Stop, Start, Logs, Health Check
- **System Control:** Sysinfo, Uptime, Processes, Kill, Monitor, Restart PC, Shutdown PC
- **Git Control:** Status, Diff, Pull, Add, Commit, Push, Log
- **File Explorer:** LS, Cat, Edit, Mkdir, Touch, RM
- **Code Quality:** TypeCheck, Lint, Build Check, Bundle Size
- **SEO Management:** SEO Check, SEO Audit, SEO Page, Pricing Check
- **City Management:** Cities, View City, Add City, Edit City, Delete City, Add FAQ
- **Price Management:** List Harga, Harga Page, All Harga Pages
- **AI Integration:** Chat, Model Switch, Provider Switch (OpenCode/Gemini)
- **Auto Monitor:** Auto-restart services, auto-rebuild on low disk/RAM

### Cara Kerja:
- Bot menggunakan `child_process` untuk menjalankan PowerShell script (`start-all.ps1`, `git pull`, `npm run build`)
- OpenCode SDK (`@opencode-ai/sdk`) untuk AI integration
- Gemini API untuk AI alternatif (multi-account, thinking levels)
- CommonJS modules, lazy-loaded ESM SDK

### Rule of Thumb:
- Untuk fitur otomatisasi/deploy, gunakan *InlineKeyboard* (tombol) di UI `/menu`
- Jangan merusak error handler API Google (selalu gunakan `try-catch` atau periksa `result.success`)
- SEMUA perubahan data harus lewat Telegram bot, bukan edit manual

## 2. Programmatic SEO (pSEO) Data-Driven
Alih-alih menggunakan ratusan file Markdown statis, ASeven Pile menggunakan pendekatan **Dynamic Data-Driven pSEO** untuk halaman kota/lokal.

### Data Structure:
- **Single Source of Truth:** `src/data/cities.json` — data kota SEO
- **Pricing Data:** `src/data/pricing.ts` — harga bore pile & strauss pile
- **Site Config:** `src/data/site.config.ts` — config website (phone, WA, address)
- **SEO Data:** `src/data/seo-data.ts` — import dari cities.json + GLOBAL_FAQS

### Data Format `cities.json`:
```json
{
  "slug": "kebab-case-kota",
  "name": "Nama Kota",
  "province": "Nama Provinsi",
  "description": "Deskripsi unik 2 kalimat...",
  "localFaqs": [
    { "question": "Pertanyaan spesifik wilayah?", "answer": "Jawaban" }
  ]
}
```

### Data Format `pricing.ts`:
```typescript
// Bore Pile (Mesin)
export const pricingTiers = [
  { diameter: 30, pricePerMeter: { min: 115000, max: 115000 }, isEstimate: false, notes: "..." },
  { diameter: 40, pricePerMeter: { min: 130000, max: 130000 }, isEstimate: false, notes: "..." },
  { diameter: 50, pricePerMeter: { min: 185000, max: 185000 }, isEstimate: false, notes: "..." },
  { diameter: 60, pricePerMeter: { min: 250000, max: 300000 }, isEstimate: true, notes: "..." },
  { diameter: 80, pricePerMeter: { min: 300000, max: 350000 }, isEstimate: true, notes: "..." }
];

// Strauss Pile (Manual)
export const straussTiers = [
  { diameter: 20, pricePerMeter: { min: 70000, max: 70000 }, isEstimate: false, notes: "..." },
  { diameter: 25, pricePerMeter: { min: 75000, max: 75000 }, isEstimate: false, notes: "..." },
  { diameter: 30, pricePerMeter: { min: 85000, max: 85000 }, isEstimate: false, notes: "..." },
  { diameter: 40, pricePerMeter: { min: 110000, max: 110000 }, isEstimate: false, notes: "..." }
];

export const pricingConfig = {
  lastUpdated: "2026-09-10",
  mobilizationFee: 3500000,
  minimumDepthLumpsum: 50,
};
```

### Halaman yang Di-generate:
1. **Halaman Kota:** `/area/[kota].astro`
   - Bore pile + Strauss pile + Pondasi paku bumi
   - Harga, FAQ, Internal linking, Schema markup

2. **Halaman Harga Bore Pile:** `/harga/bore-pile/[diameter]-[kota].astro`
   - URL: `/harga/bore-pile/30cm-jakarta-selatan`
   - Harga per meter, spesifikasi, FAQ, link ke diameter/kota lain

3. **Halaman Harga Strauss Pile:** `/harga/strauss-pile/[diameter]-[kota].astro`
   - URL: `/harga/strauss-pile/20cm-jakarta-selatan`
   - Harga per meter, spesifikasi, FAQ, link ke diameter/kota lain

### Total Halaman:
- Bore Pile: 5 diameter × N kota
- Strauss Pile: 4 diameter × N kota
- Kota: N halaman
- Contoh (2 kota): 10 + 8 + 2 = 20 halaman

## 3. Telegram Commands

### City Management:
| Command | Fungsi |
|---------|--------|
| `/cities` | Daftar semua kota |
| `/view-city [slug]` | Detail 1 kota |
| `/add-city {json}` | Tambah/edit kota |
| `/edit-city [slug]` | Edit kota (dengan JSON baru) |
| `/delete-city [slug]` | Hapus kota |
| `/add-faq [slug] [pertanyaan]` | Tambah FAQ |
| `/seo [nama kota]` | Generate via AI |

### Price Management:
| Command | Fungsi |
|---------|--------|
| `/list-harga` | Daftar harga semua diameter |
| `/harga-page [tipe] [d] [kota]` | Lihat URL 1 halaman |
| `/all-harga-pages` | Semua URL harga |
| `/action_update_harga` | Update harga via tombol |
| `/action_update_seo-date` | Update tanggal SEO |

### SEO Audit:
| Command | Fungsi |
|---------|--------|
| `/seo-check` | Cek SEO homepage |
| `/seo-audit` | Audit SEO semua halaman kota |
| `/seo-page [slug]` | Audit SEO 1 halaman |
| `/pricing-check` | Cek konsistensi harga |

### System:
| Command | Fungsi |
|---------|--------|
| `/sysinfo` | Info CPU, RAM, Disk |
| `/uptime` | Berapa lama nyala |
| `/monitor-start` | Mulai auto monitor |
| `/monitor-stop` | Matikan monitor |
| `/project-health` | Cek semua aspek |
| `/typecheck` | TypeScript check |
| `/lint` | Linting |
| `/build-check` | Test build |
| `/deploy` | Build + restart |

## 4. Strategi SEO "Freshness" (Whitehat)
- **Dynamic Date / Last Updated:** Menggunakan komponen `src/components/ui/LastUpdated.astro`
- **Cara Kerja:** Tanggal diambil saat **Build-Time**. Hanya berubah saat deploy ulang.
- **JSON-LD Schema:** Di `src/components/layout/LocalSEOLayout.astro`. Tipe `LocalBusiness` + `BreadcrumbList`.
- **Internal Linking:** Setiap halaman kota link ke kota lain + halaman harga per diameter.

## 5. File Structure
```
src/
├── pages/
│   ├── index.astro
│   ├── harga.astro (global calculator)
│   ├── area/
│   │   └── [kota].astro (per kota)
│   └── harga/
│       ├── bore-pile/
│       │   └── [diameter]-[kota].astro
│       └── strauss-pile/
│           └── [diameter]-[kota].astro
├── data/
│   ├── cities.json (data kota)
│   ├── pricing.ts (harga)
│   ├── site.config.ts (config)
│   └── seo-data.ts (import)
├── components/
│   ├── layout/
│   │   ├── BaseLayout.astro
│   │   └── LocalSEOLayout.astro
│   ├── calculator/
│   │   └── PriceCalculator.tsx
│   └── ui/
│       └── LastUpdated.astro
telegram-bot/
├── bot.js (main bot)
├── utils/
│   ├── ai.js (AI controller)
│   ├── opencode-client.js (OpenCode SDK)
│   ├── gemini-client.js (Gemini API)
│   └── runner.js (command runner)
```

## 6. Contact Info
- WhatsApp: 6285814173761
- Phone: 0858-1417-3761
- Domain: https://asevenpile.com
- Email: (di site.config.ts)

## 7. Tech Stack
- Astro 5.8 (Static Site Generator)
- React 19 (Interactive components)
- TypeScript 5.8
- Tailwind CSS
- Grammy (Telegram Bot Framework)
- OpenCode SDK (AI)
- Gemini API (AI alternatif)
