const fs = require('fs');
let text = fs.readFileSync('src/data/projects.ts', 'utf8');

// The file currently ends with:
//       service: 'borepile'
//     }
//   ]
// };

// We want to insert 2 Strauss projects before the closing bracket of the jakarta array
const newProjects = `,
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
    }`;

// Replace the end of the file safely using regex that matches any whitespace/newlines
text = text.replace(/service:\s*'borepile'\s*\}\s*\]\s*\};\s*export\s+function/m, `service: 'borepile'\n    }${newProjects}\n  ]\n};\n\nexport function`);
fs.writeFileSync('src/data/projects.ts', text);
