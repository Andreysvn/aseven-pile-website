const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

const regex = /<Fragment slot="bottom-content">[\s\S]*?<\/Fragment>/;
const replacement = `<Fragment slot="bottom-content">
    <LocationMap />
    <ServiceArea city={cityData} service="borepile" />
  </Fragment>`;

text = text.replace(regex, replacement);

// Don't forget to import ServiceArea
if (!text.includes("import ServiceArea")) {
  text = text.replace(
    "import LocationMap from '../../../components/ui/LocationMap.astro';",
    "import LocationMap from '../../../components/ui/LocationMap.astro';\nimport ServiceArea from '../../../components/ui/ServiceArea.astro';"
  );
}

fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);
