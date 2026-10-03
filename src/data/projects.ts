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
      area: 'Sunter, Jakarta Utara (Mepet Tembok)',
      customSpec: 'Diameter 30 cm &bull; 14 titik<br/>Diameter 50 cm &bull; 2 titik',
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
      depthM: 24,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/bore-pile-mini-crane-aseven-pile-jelambar-september-2026.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Mini Crane untuk Lokasi Sempit di Jelambar, Jakarta Barat',
      area: 'Jelambar, Jakarta Barat (Lokasi Sempit)',
      customSpec: 'Diameter 30 cm • 24 titik x 13 m',
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    }
  ]
};

export function getProjects(slug: string, service: 'borepile' | 'strauss'): Project[] {
  return (PROJECTS[slug] || []).filter((p) => (p.service ?? 'borepile') === service);
}



