const fs = require('fs');
let bore = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');
bore = bore.replace(/<CostExample\s*\n/g, '<CostExample\n    method="borepile"\n');
fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', bore);

let strauss = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
strauss = strauss.replace(/<CostExample\s*\n/g, '<CostExample\n    method="strauss"\n');
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', strauss);
