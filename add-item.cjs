const fs = require('fs');
let content = fs.readFileSync('src/pages/layanan/strauss-pile-manual.astro', 'utf8');

const item4 = `          <button class="gallery-item" data-src="https://placehold.co/800x600/eeeeee/999999?text=Strauss+Pile+4" aria-label="Perbesar gambar">
            <div class="image-wrapper">
              <img src="https://placehold.co/800x600/eeeeee/999999?text=Strauss+Pile+4" alt="Proyek strauss pile manual 4" loading="lazy" />
              <div class="zoom-indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
            </div>
          </button>`;

const item5 = `
          <button class="gallery-item" data-src="https://placehold.co/800x600/eeeeee/999999?text=Strauss+Pile+5" aria-label="Perbesar gambar">
            <div class="image-wrapper">
              <img src="https://placehold.co/800x600/eeeeee/999999?text=Strauss+Pile+5" alt="Proyek strauss pile manual 5" loading="lazy" />
              <div class="zoom-indicator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
            </div>
          </button>`;

if (!content.includes('Strauss+Pile+5')) {
  content = content.replace(item4, item4 + item5);
  fs.writeFileSync('src/pages/layanan/strauss-pile-manual.astro', content);
  console.log('Added 5th item');
}
