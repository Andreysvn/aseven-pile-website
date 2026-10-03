// Sumber referensi teknis yang SUDAH diverifikasi bisa dibuka & relevan.
// Catatan: tidak semua klaim di internet benar — beberapa situs kompetitor
// merujuk jurnal yang isinya tidak sesuai. Daftar ini dikurasi manual.

export interface TechReference {
  label: string;
  url: string;
}

export const TECH_REFERENCES: TechReference[] = [
  {
    label: 'Karakteristik tanah lunak Jakarta Utara (very soft–soft) & daya dukung pondasi — Skripsi Teknik Sipil, Universitas Indonesia',
    url: 'https://lib.ui.ac.id/detail?id=20238696',
  },
  {
    label: 'Pemilihan & struktur bored pile pada lapisan tanah keras dalam (studi kasus Jakarta Selatan) — Journal of Global Engineering Research and Science, 2023',
    url: 'https://journal.jgu.ac.id/index.php/jgers/article/view/40',
  },
];

// Tautan istilah tanah (glosarium) — semua judul dicek ada.
export const SOIL_GLOSSARY: TechReference[] = [
  { label: 'Tanah liat / lempung', url: 'https://id.wikipedia.org/wiki/Tanah_liat' },
  { label: 'Tanah aluvial', url: 'https://id.wikipedia.org/wiki/Aluvial' },
  { label: 'Latosol (tanah merah)', url: 'https://id.wikipedia.org/wiki/Latosol' },
  { label: 'Tanah ekspansif', url: 'https://id.wikipedia.org/wiki/Tanah_ekspansif' },
  { label: 'Uji penetrasi standar (SPT)', url: 'https://id.wikipedia.org/wiki/Uji_penetrasi_standar' },
  { label: 'Uji sondir (penetrasi kerucut)', url: 'https://id.wikipedia.org/wiki/Pengujian_penetrasi_kerucut' },
];
