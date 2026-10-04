const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

text = text.replace(
  "const projects = getProjects(cityData.slug).filter(p => p.method === 'Strauss Pile' || p.tags?.includes('strauss'));",
  "const projects = getProjects(cityData.slug, 'strauss');"
);
text = text.replace(
  "const fallbackProjects = getProjects('jakarta').filter(p => p.method === 'Strauss Pile' || p.tags?.includes('strauss'));",
  "const fallbackProjects = getProjects('jakarta', 'strauss');"
);

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
