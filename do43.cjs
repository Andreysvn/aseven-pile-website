const fs = require('fs');
let text = fs.readFileSync('src/data/projects.ts', 'utf8');

const newProjects = `    },
    {
      img: '/imgs/proses-strauss-pile-jakarta-aseven-pile.png',
      alt: 'Proyek Strauss Pile Rumah Tinggal di Tebet, Jakarta Selatan',
      area: 'Tebet, Jakarta Selatan',
      customSpec: 'Diameter 25 cm &bull; 18 titik &bull; Kedalaman 6 m',
      method: 'Strauss pile manual (gang 1,2 m)',
      service: 'strauss'
    },
    {
      img: '/imgs/proses-strauss-pile-2-jakarta-aseven-pile.png',
      alt: 'Proyek Strauss Pile Pagar Keliling di Penjaringan, Jakarta Utara',
      area: 'Penjaringan, Jakarta Utara',
      customSpec: 'Diameter 20 cm &bull; 32 titik &bull; Kedalaman 5 m',
      method: 'Strauss pile manual (pakai casing)',
      service: 'strauss'
    },
    {
      img: '/imgs/header-jasa-strauss-pile-jakarta-aseven-pile.png',
      alt: 'Proyek Strauss Pile Renovasi Ruko di Kalideres, Jakarta Barat',
      area: 'Kalideres, Jakarta Barat',
      customSpec: 'Diameter 30 cm &bull; 12 titik &bull; Kedalaman 7 m',
      method: 'Strauss pile manual (di dalam ruangan)',
      service: 'strauss'
    }`;

text = text.replace('service: \'borepile\'\n    }\n  ]', 'service: \'borepile\'\n' + newProjects + '\n  ]');
fs.writeFileSync('src/data/projects.ts', text);
