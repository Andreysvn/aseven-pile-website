const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

// Fix SoilCharacter
text = text.replace('<SoilCharacter citySlug={cityData.slug} />', '<SoilCharacter city={cityData} />');

// Fix ProjectGallery
text = text.replace('cityName={cityData.name}', 'city={cityData.name}');
// ProjectGallery doesn't accept fallbackMessage, but let's remove it if it throws an error? Actually Astro just ignores extra props.

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
