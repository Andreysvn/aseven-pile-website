const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(/biaya bore pile/gi, 'biaya strauss pile');
text = text.replace(/jasa bore pile/gi, 'jasa strauss pile');
text = text.replace(/Tabel Harga Bore Pile/gi, 'Tabel Harga Strauss Pile');
text = text.replace(/Keunggulan Jasa Bore Pile/gi, 'Keunggulan Jasa Strauss Pile');
text = text.replace(/khususnya bore pile/gi, 'khususnya strauss pile');
text = text.replace(/SECTION 7: Bore Pile Mesin vs Tiang Pancang/gi, 'SECTION 7: Strauss Pile vs Bore Pile');
text = text.replace(/Pemasangan Besi Tulangan Bore Pile/gi, 'Pemasangan Besi Tulangan Strauss Pile');

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
