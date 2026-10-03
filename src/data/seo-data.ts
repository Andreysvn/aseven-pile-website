import citiesData from './cities.json';

export const GLOBAL_FAQS = [
  {
    question: "Apa perbedaan Bore Pile dan Strauss Pile?",
    answer: "Bore Pile menggunakan mesin bor hidrolik untuk kedalaman dan diameter besar (biasanya untuk gedung bertingkat), sedangkan Strauss Pile menggunakan tenaga manual manusia untuk kedalaman dangkal dan area sempit (cocok untuk rumah tinggal)."
  },
  {
    question: "Berapa lama proses pengerjaan pondasi?",
    answer: "Durasi pengerjaan sangat bergantung pada kondisi tanah, cuaca, dan jumlah titik yang dibor. Secara rata-rata, untuk proyek perumahan memakan waktu 3-7 hari kerja."
  },
  {
    question: "Apakah Aseven Pile menyediakan material besi dan beton?",
    answer: "Ya, kami melayani sistem borong penuh (jasa + material) maupun hanya jasa pengerjaan saja. Anda bisa berdiskusi dengan tim kami untuk opsi terbaik."
  }
];

export const SERVICE_CITIES = citiesData.filter((city: any) => !city.draft);

type ServiceKey = 'borepile' | 'strauss';

function classifyFaq(faq: { question: string; answer: string }): ServiceKey | 'both' {
  const t = `${faq.question} ${faq.answer}`.toLowerCase();
  const hasBore = /bore pile|borepile|bored pile|mini crane|mesin bor|\bbore\b/.test(t);
  const hasStrauss = /strauss/.test(t);
  if (hasBore && hasStrauss) return 'both';
  if (hasStrauss) return 'strauss';
  if (hasBore) return 'borepile';
  return 'both';
}

/**
 * FAQ untuk satu kota + satu layanan.
 * Prioritas: field eksplisit (localFaqsBore / localFaqsStrauss) bila ada.
 * Fallback: klasifikasi otomatis dari localFaqs berdasarkan kata kunci layanan,
 * agar FAQ spesifik bore pile tidak bocor ke halaman strauss pile.
 */
export function getCityFaqs(city: any, service: ServiceKey) {
  const explicit =
    service === 'borepile' ? city.localFaqsBore : city.localFaqsStrauss;

  if (Array.isArray(explicit)) {
    return [...GLOBAL_FAQS, ...(city.localFaqs || []).filter((f: any) => classifyFaq(f) === 'both'), ...explicit];
  }

  const local = (city.localFaqs || []).filter((f: any) => {
    const c = classifyFaq(f);
    return c === service || c === 'both';
  });

  return [...GLOBAL_FAQS, ...local];
}

