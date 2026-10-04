export interface Project {
  img: string;
  alt: string;
  area: string;
  diameterCm?: number;
  depthM?: number;
  customSpec?: string;
  method: string;
  service?: 'borepile' | 'strauss';
}

export const PROJECTS: Record<string, Project[]> = {
  jakarta: [
    {
      img: '/imgs/bore-pile-mini-crane-aseven-pile-sunter-september-2026.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Mini Crane Area Mepet Tembok di Sunter, Jakarta Utara',
      area: 'Sunter, Jakarta Utara',
      customSpec: 'Diameter 30 cm &bull; 14 titik &bull; Kedalaman 15 m<br/>Diameter 50 cm &bull; 2 titik &bull; Kedalaman 15 m',
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/bore-pile-mini-crane-aseven-pile-mangga-dua-agustus-2026.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Mini Crane di Mangga Dua, Jakarta',
      area: 'Mangga Dua, Jakarta',
      diameterCm: 30,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/bore-pile-mini-crane-aseven-pile-pulo-gadung-agustus-2026.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Mini Crane di Pulo Gadung, Jakarta Timur',
      area: 'Pulo Gadung, Jakarta Timur',
      diameterCm: 40,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/bore-pile-mini-crane-aseven-pile-jelambar-september-2026.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Mini Crane untuk Lokasi Sempit di Jelambar, Jakarta Barat',
      area: 'Jelambar, Jakarta Barat',
      customSpec: 'Diameter 30 cm &bull; 24 titik &bull; Kedalaman 13 m',
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
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
    }
  ]
};

export function getProjects(slug: string, service: 'borepile' | 'strauss'): Project[] {
  return (PROJECTS[slug] || []).filter((p) => (p.service ?? 'borepile') === service);
}








