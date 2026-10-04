const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(
  "heroImage={cityData.slug === 'jakarta' ? '/imgs/header-jasa-bore-pile-jakarta-aseven-pile.webp' : undefined}",
  "heroImage={cityData.slug === 'jakarta' ? '/imgs/header-jasa-strauss-pile-jakarta-aseven-pile.png' : undefined}"
);

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
