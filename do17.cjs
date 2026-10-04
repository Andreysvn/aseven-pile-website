const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(
  "  const hargaStraussPile = cityData.slug.includes('jakarta') ? 95000 : 90000;\n\n  <ServiceIntro", 
  "  <ServiceIntro"
);

text = text.replace(
  "const calcLoc = getCalculatorLocation(cityData.slug, cityData.province);\n---",
  "const calcLoc = getCalculatorLocation(cityData.slug, cityData.province);\nconst hargaStraussPile = cityData.slug.includes('jakarta') ? 95000 : 90000;\n---"
);

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
