const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

const replacement = `    steps={[
      { number: 1, title: \`Persiapan Alat & Titik\`, desc: \`Tim membawa alat bor manual ke lokasi di \${cityData.name}. Sangat ringkas, cukup diangkut mobil pick-up kecil dan bisa masuk gang sempit atau di dalam ruangan.\` },
      { number: 2, title: "Pengeboran Manual", desc: "Pengeboran dilakukan dengan memutar pipa dan mata bor secara manual oleh 2-3 orang pekerja hingga mencapai kedalaman tanah keras (rata-rata 6-8 meter)." },
      { number: 3, title: "Pemasangan Besi Tulangan", desc: "Penurunan keranjang besi tulangan SNI ke dalam lubang bor yang sudah dibersihkan." },
      { number: 4, title: "Pengecoran Beton", desc: "Pengecoran beton dilakukan langsung ke dalam lubang bor. Karena lubang biasanya relatif dangkal dan kering (bebas lumpur), beton langsung dituang merata tanpa tercampur tanah." }
    ]}`;

text = text.replace(/steps=\{\[[\s\S]*?\]\}/, replacement);
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
