const fs = require('fs');
let content = fs.readFileSync('src/components/layout/BaseLayout.astro', 'utf8');

content = content.replace(
  /const canonicalURL = new URL\(Astro\.url\.pathname, 'https:\/\/asevenpile\.com'\);/,
  `const siteUrl = new URL(siteConfig.url || 'https://asevenpile.com');
const canonicalURL = new URL(Astro.url.pathname.replace(/index\\.html$/, ''), siteUrl);`
);

fs.writeFileSync('src/components/layout/BaseLayout.astro', content);
