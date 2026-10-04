const fs = require('fs');

// 1. Remove the Kalideres project from projects.ts
let projects = fs.readFileSync('src/data/projects.ts', 'utf8');
const kalideresProjectRegex = /\s*,\s*\{\s*img:\s*'\/imgs\/header-jasa-strauss-pile-jakarta-aseven-pile\.png'[\s\S]*?service:\s*'strauss'\s*\}/;
projects = projects.replace(kalideresProjectRegex, '');
fs.writeFileSync('src/data/projects.ts', projects);

// 2. Remove the 3rd image from MiniGallery fallback in strauss-pile/[kota].astro
let astro = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');
const thirdImageRegex = /,\s*\{\s*src:\s*"\/imgs\/header-jasa-strauss-pile-jakarta-aseven-pile\.png"[^\}]+\}/;
astro = astro.replace(thirdImageRegex, '');
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', astro);
