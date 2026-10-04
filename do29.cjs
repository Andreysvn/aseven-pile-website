const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
text = text.replace(/exampleForCity\(cityData\)/g, "exampleForCity(cityData, 'strauss')");
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
