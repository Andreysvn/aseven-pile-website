const fs = require('fs');
const file = 'src/data/seo-data.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'Karena prosesnya 100% manual tanpa mesin diesel',
  'Karena prosesnya 100% manual tanpa <a href="/area-layanan/bore-pile/${city.slug}" style="color: var(--color-primary); text-decoration: underline;">mesin bore pile diesel</a>'
);
fs.writeFileSync(file, content);
console.log('Done modifying seo-data.ts');
