export interface CityService {
  slug: string;       // URL slug, e.g. "bore-pile"
  name: string;       // Nama jasa, e.g. "Bore Pile Mesin"
  description: string; // 1-2 kalimat ringkas
  image: string;      // path foto
  imageAlt: string;   // alt text foto
  urlPattern: string; // pattern URL: "area-layanan/{service}/{city}" atau "layanan/{service}"
  available: boolean; // apakah jasa ini aktif ditampilkan
}

// ============================================================
// DAFTAR JASA AKTIF ASEVEN PILE
// Tambah jasa baru di sini, otomatis muncul di semua kota hub.
// ============================================================
export const CITY_SERVICES: CityService[] = [
  {
    slug: "bore-pile",
    name: "Bore Pile Mesin",
    description: "Pengeboran pakai mesin mini crane. Cocok untuk bangunan skala menengah ke atas yang butuh pondasi dalam dan kokoh.",
    image: "/imgs/header-beranda-bore-pile-aseven-2.webp",
    imageAlt: "Pekerjaan Bore Pile Mesin",
    urlPattern: "area-layanan/bore-pile/{city}",
    available: true,
  },
  {
    slug: "strauss-pile",
    name: "Strauss Pile Manual",
    description: "Pengeboran dengan tenaga manusia. Tanpa getaran dan suara bising — aman untuk perumahan padat penduduk.",
    image: "/imgs/wa-gallery-1.webp",
    imageAlt: "Pekerjaan Strauss Pile Manual",
    urlPattern: "area-layanan/strauss-pile/{city}",
    available: true,
  },
  // Contoh jasa berikutnya (set available: true kalau siap ditampilkan):
  // {
  //   slug: "soil-test",
  //   name: "Uji Tanah (Sondir)",
  //   description: "...",
  //   image: "/imgs/...",
  //   imageAlt: "...",
  //   urlPattern: "layanan/soil-test",
  //   available: false,
  // },
];
