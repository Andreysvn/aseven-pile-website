const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

text = text.replace(
    /<ServiceIntro service="borepile" cityName=\{cityData\.name\} hargaMulai=\{120000\} foundingYear=\{siteConfig\.foundingYear\} \/>/,
    '<ServiceIntro service="borepile" cityName={cityData.name} hargaMulai={120000} foundingYear={siteConfig.foundingYear} />\n\n  <!-- ================================================ -->\n  <!-- SECTION: Karakteristik Tanah                     -->\n  <!-- ================================================ -->\n  <SoilCharacter city={cityData} />'
);

fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);
