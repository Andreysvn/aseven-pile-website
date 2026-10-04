const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

const regex = /<MiniGallery[\s\S]*?images=\{\[[\s\S]*?\]\}\s*\/>/m;
const replacement = `<MiniGallery 
    title={\`Dokumentasi Proyek Strauss Pile \${cityData.name}\`} 
    subtitle="Bukti pengerjaan lapangan pondasi strauss pile manual yang dikerjakan langsung oleh tim spesialis kami."
    images={[
      { src: "/imgs/proses-strauss-pile-jakarta-aseven-pile.png", alt: \`Proses Pengerjaan Strauss Pile di \${cityData.name}\`, fallback: \`Pengeboran+\${cityData.name}\` },
      { src: "/imgs/proses-strauss-pile-2-jakarta-aseven-pile.png", alt: \`Pemasangan Besi Tulangan Strauss Pile \${cityData.name}\`, fallback: \`Besi+Tulangan\` },
      { src: "/imgs/header-jasa-strauss-pile-jakarta-aseven-pile.png", alt: \`Lokasi Proyek Strauss Pile \${cityData.name}\`, fallback: \`Lokasi+Proyek\` }
    ]}
    />`;

text = text.replace(regex, replacement);

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
