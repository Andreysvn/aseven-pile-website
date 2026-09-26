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
    name: "Bore Pile Mesin",
    description: "Pondasi dalam super kuat pakai mesin mini crane. Solusi presisi untuk bangunan besar, ruko, hingga pabrik.",
    image: "/imgs/header-beranda-bore-pile-aseven-2.webp",
    imageAlt: "Pekerjaan Bore Pile Mesin",
    cityUrlPattern: "area-layanan/bore-pile/{city}",
    serviceUrl: "layanan/bore-pile",
    available: true,
  },
  {
    slug: "strauss-pile",
    name: "Strauss Pile Manual",
    description: "Bor pondasi manual tanpa suara bising dan getaran. Sangat aman dikerjakan di lokasi perumahan padat penduduk.",
    image: "/imgs/wa-gallery-1.webp",
    imageAlt: "Pekerjaan Strauss Pile Manual",
    cityUrlPattern: "area-layanan/strauss-pile/{city}",
    serviceUrl: "layanan/strauss-pile",
    available: true,
  }
];
