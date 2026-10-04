const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(/title=\{\`Harga Jasa Bore Pile \$\{cityData\.name\} 2026 \| Aseven Pile\`\}/g, "title={`Kalkulator Biaya Strauss Pile ${cityData.name}`}");
text = text.replace(/description="Gunakan kalkulator ini untuk menghitung total RAB pondasi bore pile proyek Anda\."/g, 'description="Gunakan kalkulator ini untuk menghitung total RAB pondasi strauss pile proyek Anda."');
text = text.replace(/defaults=\{\{ method: 'borepile', location: calcLoc, depth: 12, points: 30 \}\}/g, "defaults={{ method: 'strauss', location: calcLoc, depth: 6, points: 15 }}");

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
