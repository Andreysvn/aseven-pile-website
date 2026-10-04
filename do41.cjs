const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');
text = text.replace('<ServiceArea city={cityData} service="borepile" />', '<ServiceArea cityData={cityData} serviceName="Bore Pile" />');
fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);

let strauss = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
strauss = strauss.replace('<ServiceArea city={cityData} service="strauss" />', '<ServiceArea cityData={cityData} serviceName="Strauss Pile" />');
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', strauss);
