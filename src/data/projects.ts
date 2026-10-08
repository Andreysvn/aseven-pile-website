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
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Gawangan Area Mepet Tembok di Sunter, Jakarta Utara',
      area: 'Sunter, Jakarta Utara',
      customSpec: 'Diameter 30 cm &bull; 14 titik &bull; Kedalaman 15 m<br/>Diameter 50 cm &bull; 2 titik &bull; Kedalaman 15 m',
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Gawangan di Mangga Dua, Jakarta',
      area: 'Mangga Dua, Jakarta',
      diameterCm: 30,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Gawangan di Pulo Gadung, Jakarta Timur',
      area: 'Pulo Gadung, Jakarta Timur',
      diameterCm: 40,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Gawangan untuk Lokasi Sempit di Jelambar, Jakarta Barat',
      area: 'Jelambar, Jakarta Barat',
      customSpec: 'Diameter 30 cm &bull; 24 titik &bull; Kedalaman 13 m',
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/proses-strauss-pile-jakarta-aseven-pile.webp',
      alt: 'Proyek Strauss Pile Manual di Jakarta',
      area: 'Jakarta',
        customSpec: 'Diameter 30 cm &bull; 22 titik &bull; Kedalaman 6 m',
        method: 'Strauss pile manual',
      service: 'strauss'
    },
    
  ]
,
  bekasi: [
    {
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin Gawangan di Bekasi',
      area: 'Bekasi',
      diameterCm: 40,
      depthM: 15,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Pekerjaan Bore Pile Mesin Gawangan Area Perumahan di Bekasi',
      area: 'Bekasi',
      diameterCm: 30,
      depthM: 12,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    }
  ],
  bogor: [
    {
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin di Bogor',
      area: 'Bogor',
      diameterCm: 30,
      depthM: 10,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Pekerjaan Bore Pile Mesin Gawangan Area Lereng di Bogor',
      area: 'Bogor',
      diameterCm: 40,
      depthM: 14,
      method: 'Bor kering (dry boring)',
      service: 'borepile'
    }
  ],
  depok: [
    {
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin di Depok',
      area: 'Depok',
      diameterCm: 30,
      depthM: 14,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    },
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Pekerjaan Bore Pile Mesin Gawangan di Depok',
      area: 'Depok',
      diameterCm: 40,
      depthM: 16,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    }
  ],
  tangerang: [
    {
      img: '/imgs/bore-pile-mesin-gawangan-aseven-pile.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin di Tangerang',
      area: 'Tangerang',
      diameterCm: 40,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    }
  ],
  'tangerang-selatan': [
    {
      img: '/imgs/persiapan-pipa-tremi-gawangan-aseven-pile-bekasi.webp',
      alt: 'Proyek Pondasi Bore Pile Mesin di Tangerang Selatan',
      area: 'Tangerang Selatan',
      diameterCm: 40,
      depthM: 18,
      method: 'Bor basah (wash boring)',
      service: 'borepile'
    }
  ]

};

export function getProjects(slug: string, service: 'borepile' | 'strauss'): Project[] {
  return (PROJECTS[slug] || []).filter((p) => (p.service ?? 'borepile') === service);
}








