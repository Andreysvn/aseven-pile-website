const fs = require('fs');
let text = fs.readFileSync('src/data/projects.ts', 'utf8');

// We need to append the strauss projects to the "jakarta" array in PROJECTS
const newProjects = `
    {
      img: '/imgs/wa-gallery-1.webp',
      alt: 'Proyek Strauss Pile Manual Rumah Tinggal di Tebet, Jakarta Selatan',
      area: 'Tebet, Jakarta Selatan',
      diameterCm: 25,
      depthM: 6,
      customSpec: 'Diameter 25 cm &bull; 18 titik &bull; Kedalaman 6 m',
      method: 'Strauss Pile Manual',
      service: 'strauss'
    },
    {
      img: '/imgs/wa-gallery-2.webp',
      alt: 'Proyek Strauss Pile Pagar Keliling di Penjaringan, Jakarta Utara',
      area: 'Penjaringan, Jakarta Utara',
      diameterCm: 20,
      depthM: 5,
      customSpec: 'Diameter 20 cm &bull; 32 titik &bull; Kedalaman 5 m',
      method: 'Pengeboran manual dengan casing',
      service: 'strauss'
    },
    {
      img: '/imgs/header-beranda-bore-pile-aseven.webp',
      alt: 'Proyek Strauss Pile Renovasi Ruko di Kalideres, Jakarta Barat',
      area: 'Kalideres, Jakarta Barat',
      diameterCm: 30,
      depthM: 7,
      customSpec: 'Diameter 30 cm &bull; 12 titik &bull; Kedalaman 7 m',
      method: 'Strauss Pile Manual',
      service: 'strauss'
    },
`;

// Insert after `jakarta: [`
text = text.replace(/jakarta: \[\n/, "jakarta: [\n" + newProjects);
fs.writeFileSync('src/data/projects.ts', text);
