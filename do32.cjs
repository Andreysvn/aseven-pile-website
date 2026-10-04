const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
text = text.replace(/<SoilCharacter city=\{cityData\} \/>/g, '<SoilCharacter city={cityData} service="strauss" />');
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
