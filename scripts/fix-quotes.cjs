const fs = require('fs');
const file = 'src/data/seo-data.ts';
let content = fs.readFileSync(file, 'utf8');

const badString = 'answer: "Tidak. Kami menggunakan metode dry boring (bor kering) tanpa sirkulasi air. Karena prosesnya 100% manual tanpa <a href="/area-layanan/bore-pile/${city.slug}" style="color: var(--color-primary); text-decoration: underline;">mesin bore pile diesel</a>, metode ini sama sekali tidak bising, bebas getaran, dan lokasi proyek lebih bersih dibandingkan metode bor basah."';

const goodString = 'answer: `Tidak. Kami menggunakan metode dry boring (bor kering) tanpa sirkulasi air. Karena prosesnya 100% manual tanpa <a href="/area-layanan/bore-pile/${city.slug}" style="color: var(--color-primary); text-decoration: underline;">mesin bore pile diesel</a>, metode ini sama sekali tidak bising, bebas getaran, dan lokasi proyek lebih bersih dibandingkan metode bor basah.`';

content = content.replace(badString, goodString);
fs.writeFileSync(file, content);
console.log('Fixed seo-data.ts');

