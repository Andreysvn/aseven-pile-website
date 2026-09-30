const fs = require('fs');
const file = 'src/pages/layanan/strauss-pile-manual.astro';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<button class="gallery-item" data-src="https:\/\/placehold\.co\/800x600\/eeeeee\/999999\?text=Strauss\+Pile\+1" aria-label="Perbesar gambar">/,
  '<button class="gallery-item" data-src="/assets/images/layanan/strauss-pile/sp-hero.jpg" aria-label="Perbesar gambar">'
);

content = content.replace(
  /<img src="https:\/\/placehold\.co\/800x600\/eeeeee\/999999\?text=Strauss\+Pile\+1" alt="Proyek strauss pile manual 1" loading="lazy" \/>/,
  '<img src="/assets/images/layanan/strauss-pile/sp-hero.jpg" alt="Proyek strauss pile manual 1" loading="lazy" style="object-fit: cover;" />'
);

fs.writeFileSync(file, content);
console.log('Replaced first gallery image');
