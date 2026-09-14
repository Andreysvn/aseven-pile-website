export interface LocationData {
  slug: string;
  name: string;
  region: string;
  geotechProfile: string;
  recommendation: string;
}

export const targetLocations: LocationData[] = [
  {
    slug: "jakarta",
    name: "Jakarta",
    region: "DKI Jakarta",
    geotechProfile: "Bervariasi dari tanah merah padat di Selatan hingga tanah lunak berair tinggi di Utara.",
    recommendation: "Metode bore pile mini crane dengan bentonite sirkulasi untuk area padat penduduk."
  },
  {
    slug: "bogor",
    name: "Bogor",
    region: "Jawa Barat",
    geotechProfile: "Didominasi tanah cadas, bebatuan, dan lereng dengan tingkat kekerasan tinggi.",
    recommendation: "Sangat disarankan menggunakan mesin gawangan karena daya tembusnya kuat untuk lapisan batuan keras."
  },
  {
    slug: "depok",
    name: "Depok",
    region: "Jawa Barat",
    geotechProfile: "Tanah kebun dan lempung berpasir yang cukup stabil.",
    recommendation: "Dapat menggunakan strauss pile untuk 2 lantai, atau bore pile mesin untuk ruko 3 lantai ke atas."
  },
  {
    slug: "tangerang",
    name: "Tangerang",
    region: "Banten",
    geotechProfile: "Tanah urugan baru di area pengembangan dan lempung lunak di pesisir utara.",
    recommendation: "Pengeboran wash boring dengan pipa casing sementara untuk menghindari longsor saat pengerjaan."
  },
  {
    slug: "bekasi",
    name: "Bekasi",
    region: "Jawa Barat",
    geotechProfile: "Kondisi tanah lempung ekspansif yang mudah menyusut dan memuai.",
    recommendation: "Pondasi dalam sangat diwajibkan (minimal 12 meter) menembus tanah keras agar bangunan tidak amblas."
  }
];
