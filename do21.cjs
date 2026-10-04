const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(/<CostAddons service="borepile" \/>/g, '<CostAddons service="strauss" />');

// Force replace the whole Wilayah Layanan block
const regex = /\{cityData\.groupedAreas && cityData\.groupedAreas\.length > 0 \? \([\s\S]*?<\/Fragment>/;
text = text.replace(regex, '<ServiceArea cityData={cityData} serviceName="Strauss Pile" />\n  </Fragment>');

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
