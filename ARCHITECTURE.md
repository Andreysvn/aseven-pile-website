# ASeven Pile — Architecture & pSEO Notes

Dokumen arsitektur (brain/memory) agar agent AI berikutnya paham sistem ini.
**Aturan konten & tugas pending ada di [`AGENTS.md`](./AGENTS.md) — baca itu dulu.**

## 1. Ringkas
- **Astro 5 static site**, output ke `dist/`. Bahasa Indonesia. **Tanpa React** (kalkulator vanilla JS).
- Fokus **programmatic SEO (pSEO)**: ratusan halaman kota digenerate dari satu template + data `cities.json`.
- Bot Telegram (`telegram-bot/`) = pusat komando CI/CD & CMS (deploy, edit city/harga, SEO audit, AI).

## 2. Sumber data (single source of truth)
| File | Isi |
|---|---|
| `src/data/cities.json` | data per kota (slug, name, province, description, localFaqs, terrain, soilType, soilDescription, averageDepth, subAreas, groupedAreas, opsional `caseStudy`, `localFaqsBore`, `localFaqsStrauss`, `draft`) |
| `src/data/pricing.ts` | harga bore pile & strauss per diameter + `pricingConfig.lastUpdated` |
| `src/data/soil.ts` | **karakteristik tanah unik per kota** (HTML + link studi inline) |
| `src/data/seo-data.ts` | `SERVICE_CITIES`, `GLOBAL_FAQS`, `getCityFaqs(city, service)` |
| `src/data/site.config.ts` | brand, kontak, `contentUpdated` |
| `src/data/references.ts` | dokumentasi sumber (glosarium + studi) |

### Format `cities.json`
```json
{
  "slug": "kebab-case-kota",
  "name": "Nama Kota",
  "province": "Nama Provinsi",
  "description": "Deskripsi unik 2 kalimat...",
  "soilType": "…", "terrain": "…", "averageDepth": "…", "soilDescription": "…",
  "localFaqs": [ { "question": "…", "answer": "…" } ],
  "groupedAreas": [ { "groupName": "…", "areas": ["…"] } ],
  "subAreas": [ { "name": "…", "slug": "…" } ]
}
```

## 3. Halaman yang digenerate
- **Hub area:** `/area-layanan/` (index) dan `/area-layanan/[kota]` (direktori layanan).
- **Hub layanan:** `/area-layanan/bore-pile/`, `/area-layanan/strauss-pile/` (daftar semua kota).
- **Halaman money (kota × layanan):**
  `/area-layanan/bore-pile/[kota]` dan `/area-layanan/strauss-pile/[kota]`
- **Halaman harga:** `/harga/bore-pile/[diameter]-[kota]` dan `/harga/strauss-pile/[diameter]-[kota]`
- **Halaman diameter (bukan per kota):** `/layanan/bore-pile/diameter/[30|40|50|60|80]`, `/layanan/strauss-pile/diameter/[20|25|30|40]`
- **Pendukung:** `/layanan`, `/layanan/bore-pile`, `/layanan/strauss-pile`, artikel, galeri, faq, kontak, tentang-kami.

## 4. Layout & SEO teknis
- `src/components/layout/LocalSEOLayout.astro` — layout semua halaman lokal + JSON-LD (LocalBusiness, Service, FAQPage, BreadcrumbList).
- Schema `LocalBusiness.name` = `siteConfig.brand` (jangan di-dekorasi keyword).
- `dateModified` & badge "Last Updated" = `siteConfig.contentUpdated` (**bukan** `new Date()`).
- Canonical dari `Astro.url.pathname` (BaseLayout). Sitemap auto (`@astrojs/sitemap`).

## 5. Kalkulator (vanilla, tanpa React)
- `src/components/interactive/CalculatorUI.astro` (markup + `<script>` vanilla)
- `src/components/interactive/calculator-logic.ts` (logika + render, dipakai SSR & client)
- `src/components/interactive/calculator.config.ts` (tier, lokasi, mob/demob, lumpsum, WA)
- Prinsip: SSR markup = output builder yang sama dipakai client; update DOM surgical (slider tetap fokus).

## 6. Telemetry/verifikasi
- `npm run build` → gate utama.
- `node scripts/linkcheck.mjs dist` → pastikan `NO BROKEN INTERNAL LINKS`.

## 7. Tech stack
- Astro 5.8 · TypeScript 5.8 · `@astrojs/sitemap`
- **Tidak ada** React / Tailwind.
- Kalkulator & FAQ accordion: vanilla JS (web component / script).
- Bot: Grammy (Telegram), OpenCode SDK, Gemini API.

## 8. Konvensi
- Styling halaman lokal: class di `src/styles/local-seo.css`.
- Jangan pasang inline style baru — pakai class.
- Data per kota harus unik & jujur (lihat `AGENTS.md`).

## 9. Kontak
- Brand: ASeven Pile · Domain: https://asevenpile.com · WA: 6285814173761
