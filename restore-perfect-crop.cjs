const fs = require('fs');
const file = 'src/pages/layanan/strauss-pile-manual.astro';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix hero image
content = content.replace(/\.hero-image img \{[^}]+\}/, `.hero-image img {
    width: 100%;
    height: 450px;
    object-fit: cover;
    object-position: 50% 85% !important;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }`);

// 2. Fix gallery css
content = content.replace(/height: 350px;/g, 'height: 450px;');
content = content.replace(/object-position: 50% 60% !important;/g, 'object-position: 50% 85% !important;');

fs.writeFileSync(file, content);
console.log('Restored the exact 450px + 85% crop that the user liked in their original screenshot');
