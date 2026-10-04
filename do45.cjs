const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(
  '        { src: "/imgs/header-beranda-bore-pile-aseven.webp", alt: `Proses Pengerjaan Strauss Pile di \\${cityData.name}`, fallback: `Pengeboran+\\${cityData.name}` },\n        { src: "/imgs/header-beranda-bore-pile-aseven-2.webp", alt: `Pemasangan Besi Tulangan Strauss Pile \\${cityData.name}`, fallback: `Besi+Tulangan` },\n        { src: "/imgs/wa-gallery-1.webp", alt: `Pengecoran Pipa Tremi \\${cityData.name}`, fallback: `Pengecoran+Tremi` }',
  '        { src: "/imgs/proses-strauss-pile-jakarta-aseven-pile.png", alt: `Proses Pengerjaan Strauss Pile di \\${cityData.name}`, fallback: `Pengeboran+\\${cityData.name}` },\n        { src: "/imgs/proses-strauss-pile-2-jakarta-aseven-pile.png", alt: `Pemasangan Besi Tulangan Strauss Pile \\${cityData.name}`, fallback: `Besi+Tulangan` },\n        { src: "/imgs/header-jasa-strauss-pile-jakarta-aseven-pile.png", alt: `Lokasi Pengeboran Strauss Pile \\${cityData.name}`, fallback: `Lokasi+Proyek` }'
);

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
