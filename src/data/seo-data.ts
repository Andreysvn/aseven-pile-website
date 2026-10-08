import citiesData from './cities.json';

export const SERVICE_CITIES = citiesData.filter((city: any) => !city.draft);

type ServiceKey = 'borepile' | 'strauss';

function getGlobalFaqs(city: any, service: ServiceKey) {
  const hasStraussPage = ['jakarta', 'bekasi'].includes(city.slug);
  const straussLink = hasStraussPage ? `/area-layanan/strauss-pile/${city.slug}` : `/layanan/strauss-pile-manual`;

  const materialFaq = {
    question: `Apakah harga pengerjaan di ${city.name} sudah termasuk material?`,
    answer: `Harga dasar yang kami tawarkan adalah untuk jasa bor saja. Namun, kami juga bisa membantu menyediakan paket 'all-in' beserta material (besi tulangan dan beton ready mix) jika Anda membutuhkan. Spesifikasi material tetap menyesuaikan dengan kalkulasi beban bangunan dari perencana Anda.`
  };

  if (service === 'borepile') {
    return [
      materialFaq,
      {
        question: `Apakah wajib tes sondir sebelum pengeboran di ${city.name}?`,
        answer: "Untuk pengeboran bore pile, hal ini dikembalikan pada kebijakan Anda. Kami bisa mengebor sedalam apapun sesuai permintaan atau gambar dari perencana struktur Anda. Namun, data sondir tetap kami sarankan jika Anda ingin mengetahui secara pasti di mana letak lapisan tanah keras (hard strata)."
      },
      {
        question: `Berapa lebar jalan minimum untuk mobilisasi alat bore pile ke lokasi di ${city.name}?`,
        answer: `Mesin mini crane kami dimobilisasi menggunakan truk engkel ban 6. Pastikan akses jalan menuju lokasi proyek Anda minimal bisa dilewati oleh truk tersebut dengan aman. Jika jalan terlalu sempit, <a href="${straussLink}" style="color: var(--color-primary); text-decoration: underline;">strauss pile manual</a> bisa jadi solusinya.`
      },
      {
        question: "Bagaimana sistem kerja alat dan pembuangan lumpur hasil pengeboran?",
        answer: "Kami menggunakan metode wash boring (bor basah) dengan sirkulasi air. Klien perlu menyiapkan ketersediaan air, galian sirkulasi, dan area penampungan atau lokasi pembuangan sisa lumpur galian."
      },
      {
        question: "Apa keunggulan bore pile dibandingkan dengan tiang pancang (paku bumi)?",
        answer: "Bore pile jauh lebih aman untuk lingkungan padat karena minim getaran dan tidak bising, sehingga tidak berisiko meretakkan bangunan tetangga. Selain itu, mesin mini crane kami bisa masuk ke lokasi yang jauh lebih sempit dibandingkan <a href=\"/artikel/bore-pile-vs-strauss-pile\" style=\"color: var(--color-primary); text-decoration: underline;\">alat berat pemancang tiang</a>."
      },
      {
        question: "Apa bedanya bore pile mesin dan strauss pile manual?",
        answer: `Bore pile digerakkan oleh mesin mini crane sehingga mampu menembus lapisan tanah keras dan mengebor jauh lebih dalam. Sedangkan <a href="${straussLink}" style="color: var(--color-primary); text-decoration: underline;">jasa strauss pile manual</a> digerakkan 100% oleh putaran tangan manusia, cocok untuk kedalaman dangkal dan jalan sempit.`
      }
    ];
  } else {
    return [
      materialFaq,
      {
        question: `Apakah proyek strauss pile di ${city.name} perlu tes sondir?`,
        answer: "Sangat disarankan. Data sondir tetap diperlukan untuk memastikan di mana titik kedalaman tanah keras berada sebelum pengeboran manual dimulai."
      },
      {
        question: `Apakah alat strauss pile bisa masuk ke gang sempit di wilayah ${city.name}?`,
        answer: "Sangat bisa. Alat strauss pile sangat ringkas, portabel, dan dirakit langsung di titik galian. Metode ini adalah solusi terbaik untuk lokasi padat penduduk atau gang sempit yang tidak bisa dimasuki oleh truk alat berat."
      },
      {
        question: "Apakah metode strauss pile manual berisik dan butuh banyak air?",
        answer: `Tidak. Kami menggunakan metode dry boring (bor kering) tanpa sirkulasi air. Karena prosesnya 100% manual tanpa <a href="/area-layanan/bore-pile/${city.slug}" style="color: var(--color-primary); text-decoration: underline;">mesin bore pile diesel</a>, metode ini sama sekali tidak bising, bebas getaran, dan lokasi proyek lebih bersih dibandingkan metode bor basah.`
      },
      {
        question: "Kapan saya harus memilih strauss pile dibanding bore pile mesin?",
        answer: `Strauss pile sangat cocok untuk bangunan berbeban ringan (rumah 1-2 lantai atau pagar) di mana target kedalaman tanah keras tidak lebih dari 8 meter, atau saat lokasi proyek tidak bisa diakses oleh <a href="/area-layanan/bore-pile/${city.slug}" style="color: var(--color-primary); text-decoration: underline;">mesin mini crane bore pile</a>.`
      }
    ];
  }
}

function classifyFaq(faq: { question: string; answer: string }): ServiceKey | 'both' {
  const t = `${faq.question} ${faq.answer}`.toLowerCase();
  const hasBore = /bore pile|borepile|bored pile|mini crane|mesin bor|\bbore\b/.test(t);
  const hasStrauss = /strauss/.test(t);
  if (hasBore && hasStrauss) return 'both';
  if (hasStrauss) return 'strauss';
  if (hasBore) return 'borepile';
  return 'both';
}

export function getCityFaqs(city: any, service: ServiceKey) {
  const globalFaqs = getGlobalFaqs(city, service);
  
  const explicit = service === 'borepile' ? city.localFaqsBore : city.localFaqsStrauss;

  if (Array.isArray(explicit)) {
    return [...globalFaqs, ...(city.localFaqs || []).filter((f: any) => classifyFaq(f) === 'both'), ...explicit];
  }

  const local = (city.localFaqs || []).filter((f: any) => {
    const c = classifyFaq(f);
    return c === service || c === 'both';
  });

  return [...globalFaqs, ...local];
}
