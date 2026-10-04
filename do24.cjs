const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
text = text.replace("const calcLoc = getCalculatorLocation(cityData.slug, cityData.province);\r\n---", "const calcLoc = getCalculatorLocation(cityData.slug, cityData.province);\r\nconst hargaStraussPile = cityData.slug.includes('jakarta') ? 95000 : 90000;\r\n---");
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
