export interface CityService {
  slug: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  cityUrlPattern: string;
  serviceUrl: string;
  available: boolean;
}

export const CITY_SERVICES: CityService[] = [
  {
    slug: "bore-pile",
    name: "Jasa Bore Pile Mesin",
    description: "Pondasi dalam super kuat untuk bangunan besar, ruko, gudang, hingga pabrik. Solusi presisi dengan kapasitas daya dukung tinggi.",
    image: "/imgs/header-beranda-bore-pile-aseven-2.webp",
    imageAlt: "Pekerjaan Bore Pile Mesin",
    cityUrlPattern: "/area-layanan/bore-pile/{city}",
    serviceUrl: "/layanan/bore-pile-mesin",
    available: true,
  },
  {
    slug: "bore-pile-gawangan",
    name: "Bore Pile Gawangan",
    description: "Alat bore pile berbentuk gawang untuk lokasi dengan akses tersulit, gang sempit, atau di dalam ruangan (indoor).",
    image: "/imgs/bore-pile-mesin-gawangan-aseven-pile.webp",
    imageAlt: "Pekerjaan Bore Pile Gawangan",
    cityUrlPattern: "/area-layanan/bore-pile/{city}",
    serviceUrl: "/layanan/bore-pile-gawangan",
    available: true,
  },
  {
    slug: "strauss-pile",
    name: "Jasa Strauss Pile",
    description: "Bor pondasi manual tanpa suara bising dan getaran. Sangat aman dikerjakan di lokasi perumahan padat penduduk.",
    image: "/imgs/proses-strauss-pile-jakarta-aseven-pile.webp",
    imageAlt: "Pekerjaan Strauss Pile Manual",
    cityUrlPattern: "/area-layanan/strauss-pile/{city}",
    serviceUrl: "/layanan/strauss-pile-manual",
    available: true,
  }
];



