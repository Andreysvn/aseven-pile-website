export interface CityService {
  slug: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  cityUrlPattern: string;  // URL untuk city hub: "area-layanan/{service}/{city}"
  serviceUrl: string;      // URL halaman layanan nasional: "layanan/{service}"
  available: boolean;
}

// ============================================================
// DAFTAR JASA AKTIF ASEVEN PILE
// Tambah jasa baru di sini — otomatis muncul di:
// 1. Hub layanan (/layanan)
// 2. Semua city hub (/area-layanan/{kota})
// ============================================================
export const CITY_SERVICES: CityService[] = [
  {
    slug: "bore-pile",
    name: "Bore Pile Mesin",
    description: "Pengeboran pakai mesin mini crane. Cocok untuk bangunan skala menengah ke atas yang butuh pondasi dalam dan kokoh.",
    image: "/imgs/header-beranda-bore-pile-aseven-2.webp",
    imageAlt: "Pekerjaan Bore Pile Mesin",
    cityUrlPattern: "area-layanan/bore-pile/{city}",
    serviceUrl: "layanan/bore-pile",
    available: true,
  },
  {
    slug: "strauss-pile",
    name: "Strauss Pile Manual",
    description: "Pengeboran dengan tenaga manusia. Tanpa getaran dan suara bising — aman untuk perumahan padat penduduk.",
    image: "/imgs/wa-gallery-1.webp",
    imageAlt: "Pekerjaan Strauss Pile Manual",
    cityUrlPattern: "area-layanan/strauss-pile/{city}",
    serviceUrl: "layanan/strauss-pile",
    available: true,
  },
  // Tambah jasa baru di sini:
  // {
  //   slug: "soil-test",
  //   name: "Uji Tanah (Sondir)",
  //   description: "...",
  //   image: "/imgs/...",
  //   imageAlt: "...",
  //   cityUrlPattern: "area-layanan/soil-test/{city}",
  //   serviceUrl: "layanan/soil-test",
  //   available: false,
  // },
];
