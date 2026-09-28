const fs = require('fs');
const files = [
  'src/pages/layanan/bore-pile-mesin/mini-crane.astro',
  'src/pages/layanan/strauss-pile-manual.astro'
];

const cssToAdd = `
  .image-wrapper {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: var(--color-border-light);
    border-radius: var(--radius-lg);
  }

  .image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .zoom-indicator {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .gallery-item:hover .image-wrapper img {
    transform: scale(1.05);
  }

  .gallery-item:hover .zoom-indicator {
    opacity: 1;
  }
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('.image-wrapper {')) {
    if (content.includes('/* LIGHTBOX STYLES */')) {
      content = content.replace('/* LIGHTBOX STYLES */', cssToAdd + '\n  /* LIGHTBOX STYLES */');
    } else {
      content = content.replace('</style>', cssToAdd + '\n</style>');
    }
    fs.writeFileSync(f, content);
    console.log('Fixed CSS in ' + f);
  }
});
