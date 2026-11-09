export interface DiameterFaq {
  question: string;
  answer: string;
}

export interface SuitableForData {
  title: string;
  subtitle: string;
  usedWhenTitle?: string;
  items: string[];
  notFirstChoiceTitle?: string;
  notFirstChoiceItems?: string[];
  depthText: string;
  advantageText?: string;
  limitations?: string;
  limitationsLabel?: string;
  conclusion?: string;
}

export interface PriceInclusionsData {
  title: string;
  includedTitle: string;
  included: string[];
  excludedTitle: string;
  excluded: string[];
  footerNote?: string;
}

export interface HowToOrderData {
  title: string;
  steps: string[];
}

export interface UpgradeComparisonRow {
  label: string;
  current: string;
  next: string;
}

export interface UpgradeAdviceData {
  title: string;
  intro: string;
  nextDiameter?: number;
  currentName: string;
  nextName: string;
  comparisonTable: UpgradeComparisonRow[];
  upgradeWhenTitle: string;
  upgradeWhen: string[];
  stayWhenTitle?: string;
  stayWhen?: string[];
  conclusion?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface MachineSpecData {
  intro?: string;
  maxDepth?: string;
  diameterImpact?: string;
  washVsDry?: string;
  tremieWhy?: string;
}

export interface ScopeOfWorkItem {
  component: string;
  description: string;
}

export interface ScopeOfWorkData {
  title: string;
  items: ScopeOfWorkItem[];
  note: string;
  extraNote?: string;
}

export interface ChecklistItem {
  label: string;
  text: string;
}

export interface ChecklistData {
  title: string;
  subtitle: string;
  items: ChecklistItem[];
  conclusion?: string;
}

export interface FeatureItemData {
  title: string;
  desc: string;
  iconRawSvg?: string;
}

export interface ComparisonData {
  title: string;
  description: string;
  primaryTitle: string;
  primaryDesc: string;
  secondaryTitle: string;
  secondaryDesc: string;
  conclusion: string;
}

export interface MultiComparisonRow {
  label: string;
  cols: string[];
}

export interface MultiComparisonData {
  title: string;
  intro: string;
  columns: string[];
  rows: MultiComparisonRow[];
  conclusionHtml?: string;
}

export interface StepItem {
  number: number;
  title: string;
  desc: string;
}

export interface DiameterComparisonSection {
  title: string;
  intro: string;
  tableTitle?: string;
  columns: string[];
  rows: { label: string; cols: string[] }[];
  guideTitle?: string;
  guideHtml?: string;
}

export interface MethodComparisonSection {
  title: string;
  intro: string;
  primaryTitle: string;
  primaryDesc: string;
  secondaryTitle: string;
  secondaryDesc: string;
  sensibleTitle?: string;
  sensibleItems?: { label: string; text: string }[];
  conclusion?: string;
}

export interface DiameterData {
  diameter: number;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  priceFormatted: string;
  minOrderText: string;
  crosslinkHtml?: string;
  introSummary: string;
  introParagraph1: string;
  introParagraph2: string;
  scopeOfWork?: ScopeOfWorkData;
  suitableFor: SuitableForData;
  simulationHtml?: string;
  simulation: {
    title: string;
    buildingType: string;
    points: number;
    depthM: number;
    totalM: number;
    pricePerM: number;
    totalCost: number;
    note: string;
  };
  costAddonsItems?: { title: string; desc: string }[];
  preparation?: ChecklistData;
  costMistakes?: ChecklistData;
  materialDesc?: string;
  experiencedTeamDesc?: string;
  machineSpecTitle?: string;
  machineSpec?: MachineSpecData;
  features?: FeatureItemData[];
  comparisonData?: ComparisonData;
  multiComparison?: MultiComparisonData;
  upgradeAdvice?: UpgradeAdviceData;
  comparisons?: UpgradeAdviceData[];
  sopSteps?: StepItem[];
  diameterComparison?: DiameterComparisonSection;
  methodComparison?: MethodComparisonSection;
  faqs: DiameterFaq[];
}

export const BORE_PILE_DIAMETERS: Record<number, DiameterData> = {
  30: {
    diameter: 30,
    slug: "30",
    metaTitle: "Harga Jasa Bore Pile 30 cm per Meter 2026",
    metaDescription: "Layanan jasa bore pile diameter 30 cm mulai Rp 139.000/m. Pengeboran berputar dengan getaran dan kebisingan lebih rendah dibanding pemancangan.",
    h1: "Harga Jasa Bore Pile Diameter 30 cm per Meter 2026",
    tagline: "Lihat Harga, Spesifikasi Layanan, dan Panduan Bore Pile 30 cm",
    priceFormatted: "Rp 139.000",
    minOrderText: "Minimal order: 200 meter lari untuk mesin mini crane. Volume di bawah 200 meter dikenakan biaya minimum setara perhitungan 200 meter.",
    crosslinkHtml: 'Mencari pondasi manual untuk area sangat sempit? Lihat alternatif <a href="/layanan/strauss-pile/diameter/30/">strauss pile 30 cm</a> atau cek kapasitas <a href="/layanan/bore-pile/diameter/40/">bore pile diameter 40 cm</a>.',
    introSummary: "<strong>Harga jasa bore pile 30 cm mulai Rp 139.000 per meter lari.</strong> Harga ini merupakan biaya jasa bor saja (pengeboran, rakit besi tulangan, dan cor pipa tremi). Belum termasuk material besi/beton, mobilisasi alat, dan pembuatan bak sirkulasi air.",
    introParagraph1: "Bore pile diameter <strong>30 cm</strong> dapat dipertimbangkan untuk berbagai proyek rumah tinggal, ruko, dan renovasi bangunan. Pemilihan diameter dan kedalaman tidak ditentukan dari jumlah lantai saja; keduanya mengikuti desain perencana struktur dan data tanah. Uji sondir wajib dilakukan sesuai persyaratan perencana sebelum pekerjaan dimulai.",
    introParagraph2: "Pengeboran kami kerjakan menggunakan mesin mini crane maupun mesin gawangan. Metode bor basah (<em>wash boring</em>) menggunakan sirkulasi air untuk kondisi tanah berair, sedangkan bor kering (<em>dry boring</em>) digunakan untuk tanah lempung yang lengket. Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan (polusi suara) di sekitar area kerja cenderung lebih rendah dibanding metode pemancangan. Kondisi akses dan lingkungan sekitar tetap perlu diperiksa sebelum pekerjaan.",
    suitableFor: {
      title: "Kapan Pakai Bore Pile 30 cm",
      subtitle: "Diameter pondasi ditentukan berdasarkan desain struktur dan data tanah, bukan jumlah lantai saja.",
      usedWhenTitle: "Dapat dipertimbangkan untuk:",
      items: [
        "Proyek rumah, ruko, atau renovasi jika diameter 30 cm tercantum dalam desain perencana struktur",
        "Pondasi pagar, dinding penahan tanah, atau carport jika spesifikasinya ditetapkan oleh perencana"
      ],
      notFirstChoiceTitle: "Perlu evaluasi perencana struktur jika:",
      notFirstChoiceItems: [
        "Beban bangunan, bentang, atau kondisi tanah memerlukan evaluasi khusus",
        "Gambar struktur menetapkan diameter selain 30 cm"
      ],
      depthText: "Kedalaman mengikuti data sondir dan desain perencana struktur.",
      conclusion: "Keputusan akhir tetap di perencana struktur dan hasil sondir."
    },
    priceInclusions: {
      title: "Apa Saja yang Termasuk dalam Harga",
      includedTitle: "Sudah termasuk:",
      included: [
        "Pengeboran sampai tanah keras dan pembersihan lubang sebelum dicor",
        "Perakitan dan pemasangan besi tulangan",
        "Pengecoran dengan pipa tremi",
        "Tenaga kerja dan operasional mesin"
      ],
      excludedTitle: "Belum termasuk:",
      excluded: [
        "Besi dan beton (ada paket all-in)",
        "Mobilisasi dan demobilisasi alat",
        "Bak sirkulasi, sedot, dan buang lumpur",
        "Uji sondir dan bobok kepala tiang"
      ],
      footerNote: 'Rincian komponen biaya di luar jasa bor dapat dilihat pada <a href="#biaya-tambahan">penjelasan biaya tambahan di bawah</a>.'
    },
    simulationHtml: `<h2 class="ls-case-title">Contoh Hitungan Biaya Bore Pile 30 cm</h2>
      <h3>Contoh 1: rumah tinggal 2 lantai, 20 titik &times; 12 m</h3>
      <p>Total 240 m &times; Rp 139.000 = <strong>Rp 33.360.000</strong> (jasa bor saja).</p>
      <h3>Contoh 2: proyek rumah kecil, 10 titik &times; 10 m</h3>
      <p>Volume aslinya 100 m (Rp 13.900.000). Karena minimal order 200 m, biaya jasanya jadi <strong>Rp 27.800.000</strong>. Untuk volume sekecil ini, pertimbangkan <a href="/layanan/strauss-pile/diameter/30/">strauss pile manual</a> atau gabungkan titik pondasi dengan bangunan lain.</p>
      <p class="ls-case-note">*Contoh hitungan, bukan proyek tertentu. Belum termasuk material, mobilisasi, dan bak sirkulasi.</p>`,
    simulation: {
      title: "Contoh Hitungan Biaya Bore Pile 30 cm",
      buildingType: "Rumah Tinggal 2 Lantai",
      points: 20,
      depthM: 12,
      totalM: 240,
      pricePerM: 139000,
      totalCost: 33360000,
      note: "*Contoh hitungan, bukan proyek tertentu. Belum termasuk material, mobilisasi, dan bak sirkulasi."
    },
    machineSpecTitle: "Seberapa Dalam Bore Pile 30 cm Bisa Dibor",
    machineSpec: {
      intro: "Kedalamannya tergantung kekerasan tanah, bukan panjang alat. Di tanah lunak seperti lempung atau aluvial, mesin mini crane kami bisa mengebor sampai sekitar <strong>25–30 meter</strong>. Di tanah yang lebih padat, sekitar <strong>15–20 meter</strong>.",
      maxDepth: "Beban putar mesin untuk diameter 30 cm tergolong paling ringan. Karena beban putarnya ringan, mata bor lebih mudah menembus ke lapisan tanah keras yang dalam dibanding diameter yang lebih besar.",
      diameterImpact: "Pengeboran akan dihentikan saat mata bor telah mencapai lapisan tanah keras. Di titik itulah pondasi dianggap sudah mencapai daya dukung yang disyaratkan konsultan perencana."
    },
    preparation: {
      title: "Yang Perlu Disiapkan Sebelum Pengerjaan",
      subtitle: "",
      items: [
        {
          label: "Akses jalan:",
          text: "alat mini crane diangkut dengan truk engkel. Lebar jalan masuk idealnya minimal 2,5 sampai 3 meter. Jika gang sempit, beri tahu kami sejak awal agar disiapkan armada yang sesuai."
        },
        {
          label: "Sumber air:",
          text: "cukup untuk sirkulasi bor basah, bisa dari sumur, PAM, atau tangki air."
        },
        {
          label: "Lahan kerja:",
          text: "area kerja bersih dari puing atau sisa pondasi lama, dan titik bor sudah ditandai sesuai denah."
        },
        {
          label: "Data sondir:",
          text: "wajib dilakukan sebelum pekerjaan sesuai persyaratan perencana struktur sebagai dasar perencanaan pondasi."
        },
        {
          label: "Izin lingkungan:",
          text: "sampaikan informasi jadwal kerja kepada tetangga sekitar rumah sebelum alat datang."
        }
      ]
    },
    costMistakes: {
      title: "Kesalahan yang Bikin Biaya Bore Pile Bengkak",
      subtitle: "",
      items: [
        {
          label: "Volume bor di bawah 200 m:",
          text: "untuk proyek rumah kecil dengan sedikit titik, biaya jasa tetap dihitung setara minimal order 200 m."
        },
        {
          label: "Mengebor tanpa uji sondir:",
          text: "kedalaman hanya ditebak-tebak. Jika ternyata tanah keras lebih dalam dari perkiraan, biaya jasa dan material otomatis bertambah."
        },
        {
          label: "Lupa biaya pembuangan lumpur:",
          text: "pada metode bor basah, sisa lumpur perlu disedot dan dibuang keluar dari area proyek."
        },
        {
          label: "Akses gang tidak dicek sejak awal:",
          text: "truk pengangkut alat terhambat kabel rendah atau gang sempit, sehingga butuh langsir atau waktu tambahan."
        }
      ]
    },
    costAddonsItems: [
      {
        title: "Mobilisasi & Demobilisasi",
        desc: "Biaya kirim rig dari workshop kami ke lokasi proyek menggunakan truk engkel. Menyesuaikan jarak dan lokasi."
      },
      {
        title: "Sedot & Buang Lumpur",
        desc: "Pada metode bor basah, lumpur hasil pengeboran ditampung lalu disedot dan diangkut keluar."
      },
      {
        title: "Bak Sirkulasi",
        desc: "Dibutuhkan pada bor basah sebagai wadah sirkulasi air dan pengendapan lumpur selama pengeboran."
      },
      {
        title: "Besi & Beton",
        desc: "Kebutuhan material mengikuti desain struktur perencana Anda. Tersedia paket all-in jika Anda tidak ingin repot belanja sendiri."
      },
      {
        title: "Uji Sondir",
        desc: "Wajib dilakukan sebelum pekerjaan sesuai persyaratan perencana struktur. Hasilnya menjadi bagian dari data tanah untuk perencanaan pondasi."
      },
      {
        title: "Minimal Order 200 m",
        desc: "Contoh: 20 titik × 12 m (240 m) sudah memenuhi. Jika totalnya hanya 100 m, tetap dikenakan biaya minimum 200 m."
      }
    ],
    features: [
      {
        title: "Minim Getaran & Kebisingan",
        desc: "Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan di sekitar area kerja cenderung lebih rendah dibanding metode pemancangan. Kondisi lokasi tetap perlu diperiksa."
      },
      {
        title: "Tim Berpengalaman",
        desc: "Lebih dari 12 tahun menangani proyek rumah tinggal dan ruko di berbagai area padat Jabodetabek."
      },
      {
        title: "Sesuai Spesifikasi dan SNI",
        desc: "Pengerjaan mengacu pada gambar kerja perencana dan standar teknis SNI 8460:2017 serta SNI 2847:2019."
      }
    ],
    sopSteps: [
      {
        number: 1,
        title: "Survei & Cek Akses",
        desc: "Pengecekan kondisi lahan, akses jalan gang, dan ruang manuver alat di titik pengeboran."
      },
      {
        number: 2,
        title: "Pengeboran",
        desc: "Mesin mini crane dipasang di titik awal, lalu dibor sampai menyentuh lapisan tanah keras."
      },
      {
        number: 3,
        title: "Pasang Besi",
        desc: "Keranjang besi tulangan diturunkan perlahan ke dalam lubang bor yang sudah dibersihkan dari lumpur."
      },
      {
        number: 4,
        title: "Pengecoran",
        desc: "Beton dicor dari dasar lubang menggunakan pipa tremi agar padat merata tanpa bercampur air atau lumpur."
      }
    ],
    howToOrder: {
      title: "Cara Order Jasa Bore Pile 30 cm",
      steps: [
        "<strong>Chat WhatsApp:</strong> kirim lokasi, perkiraan jumlah titik, kedalaman rencana, dan foto akses jalan.",
        "<strong>Penawaran:</strong> kami kirim rincian estimasi biaya jasa bor dan biaya pendukungnya.",
        "<strong>Deal harga:</strong> setelah penawaran disepakati dan lahan siap, pembayaran DP.",
        "<strong>Survei lokasi:</strong> tim kami turun mengecek kesiapan lahan dan akses alat.",
        "<strong>Pengerjaan:</strong> alat masuk dan pengerjaan dimulai sesuai tahapan SOP.",
        "<strong>Pelunasan:</strong> pembayaran sisa setelah seluruh titik selesai dikerjakan."
      ]
    },
    diameterComparison: {
      title: "Perbandingan Bore Pile 30, 40, dan 50 cm",
      intro: "Lihat contoh penggunaan, harga jasa, dan gambaran kebutuhan beton per meter untuk tiap diameter.",
      tableTitle: "Perbandingan D30, D40, dan D50",
      columns: ["30 cm", "40 cm", "50 cm"],
      rows: [
        { label: "Contoh penggunaan", cols: ["Rumah tinggal dan ruko kecil", "Ruko besar dan gudang", "Gudang atau bangunan dengan beban lebih besar"] },
        { label: "Harga jasa bor per meter", cols: ["Rp 139.000", "Rp 175.000", "Rp 215.000"] },
        { label: "Kebutuhan beton per meter", cols: ["Paling sedikit", "Sekitar 1,8× D30", "Sekitar 2,8× D30"] },
        { label: "Volume teoritis per meter", cols: ["0,071 m³ (±70,7 liter)", "0,126 m³ (±125,7 liter)", "0,196 m³ (±196,3 liter)"] }
      ],
      guideTitle: "Catatan",
      guideHtml: "Contoh penggunaan hanya gambaran. Diameter dan kedalaman ditentukan perencana berdasarkan hasil sondir. Volume beton dihitung sebagai silinder berdasarkan diameter nominal."
    },
    comparisonData: {
      title: "Bore Pile 30 cm atau Tiang Pancang",
      description: "",
      primaryTitle: "Bore Pile 30 cm",
      primaryDesc: "Metode cor di tempat (cast in-situ): lubang dibor, dipasang tulangan, lalu dicor beton. Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan cenderung lebih rendah dibanding pemancangan. Kesesuaian alat dengan akses dan kondisi sekitar perlu diperiksa di lokasi.",
      secondaryTitle: "Tiang Pancang",
      secondaryDesc: "Tiang beton pracetak dipancang ke dalam tanah. Proses pemancangan menghasilkan getaran dan kebisingan yang lebih tinggi; dampaknya pada bangunan sekitar bergantung pada kondisi lokasi dan lingkungan.",
      conclusion: 'Perbedaan metode perlu dipertimbangkan bersama kondisi tanah, akses, dan bangunan di sekitar proyek. Jika akses terlalu sempit untuk mesin, alternatif yang dapat dipelajari adalah <a href="/layanan/strauss-pile/diameter/30/">strauss pile manual 30 cm</a>.'
    },
    faqs: [
      {
        question: "Berapa harga jasa bore pile 30 cm per meter?",
        answer: "Rp 139.000 per meter lari untuk jasa pengeboran, pemasangan besi, dan pengecoran. Belum termasuk material besi dan beton, mobilisasi alat, dan bak sirkulasi. Harga akhir menyesuaikan kondisi lapangan."
      },
      {
        question: "Apakah uji sondir wajib sebelum pekerjaan bore pile?",
        answer: "Ya. Uji sondir wajib dilakukan sesuai persyaratan perencana struktur. Hasilnya menjadi bagian dari data tanah untuk menentukan desain dan kedalaman pondasi."
      },
      {
        question: "Bagaimana menentukan apakah diameter 30 cm sesuai untuk proyek saya?",
        answer: "Diameter tidak ditentukan dari jumlah lantai saja. Perencana struktur menentukan spesifikasi pondasi berdasarkan beban bangunan dan data tanah, termasuk hasil uji sondir."
      },
      {
        question: "Berapa kedalaman maksimal bore pile 30 cm?",
        answer: "Mesin mini crane kami sanggup mengebor diameter 30 cm hingga kedalaman 25–30 meter di tanah lempung atau aluvial. Namun pengeboran selalu berhenti begitu mata bor mencapai elevasi tanah keras sesuai hasil uji sondir."
      },
      {
        question: "Bagaimana dampak pengeboran D30 terhadap lingkungan sekitar?",
        answer: "Pengeboran berputar tidak menggunakan benturan palu pancang, sehingga getaran dan kebisingan cenderung lebih rendah dibanding pemancangan. Dampak aktual tetap bergantung pada kondisi alat, lokasi kerja, dan bangunan di sekitarnya."
      },
      {
        question: "Bagaimana jika volume proyek saya di bawah 200 meter?",
        answer: 'Tetap bisa kami kerjakan dengan perhitungan biaya minimum setara volume 200 meter lari. Alternatif lain untuk proyek kecil di gang sempit adalah menggunakan <a href="/layanan/strauss-pile/diameter/30/">strauss pile manual</a>.'
      },
      {
        question: "Apakah Aseven Pile melayani paket all-in plus material?",
        answer: "Ya. Anda bisa memilih jasa bor saja (material disediakan sendiri) atau paket all-in terima beres berikut besi dan beton ready mix."
      },
      {
        question: "Berapa lama waktu pengerjaan untuk proyek rumah tinggal?",
        answer: "Sebagai gambaran, untuk 20 titik kedalaman 12 meter (total 240 meter), waktu pengerjaan rata-rata sekitar 7 hingga 12 hari kerja tergantung kelancaran suplai air dan akses."
      }
    ],
    upgradeAdvice: {
      title: "Kapan Sebaiknya Naik ke Diameter 40 cm?",
      intro: "Diameter 30 cm adalah pilihan paling ekonomis untuk rumah tinggal. Namun ada kondisi di mana diameter 40 cm lebih disarankan oleh perencana struktur.",
      currentName: "Diameter 30 cm",
      nextName: "Diameter 40 cm",
      comparisonTable: [
        { label: "Cocok untuk", current: "Rumah tinggal 1–3 lantai, ruko kecil", next: "Ruko besar, gudang, 2–4 lantai" },
        { label: "Kedalaman umum", current: "6–20 meter", next: "8–25 meter" },
        { label: "Harga jasa per meter", current: "Rp 139.000", next: "Rp 175.000" }
      ],
      upgradeWhenTitle: "Naik ke D40 kalau:",
      upgradeWhen: [
        "Bangunan 3–4 lantai dengan beban berat",
        "Bentang kolom cukup lebar (seperti ruko besar atau gudang)",
        "Ingin mengurangi total titik pondasi"
      ],
      stayWhenTitle: "Tetap di D30 kalau:",
      stayWhen: [
        "Bangunan 1–3 lantai beban standar",
        "Anggaran proyek menjadi pertimbangan utama",
        "Kapasitas dukung tanah sudah terpenuhi di kedalaman standar"
      ],
      conclusion: "Konsultasikan hasil uji sondir Anda bersama perencana struktur untuk menentukan apakah D30 sudah mencukupi.",
      ctaText: "Lihat Harga Bore Pile Diameter 40 cm →",
      ctaLink: "/layanan/bore-pile/diameter/40/"
    }
  },

  40: {
    diameter: 40,
    slug: "40",
    metaTitle: "Harga Jasa Bore Pile 40 cm per Meter 2026",
    metaDescription: "Harga jasa bore pile diameter 40 cm Rp175.000/m. Lihat contoh penggunaan, simulasi biaya, dan perbandingan harga serta beton dengan diameter lain.",
    h1: "Harga Jasa Bore Pile Diameter 40 cm per Meter 2026",
    tagline: "Harga dan informasi layanan bore pile diameter 40 cm",
    priceFormatted: "Rp 175.000",
    minOrderText: "Minimal order 200 meter. Kalau proyek Anda lebih kecil, biayanya tetap dihitung 200 meter.",
    crosslinkHtml: 'Masih ragu ukuran? Lihat <a href="/layanan/bore-pile/diameter/30/">harga bore pile 30 cm</a> atau <a href="/layanan/bore-pile/diameter/50/">harga bore pile 50 cm</a>.',
    introSummary: "<strong>Harga jasa bore pile 40 cm mulai Rp 175.000 per meter lari.</strong> Harga ini sudah termasuk pengeboran, pemasangan besi, dan pengecoran. Besi, beton, mobilisasi alat, dan bak sirkulasi belum termasuk.",
    introParagraph1: "Diameter 40 cm dapat menjadi salah satu opsi untuk proyek seperti ruko besar atau gudang. Contoh penggunaan tersebut bukan penentu ukuran pondasi. Diameter dan kedalaman mengikuti desain perencana struktur berdasarkan beban bangunan dan data tanah; uji sondir wajib dilakukan sebelum pekerjaan sesuai persyaratan perencana.",
    introParagraph2: "Pengeboran dikerjakan menggunakan mesin mini crane atau gawangan. Metode bor basah (<em>wash boring</em>) dengan sirkulasi air digunakan untuk kondisi tanah berair, sedangkan bor kering (<em>dry boring</em>) untuk tanah lempung yang lengket. Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan di sekitar area kerja cenderung lebih rendah dibanding pemancangan. Kondisi akses dan lingkungan sekitar tetap perlu diperiksa.",
    suitableFor: {
      title: "Kapan Pakai Bore Pile 40 cm",
      subtitle: "Contoh penggunaan bukan penentu ukuran; ikuti desain perencana struktur dan data tanah.",
      usedWhenTitle: "Contoh penggunaan:",
      items: [
        "Rumah tinggal atau ruko kecil: contoh penggunaan D30",
        "Ruko besar atau gudang: contoh penggunaan D40",
        "Gudang atau bangunan dengan beban lebih besar: contoh penggunaan D50"
      ],
      notFirstChoiceTitle: "Perlu evaluasi perencana jika:",
      notFirstChoiceItems: [
        "Beban bangunan, bentang, atau kondisi tanah memerlukan evaluasi khusus",
        "Gambar struktur menetapkan diameter selain 40 cm"
      ],
      depthText: "Kedalaman mengikuti hasil sondir dan desain perencana struktur.",
      conclusion: "Keputusan akhir tetap di perencana struktur dan hasil sondir."
    },
    priceInclusions: {
      title: "Apa Saja yang Termasuk dalam Harga",
      includedTitle: "Sudah termasuk:",
      included: [
        "Pengeboran sampai tanah keras dan pembersihan lubang sebelum dicor",
        "Perakitan dan pemasangan besi tulangan",
        "Pengecoran dengan pipa tremi",
        "Tenaga kerja dan operasional mesin"
      ],
      excludedTitle: "Belum termasuk:",
      excluded: [
        "Besi dan beton (ada paket all-in)",
        "Mobilisasi dan demobilisasi alat",
        "Bak sirkulasi, sedot, dan buang lumpur",
        "Uji sondir dan bobok kepala tiang"
      ],
      footerNote: 'Rincian komponen biaya di luar jasa bor dapat dilihat pada <a href="#biaya-tambahan">penjelasan biaya tambahan di bawah</a>.'
    },
    simulationHtml: `<h2 class="ls-case-title">Contoh Hitungan Biaya Bore Pile 40 cm</h2>
      <h3>Contoh 1: gudang kecil, 15 titik &times; 15 m</h3>
      <p>Total 225 m &times; Rp 175.000 = <strong>Rp 39.375.000</strong> (jasa bor saja).</p>
      <h3>Contoh 2: proyek kecil, 10 titik &times; 12 m</h3>
      <p>Volume aslinya 120 m (Rp 21.000.000). Karena minimal order 200 m, biaya jasanya jadi <strong>Rp 35.000.000</strong>. Diameter dan metode pondasi tetap mengikuti desain perencana struktur.</p>
      <p class="ls-case-note">*Contoh hitungan, bukan proyek tertentu. Belum termasuk material, mobilisasi, dan bak sirkulasi.</p>`,
    simulation: {
      title: "Contoh Hitungan Biaya Bore Pile 40 cm",
      buildingType: "Gudang Kecil",
      points: 15,
      depthM: 15,
      totalM: 225,
      pricePerM: 175000,
      totalCost: 39375000,
      note: "*Contoh hitungan, bukan proyek tertentu. Belum termasuk material, mobilisasi, dan bak sirkulasi."
    },
    machineSpecTitle: "Seberapa Dalam Bore Pile 40 cm Bisa Dibor",
    machineSpec: {
      intro: "Kedalaman pengeboran ditentukan oleh kondisi tanah dan target pada desain perencana, bukan diameter saja.",
      maxDepth: "Uji sondir wajib dilakukan sesuai persyaratan perencana struktur sebagai bagian dari data tanah untuk perencanaan pondasi.",
      diameterImpact: "Kemampuan alat dan kondisi akses perlu diperiksa sebelum pekerjaan. Target pengeboran mengikuti gambar kerja dan desain perencana struktur."
    },
    preparation: {
      title: "Yang Perlu Disiapkan Sebelum Pengerjaan",
      subtitle: "",
      items: [
        {
          label: "Akses truk beton:",
          text: "beton yang dipakai D40 lebih banyak, jadi sebaiknya truk ready mix bisa masuk. Lebar jalan minimal 3,5 meter. Kalau tidak muat, pengecoran pakai site mix."
        },
        {
          label: "Air:",
          text: "cukup untuk sirkulasi bor basah, dari PAM, sumur, atau tangki."
        },
        {
          label: "Lahan:",
          text: "bersih dari puing, dan titik bor sudah ditandai sesuai gambar kerja."
        },
        {
          label: "Data sondir:",
          text: "wajib dilakukan sebelum pekerjaan sesuai persyaratan perencana struktur."
        },
        {
          label: "Lingkungan:",
          text: "kabari RT/RW atau pengelola kawasan soal jadwal kerja dan lalu lintas truk."
        }
      ]
    },
    costMistakes: {
      title: "Kesalahan yang Bikin Biaya Bore Pile Bengkak",
      subtitle: "",
      items: [
        {
          label: "Belum menyiapkan hasil uji sondir:",
          text: "sondir wajib dilakukan sesuai persyaratan perencana struktur dan menjadi bagian dari data untuk perencanaan pondasi."
        },
        {
          label: "Lupa biaya pembuangan lumpur:",
          text: "volume lumpur galian D40 cukup besar. Tanpa persiapan bak sirkulasi atau jasa sedot lumpur, pengerjaan dapat terhambat."
        },
        {
          label: "Spesifikasi diameter tidak sesuai gambar:",
          text: "pastikan diameter yang dikerjakan sesuai gambar dan spesifikasi dari perencana struktur."
        },
        {
          label: "Akses truk ready mix tidak diperhitungkan:",
          text: "truk mixer tidak dapat mencapai titik pengeboran sehingga membutuhkan talang panjang atau alat pompa beton tambahan."
        },
        {
          label: "Volume bor di bawah 200 m:",
          text: "biaya jasa tetap dihitung setara batas minimal order 200 m lari untuk operasional mesin mini crane."
        }
      ]
    },
    costAddonsItems: [
      {
        title: "Mobilisasi & Demobilisasi",
        desc: "Biaya kirim rig dari workshop kami ke lokasi. Nilainya tetap per proyek dan mengikuti jarak, jadi lebih hemat kalau semua titik dikerjakan sekaligus."
      },
      {
        title: "Sedot & Buang Lumpur",
        desc: "Volume galian D40 secara teoritis lebih besar daripada D30. Kebutuhan pembuangan bergantung pada kondisi lubang dan pelaksanaan; kami bisa membantu menyediakan jasa buang lumpur."
      },
      {
        title: "Bak Sirkulasi",
        desc: "Dibutuhkan di bor basah sebagai penampung air dan lumpur selama pengeboran."
      },
      {
        title: "Besi & Beton",
        desc: "Volume beton teoritis D40 lebih besar daripada D30. Kebutuhan material mengikuti desain struktur. Tersedia pilihan ready mix atau site mix serta paket jasa dan material."
      },
      {
        title: "Uji Sondir",
        desc: "Wajib dilakukan sebelum pekerjaan sesuai persyaratan perencana struktur. Hasilnya menjadi bagian dari data tanah untuk perencanaan pondasi."
      },
      {
        title: "Minimal Order 200 m",
        desc: "15 titik × 15 m (225 m) sudah memenuhi. 10 titik × 12 m (120 m) belum, dan dihitung 200 m."
      }
    ],
    features: [
      {
        title: "Minim Getaran & Kebisingan",
        desc: "Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan di sekitar area kerja cenderung lebih rendah dibanding pemancangan. Kondisi lokasi tetap perlu diperiksa."
      },
      {
        title: "Tim Berpengalaman",
        desc: "Lebih dari 12 tahun spesialis menangani pengeboran bore pile untuk ruko, gudang, dan gedung bertingkat di berbagai kondisi tanah Jabodetabek dan Pulau Jawa."
      },
      {
        title: "Sesuai Spesifikasi dan SNI",
        desc: "Pengerjaan mengacu pada gambar kerja perencana struktur dan standar teknis SNI 8460:2017, termasuk pengecoran menggunakan pipa tremi."
      }
    ],
    sopSteps: [
      {
        number: 1,
        title: "Survei & Cek Akses",
        desc: "Pengecekan kondisi lahan, akses jalan gang, dan ruang manuver armada mini crane di titik pengeboran."
      },
      {
        number: 2,
        title: "Pengeboran",
        desc: "Mesin mini crane dipasang di titik awal, lalu dibor hingga menyentuh elevasi lapisan tanah keras (hard strata)."
      },
      {
        number: 3,
        title: "Pasang Besi",
        desc: "Keranjang besi tulangan SNI diturunkan perlahan ke dalam lubang bor yang telah dibersihkan dari endapan lumpur."
      },
      {
        number: 4,
        title: "Pengecoran",
        desc: "Pengecoran beton ready mix dilakukan dari dasar lubang menggunakan pipa tremi agar padat merata tanpa segregasi."
      }
    ],
    howToOrder: {
      title: "Cara Order Jasa Bore Pile 40 cm",
      steps: [
        "<strong>Chat WhatsApp:</strong> kirim lokasi, jumlah titik, hasil uji sondir, dan foto akses jalan.",
        "<strong>Penawaran:</strong> kami kirim estimasi jasa bor beserta biaya tambahannya.",
        "<strong>Deal harga:</strong> setelah penawaran disetujui dan lahan siap, bayar DP.",
        "<strong>Survei lokasi:</strong> tim kami turun cek akses, kondisi lahan, dan titik bor.",
        "<strong>Pengerjaan:</strong> rig masuk dan bekerja sesuai tahapan di atas.",
        "<strong>Pelunasan:</strong> setelah semua titik selesai."
      ]
    },
    diameterComparison: {
      title: "Perbandingan Harga dan Kebutuhan Beton Bore Pile",
      intro: "Lihat contoh penggunaan, harga jasa, dan kebutuhan beton teoritis per meter untuk tiap diameter.",
      tableTitle: "Perbandingan D30, D40, dan D50",
      columns: ["30 cm", "40 cm", "50 cm"],
      rows: [
        { label: "Contoh penggunaan", cols: ["Rumah tinggal atau ruko kecil", "Ruko besar atau gudang", "Gudang atau bangunan dengan beban lebih besar"] },
        { label: "Harga jasa bor per meter", cols: ["Rp 139.000", "Rp 175.000", "Rp 215.000"] },
        { label: "Kebutuhan beton dibanding D40", cols: ["Lebih sedikit dari D40", "Patokan", "Lebih banyak dari D40"] },
        { label: "Perkiraan beton per 1 meter tiang", cols: ["±71 liter", "±126 liter", "±196 liter"] }
      ],
      guideTitle: "Catatan",
      guideHtml: "Contoh penggunaan hanya gambaran. Diameter dan kedalaman ditentukan perencana berdasarkan hasil sondir. Volume beton dihitung sebagai silinder berdasarkan diameter nominal."
    },
    comparisonData: {
      title: "Bore Pile 40 cm atau Tiang Pancang",
      description: "",
      primaryTitle: "Bore Pile 40 cm",
      primaryDesc: "Metode cor di tempat (cast in-situ): lubang dibor, dipasang tulangan, lalu dicor beton. Pengeboran berputar tanpa benturan palu pancang, sehingga getaran dan kebisingan cenderung lebih rendah dibanding pemancangan. Kondisi akses dan lingkungan tetap perlu diperiksa.",
      secondaryTitle: "Tiang Pancang",
      secondaryDesc: "Tiang beton pracetak dipancang ke dalam tanah menggunakan palu. Proses ini menghasilkan getaran dan kebisingan; dampaknya pada bangunan sekitar bergantung pada kondisi lokasi dan lingkungan.",
      conclusion: "Pertimbangkan metode kerja, kondisi tanah, akses alat, dan bangunan di sekitar proyek sebelum menentukan pilihan bersama perencana."
    },
    faqs: [
      {
        question: "Berapa harga jasa bore pile 40 cm per meter?",
        answer: "Rp 175.000 per meter lari, sudah termasuk bor, pasang besi, dan cor. Material, mobilisasi, bak sirkulasi, dan sedot lumpur belum termasuk. Harga akhir menyesuaikan kondisi lapangan."
      },
      {
        question: "Bagaimana menentukan apakah diameter 40 cm sesuai untuk proyek saya?",
        answer: "Diameter tidak ditentukan dari jumlah lantai saja. Perencana struktur menentukan spesifikasi pondasi berdasarkan beban bangunan dan data tanah, termasuk hasil uji sondir."
      },
      {
        question: "Apakah uji sondir wajib sebelum pekerjaan bore pile?",
        answer: "Ya. Uji sondir wajib dilakukan sesuai persyaratan perencana struktur. Hasilnya menjadi bagian dari data tanah untuk menentukan desain dan kedalaman pondasi."
      },
      {
        question: "Apa perbedaan kebutuhan beton D40 dengan D30?",
        answer: "Secara teoritis, lubang silinder D40 membutuhkan sekitar 0,126 m³ beton per meter, sedangkan D30 sekitar 0,071 m³ per meter. Volume aktual mengikuti kondisi lubang dan pelaksanaan di lapangan."
      },
      {
        question: "Bagaimana dampak pengeboran D40 terhadap lingkungan sekitar?",
        answer: "Pengeboran berputar tidak menggunakan benturan palu pancang, sehingga getaran dan kebisingan cenderung lebih rendah dibanding pemancangan. Dampak aktual tetap bergantung pada kondisi alat, lokasi kerja, dan bangunan di sekitarnya."
      },
      {
        question: "Berapa dalam bore pile 40 cm bisa dibor?",
        answer: "Kemampuan kedalaman bergantung pada alat, kondisi tanah, dan metode kerja. Target pengeboran mengikuti desain perencana berdasarkan hasil uji sondir."
      },
      {
        question: "Berapa lama pengerjaannya?",
        answer: "Untuk 15 titik sedalam 15 meter, perkiraannya 10–18 hari kerja, tergantung tanah dan akses. Jadwal pastinya kami kabari setelah survei."
      },
      {
        question: "Proyek saya di bawah 200 meter, bagaimana?",
        answer: "Biaya jasa tetap dihitung setara minimum order 200 meter. Diameter dan metode pondasi tetap mengikuti desain perencana struktur."
      },
      {
        question: "Apakah ada paket all-in dengan material?",
        answer: "Ada. Anda bisa pilih jasa bor saja, atau jasa plus besi dan beton. Kebutuhan materialnya dihitung dari desain struktur dan hasil sondir."
      },
      {
        question: "Apakah survei lokasi gratis?",
        answer: "Survei dilakukan setelah harga disepakati. Kami tidak melakukan survei sebelum ada kesepakatan harga, karena survei memerlukan waktu dan biaya. Setelah deal, tim kami turun untuk mengecek akses, kondisi lahan, dan titik bor."
      }
    ],
    upgradeAdvice: {
      title: "Kapan Sebaiknya Naik ke Diameter 50 cm?",
      intro: "Diameter 40 cm adalah pilihan tepat untuk ruko besar dan gudang 2–4 lantai. Namun ada kondisi di mana diameter 50 cm lebih masuk akal secara struktur dan biaya total.",
      currentName: "Diameter 40 cm",
      nextName: "Diameter 50 cm",
      comparisonTable: [
        { label: "Cocok untuk", current: "Ruko besar, gudang, 2–4 lantai", next: "Bangunan komersial 4–5 lantai, gudang besar" },
        { label: "Kedalaman umum", current: "8–25 meter", next: "12–25 meter" },
        { label: "Harga jasa per meter", current: "Rp 175.000", next: "Rp 215.000" }
      ],
      upgradeWhenTitle: "Naik ke D50 kalau:",
      upgradeWhen: [
        "Bangunan Anda 4 lantai ke atas",
        "Bentang struktur sangat lebar",
        "Beban kolom terpusat sangat besar"
      ],
      stayWhenTitle: "Tetap di D40 kalau:",
      stayWhen: [
        "Bangunan 2–4 lantai",
        "D30 sudah tidak cukup, tapi D50 terasa berlebihan"
      ],
      conclusion: "D40 dipilih ketika D30 sudah tidak cukup, tetapi D50 terasa berlebihan.",
      ctaText: "Lihat Harga Bore Pile Diameter 50 cm →",
      ctaLink: "/layanan/bore-pile/diameter/50/"
    }
  },

  50: {
    diameter: 50,
    slug: "50",
    metaTitle: "Harga Jasa Bore Pile Diameter 50cm 2026",
    metaDescription: "Jasa bore pile mesin diameter 50 cm harga Rp 215.000/m. Solusi tangguh untuk gedung 4-5 lantai, pabrik & jembatan. Mini crane sendiri, pipa tremi, survei gratis.",
    h1: "Harga Jasa Bore Pile Mesin Diameter 50cm 2026",
    tagline: "Pondasi Tangguh untuk Gedung 4–5 Lantai, Fasilitas Industri & Jembatan",
    priceFormatted: "Rp 215.000",
    minOrderText: "Minimal order: 200 meter lari untuk mesin mini crane. Volume di bawah 200 meter dikenakan biaya minimum setara perhitungan 200 meter.",
    crosslinkHtml: 'Masih mempertimbangkan diameter tiang? Lihat <a href="/layanan/bore-pile/diameter/40/">bore pile 40 cm</a> untuk beban menengah, atau kapasitas lebih besar <a href="/layanan/bore-pile/diameter/60/">bore pile 60 cm</a>.',
    introSummary: "<strong>Harga jasa bore pile 50 cm mulai Rp 215.000 per meter lari.</strong> Biaya ini merupakan harga jasa bor saja (pengeboran, rakit besi tulangan, dan cor pipa tremi). Belum termasuk material besi/beton, mobilisasi alat, dan pembuatan bak sirkulasi air.",
    introParagraph1: "Pada proyek konstruksi berbeban struktural besar, bore pile diameter 50 cm memberikan daya dukung aksial dan tahanan lateral yang sangat tinggi. Diameter ini menjadi andalan konsultan perencana ketika beban kolom gedung tidak memungkinkan lagi ditopang oleh tiang tunggal berdiameter kecil.",
    introParagraph2: "Pengeboran dilakukan oleh operator spesialis mini crane berpengalaman dengan kontrol vertikalitas tiang yang ketat. Seluruh tahapan pengecoran mengadopsi pipa tremi berdiameter proporsional agar aliran beton ready mix tetap lancar dan memadat sempurna dari dasar lubang bor.",
    suitableFor: {
      title: "Bore Pile Diameter 50 cm Cocok untuk Proyek Apa?",
      subtitle: "Diameter 50 cm adalah spesifikasi pondasi beban berat yang dirancang untuk gedung komersial bertingkat menengah, fasilitas pabrik, dan struktur dengan beban titik terkonsentrasi.",
      items: [
        "Gedung perkantoran dan hotel budget 4–5 lantai",
        "Pondasi mesin pabrik bergetar dan genset kapasitas tinggi",
        "Pilar atau abutment jembatan bentang pendek",
        "Gudang logistik dan workshop alat berat",
        "Dinding turap penahan tebing galian basement dalam"
      ],
      depthText: "12 sampai 25 meter, disesuaikan dengan elevasi tanah keras dari hasil uji sondir.",
      limitations: "Untuk gedung di atas 5 lantai atau galian basement multi-lantai dengan tekanan tanah lateral ekstrem, perencana struktur umumnya mengalihkan spesifikasi ke diameter 60 cm."
    },
    simulation: {
      title: "Simulasi Contoh Hitungan Biaya Jasa Bor",
      buildingType: "Gedung Komersial 4 Lantai",
      points: 16,
      depthM: 16,
      totalM: 256,
      pricePerM: 215000,
      totalCost: 55040000,
      note: "*Contoh simulasi estimasi jasa bor saja untuk 16 titik kedalaman 16 meter (total 256 m¹). Belum termasuk material besi beton, biaya pengiriman alat, dan bak sirkulasi air."
    },
    upgradeAdvice: {
      title: "Kapan Sebaiknya Naik ke Diameter 60 cm?",
      intro: "Diameter 50 cm sangat tangguh, namun untuk gedung 5–6 lantai atau dinding galian basement yang dalam, diameter 60 cm memberikan tahanan aksial dan lateral yang jauh lebih superior.",
      nextDiameter: 60,
      currentName: "Diameter 50 cm",
      nextName: "Diameter 60 cm",
      comparisonTable: [
        { label: "Cocok untuk", current: "Gedung 4–5 lantai, pondasi mesin", next: "Gedung 5–6 lantai, dinding basement" },
        { label: "Kedalaman umum", current: "12–25 meter", next: "15–25 meter" },
        { label: "Harga jasa per meter", current: "Rp 215.000", next: "Rp 250.000 – 300.000 est." },
        { label: "Jumlah titik untuk beban sama", current: "Lebih banyak", next: "Lebih sedikit" },
        { label: "Waktu pengerjaan", current: "Lebih cepat per titik", next: "Lebih lama per titik" }
      ],
      upgradeWhenTitle: "Naik ke D60 kalau:",
      upgradeWhen: [
        "Bangunan mencapai 5 hingga 6 lantai",
        "Proyek memiliki galian ruang bawah tanah (basement)",
        "Struktur retaining wall menghadapi dorongan tanah lateral yang sangat kuat",
        "Beban kolom tunggal memerlukan luas penampang tiang ekstra besar"
      ],
      stayWhenTitle: "Tetap di D50 kalau:",
      stayWhen: [
        "Bangunan 4–5 lantai tanpa struktur basement",
        "Beban vertikal sudah terpenuhi aman dengan kapasitas D50",
        "Konsumsi volume cor beton ready mix ingin lebih efisien",
        "Akses lokasi kerja terbatas untuk mata bor ekstra besar"
      ],
      conclusion: "Keputusan menaikkan diameter ke 60 cm selalu merujuk pada gambar kerja DED konsultan perencana dan rekomendasi penyelidikan tanah geoteknik.",
      ctaText: "Lihat Harga Bore Pile Diameter 60 cm →",
      ctaLink: "/layanan/bore-pile/diameter/60/"
    },
    machineSpecTitle: "Seberapa Dalam Bore Pile 50 cm Bisa Dibor?",
    machineSpec: {
      intro: "Kedalaman pengeboran bore pile diameter 50 cm disesuaikan dengan kedalaman lapisan tanah keras (hard strata) berdasarkan hasil uji sondir (CPT) atau bor geoteknik. Pada kondisi tanah lempung atau endapan aluvial, mesin mini crane torsi tinggi kami mampu mengebor hingga kedalaman <strong>20 sampai 25 meter</strong>.",
      maxDepth: "Karena volume galian lubang 50 cm cukup besar, sirkulasi air lumpur dijaga secara konstan untuk menahan tekanan dinding lubang agar tidak terjadi keruntuhan sebelum keranjang besi dan pipa tremi diturunkan.",
      diameterImpact: "Pengeboran dihentikan tepat saat mata bor mencapai lapisan tanah keras yang disyaratkan oleh konsultan perencana struktur proyek Anda."
    },
    diameterComparison: {
      title: "Perbandingan Harga dan Kebutuhan Beton Bore Pile",
      intro: "Bandingkan harga jasa bor dan volume beton teoritis per meter untuk diameter 40, 50, dan 60 cm.",
      tableTitle: "Perbandingan D40, D50, dan D60",
      columns: ["40 cm", "50 cm", "60 cm"],
      rows: [
        { label: "Harga jasa bor per meter", cols: ["Rp 175.000", "Rp 215.000", "Rp 250.000 – 300.000"] },
        { label: "Volume beton teoritis per meter", cols: ["0,126 m³ (±125,7 liter)", "0,196 m³ (±196,3 liter)", "0,283 m³ (±282,7 liter)"] }
      ],
      guideTitle: "Catatan",
      guideHtml: "Harga merupakan jasa bor saja, belum termasuk material, mobilisasi, dan biaya pendukung lainnya. Volume beton adalah hitungan teoritis untuk lubang silinder berdasarkan diameter nominal; kebutuhan aktual dapat berbeda mengikuti kondisi lubang dan pelaksanaan di lapangan."
    },
    comparisonData: {
      title: "Bore Pile 50 cm vs Tiang Pancang Besar (Spun Pile)",
      description: "Pertimbangan teknis antara bore pile mesin 50 cm cor di tempat dengan tiang pancang spun pile pracetak.",
      primaryTitle: "Bore Pile Mesin 50 cm",
      primaryDesc: "Dikerjakan dengan sistem rotary drilling tanpa tumbukan palu mekanik, sehingga bebas dari gelombang kejut getaran yang berisiko meretakkan bangunan sekitar. Sangat aman diaplikasikan di area perkotaan padat penduduk atau di samping bangunan eksisting.",
      secondaryTitle: "Tiang Pancang Spun Pile",
      secondaryDesc: "Membutuhkan mesin hydraulic static pile driver (HSPD) atau hammer crane yang sangat berat, memerlukan akses jalan lebar minimal 5–6 meter, dan dapat memicu heaving (pergerakan tanah lateral) di sekeliling titik pancang.",
      conclusion: "<strong>Kesimpulan:</strong> Untuk lokasi proyek yang berdampingan langsung dengan bangunan eksisting atau berada di jalan akses terbatas, bore pile mesin diameter 50 cm memberikan daya dukung tinggi tanpa risiko komplain getaran dari lingkungan tetangga."
    },
    faqs: [
      {
        question: "Berapa harga jasa bore pile diameter 50 cm per meter lari?",
        answer: "Harga jasa bor mesin diameter 50 cm di Aseven Pile adalah <strong>Rp 215.000 per meter lari (m¹)</strong> untuk biaya jasa bor saja, belum termasuk material besi dan beton, mobilisasi alat, dan bak sirkulasi."
      },
      {
        question: "Kapan proyek harus menggunakan bore pile diameter 50 cm?",
        answer: "Diameter 50 cm umum digunakan pada bangunan bertingkat 4 sampai 5 lantai, gedung perkantoran, fasilitas pabrik dengan beban mesin getar, atau struktur jembatan dengan beban titik yang terkonsentrasi tinggi."
      },
      {
        question: "Berapa kapasitas kedalaman maksimal untuk diameter 50 cm?",
        answer: "Kedalaman pengeboran mini crane untuk diameter 50 cm dapat mencapai <strong>hingga 25 meter</strong>, menyesuaikan dengan kondisi geologi tanah dan letak lapisan tanah keras hasil uji sondir."
      },
      {
        question: "Berapa minimal order pengerjaan bore pile diameter 50 cm?",
        answer: "Ketentuan volume minimal pengerjaan bor mesin diameter 50 cm adalah <strong>200 meter lari (m¹)</strong>. Untuk volume di bawah 200 m¹, pekerjaan tetap dapat kami layani dengan kesepakatan harga borongan (lump sum)."
      },
      {
        question: "Mengapa pengecoran bore pile diameter 50 cm wajib memakai pipa tremi?",
        answer: "Karena diameter 50 cm menampung volume beton cor yang cukup besar di dalam lubang yang terisi air sirkulasi, sistem pipa tremi wajib digunakan agar beton mengalir dari dasar dan mendesak air serta lumpur keluar, mencegah beton keropos atau terpisah dari agregat (segregasi)."
      },
      {
        question: "Apakah bisa melayani sistem borongan paket material (all-in)?",
        answer: "Secara standar kami menawarkan jasa bor saja agar Anda leluasa mengontrol spesifikasi material. Namun jika Anda membutuhkan paket all-in lengkap beserta material besi dan beton cor, tim kami dapat menghitungkan penawaran khusus sesuai spesifikasi gambar konsultan Anda."
      }
    ]
  },

  60: {
    diameter: 60,
    slug: "60",
    metaTitle: "Harga Jasa Bore Pile Diameter 60cm 2026",
    metaDescription: "Jasa bore pile mesin diameter 60 cm harga mulai Rp 250.000/m. Kapasitas beban berat untuk gedung bertingkat, basement & retaining wall. Mini crane sendiri, survei gratis.",
    h1: "Harga Jasa Bore Pile Mesin Diameter 60cm 2026",
    tagline: "Kapasitas Beban Berat untuk Gedung Komersial Bertingkat, Basement & Retaining Wall",
    priceFormatted: "Rp 250.000 – Rp 300.000 est.",
    minOrderText: "Minimal order: 200 meter lari untuk mesin mini crane. Volume di bawah 200 meter dikenakan biaya minimum setara perhitungan 200 meter.",
    crosslinkHtml: 'Lihat juga perbandingan dengan <a href="/layanan/bore-pile/diameter/50/">bore pile 50 cm</a> atau kapasitas ekstra berat <a href="/layanan/bore-pile/diameter/80/">bore pile 80 cm</a>.',
    introSummary: "<strong>Harga jasa bore pile 60 cm mulai Rp 250.000 – Rp 300.000 per meter lari.</strong> Harga estimasi ini merupakan biaya jasa bor saja (pengeboran, rakit besi tulangan, dan cor pipa tremi). Belum termasuk material besi/beton, mobilisasi alat, dan pembuatan bak sirkulasi air.",
    introParagraph1: "Untuk proyek dengan beban aksial dan lateral yang besar, bore pile diameter 60 cm memberikan daya dukung struktural yang sangat kokoh. Diameter ini mampu mendistribusikan beban gedung bertingkat secara merata ke lapisan tanah keras terdalam.",
    introParagraph2: "Pekerjaan dilakukan dengan mesin mini crane torsi tinggi dan kru berpengalaman. Mengingat volume lubang yang besar, metode sirkulasi air dan sistem pipa tremi dijalankan dengan pengawasan ketat agar integritas dinding lubang bor tetap stabil selama pengeboran hingga pengecoran.",
    suitableFor: {
      title: "Bore Pile Diameter 60 cm Cocok untuk Proyek Apa?",
      subtitle: "Diameter 60 cm merupakan pilihan utama untuk proyek gedung bertingkat 5–6 lantai, tiang penahan basement, dan retaining wall tebing curam bertekanan lateral tinggi.",
      items: [
        "Gedung komersial, rumah sakit, dan hotel 5–6 lantai",
        "Dinding penahan galian basement (contiguous bore pile)",
        "Gudang logistik vertikal bertonase tinggi",
        "Pilar jembatan dan struktur overpass jalan",
        "Dinding turap lereng curam penahan bahaya longsor"
      ],
      depthText: "15 sampai 25 meter, disesuaikan dengan posisi lapisan tanah keras hasil sondir.",
      limitations: "Untuk beban terpusat ekstrem seperti abutment jembatan bentang panjang atau tiang flyover jalan raya, diameter 80 cm menjadi opsi tiang bor terbesar."
    },
    simulation: {
      title: "Simulasi Contoh Hitungan Biaya Jasa Bor",
      buildingType: "Gedung Komersial Bertingkat",
      points: 15,
      depthM: 18,
      totalM: 270,
      pricePerM: 250000,
      totalCost: 67500000,
      note: "*Contoh simulasi estimasi jasa bor saja untuk 15 titik kedalaman 18 meter (total 270 m¹). Belum termasuk material besi beton, biaya pengiriman alat, dan penampungan sirkulasi air."
    },
    upgradeAdvice: {
      title: "Kapan Sebaiknya Naik ke Diameter 80 cm?",
      intro: "Diameter 60 cm adalah standar umum gedung bertingkat, sedangkan diameter 80 cm dialokasikan khusus untuk struktur berbeban aksial masif atau pilar jembatan utama.",
      nextDiameter: 80,
      currentName: "Diameter 60 cm",
      nextName: "Diameter 80 cm",
      comparisonTable: [
        { label: "Cocok untuk", current: "Gedung 5–6 lantai, turap basement", next: "Beban masif, jembatan, silo berat" },
        { label: "Kedalaman umum", current: "15–25 meter", next: "18–25 meter" },
        { label: "Harga jasa per meter", current: "Rp 250.000 – 300.000 est.", next: "Rp 300.000 – 350.000 est." },
        { label: "Jumlah titik untuk beban sama", current: "Lebih banyak", next: "Lebih sedikit" },
        { label: "Waktu pengerjaan", current: "Lebih cepat per titik", next: "Lebih lama per titik" }
      ],
      upgradeWhenTitle: "Naik ke D80 kalau:",
      upgradeWhen: [
        "Struktur memiliki beban kolom terpusat yang sangat masif",
        "Pilar atau abutment jembatan lalu lintas beban berat",
        "Pondasi silo, crusher, atau mesin industri berskala raksasa",
        "Perencana struktur mewajibkan tiang tunggal berpenampang ekstra lebar"
      ],
      stayWhenTitle: "Tetap di D60 kalau:",
      stayWhen: [
        "Bangunan gedung bertingkat 5–6 lantai standar",
        "Pekerjaan turap galian basement biasa",
        "Pasokan air kerja dan bak lumpur di lokasi terbatas",
        "Waktu siklus pengeboran per titik ingin lebih efisien"
      ],
      conclusion: "Konsultasikan denah pembebanan proyek Anda bersama tim teknis Aseven Pile untuk memastikan efisiensi biaya dan ketersediaan peralatan di lokasi.",
      ctaText: "Lihat Harga Bore Pile Diameter 80 cm →",
      ctaLink: "/layanan/bore-pile/diameter/80/"
    },
    machineSpecTitle: "Seberapa Dalam Bore Pile 60 cm Bisa Dibor?",
    machineSpec: {
      intro: "Kedalaman efektif bore pile diameter 60 cm sangat ditentukan oleh kekerasan lapisan tanah di lokasi proyek Anda. Pada tanah lempung atau aluvial lunak, mesin mini crane modifikasi torsi tinggi kami mampu mengebor hingga kedalaman <strong>20 sampai 25 meter</strong>.",
      maxDepth: "Pada kedalaman tersebut, tiang bor 60 cm dapat memanfaatkan tahanan geser selimut tiang (skin friction) yang besar sekaligus daya dukung ujung (end bearing) saat menembus lapisan tanah keras.",
      diameterImpact: "Karena lubang bor diameter 60 cm berukuran lebar, kesiapan debit air sirkulasi dan armada mixer beton ready mix harus terkoordinasi secara kontinu agar dinding lubang tidak mengalami deformasi."
    },
    diameterComparison: {
      title: "Perbandingan Harga dan Kebutuhan Beton Bore Pile",
      intro: "Bandingkan harga jasa bor dan volume beton teoritis per meter untuk diameter 50, 60, dan 80 cm.",
      tableTitle: "Perbandingan D50, D60, dan D80",
      columns: ["50 cm", "60 cm", "80 cm"],
      rows: [
        { label: "Harga jasa bor per meter", cols: ["Rp 215.000", "Rp 250.000 – 300.000", "Rp 300.000 – 350.000"] },
        { label: "Volume beton teoritis per meter", cols: ["0,196 m³ (±196,3 liter)", "0,283 m³ (±282,7 liter)", "0,503 m³ (±502,7 liter)"] }
      ],
      guideTitle: "Catatan",
      guideHtml: "Harga merupakan jasa bor saja, belum termasuk material, mobilisasi, dan biaya pendukung lainnya. Volume beton adalah hitungan teoritis untuk lubang silinder berdasarkan diameter nominal; kebutuhan aktual dapat berbeda mengikuti kondisi lubang dan pelaksanaan di lapangan."
    },
    comparisonData: {
      title: "Bore Pile 60 cm vs Tiang Pancang Spun Pile",
      description: "Perbandingan teknis penerapan bore pile 60 cm cor di tempat dengan tiang pancang spun pile pada proyek komersial.",
      primaryTitle: "Bore Pile Mesin 60 cm",
      primaryDesc: "Bekerja dengan pengeboran rotari minim getaran sehingga aman dipasang tepat di batas lahan proyek (property line) atau dinding penahan basement tanpa risiko merusak gedung tetangga.",
      secondaryTitle: "Tiang Pancang Spun Pile",
      secondaryDesc: "Proses pemancangan pada tiang besar membutuhkan hammer berbobot puluhan ton dengan getaran keras dan suara bising, serta berisiko menyebabkan pergeseran tanah horizontal pada area pemukiman padat.",
      conclusion: "<strong>Kesimpulan:</strong> Untuk pekerjaan fondasi gedung bertingkat atau dinding penahan tanah di lingkungan perkotaan yang berdempetan dengan bangunan lain, bore pile mesin 60 cm adalah pilihan paling aman dan bebas dari sengketa lingkungan."
    },
    faqs: [
      {
        question: "Berapa kisaran harga jasa bore pile diameter 60 cm per meter?",
        answer: "Harga jasa bor mesin diameter 60 cm berkisar mulai dari <strong>Rp 250.000 hingga Rp 300.000 per meter lari</strong>, tergantung pada kekerasan lapisan tanah dan volume total proyek."
      },
      {
        question: "Apakah bore pile 60 cm cocok untuk konstruksi dinding basement?",
        answer: "Ya, diameter 60 cm sering diaplikasikan sebagai tiang retaining wall berjejer (contiguous bore pile) untuk menahan tekanan lateral tanah saat penggalian lantai basement."
      },
      {
        question: "Berapa kedalaman maksimal pengeboran untuk diameter 60 cm?",
        answer: "Alat mini crane kami mampu mengebor diameter 60 cm hingga kedalaman <strong>20 sampai 25 meter</strong>, menyesuaikan dengan kondisi tanah keras hasil uji sondir di lokasi."
      },
      {
        question: "Berapa ketentuan minimal order untuk bore pile diameter 60 cm?",
        answer: "Minimal order pekerjaan bore pile mesin diameter 60 cm adalah <strong>200 meter lari (m¹)</strong>. Untuk proyek dengan volume di bawah 200 m¹, pengerjaan dapat disepakati melalui tarif borongan lumpsum setelah survei lokasi."
      },
      {
        question: "Apakah bore pile 60 cm aman dikerjakan dekat bangunan yang sudah ada?",
        answer: "Ya, karena menggunakan metode bor putar tanpa getaran benturan seperti tiang pancang (drop hammer), pengeboran diameter 60 cm aman dikerjakan di sebelah bangunan eksisting tanpa menimbulkan retak struktur."
      },
      {
        question: "Apakah Aseven Pile menyediakan paket borongan plus material untuk 60 cm?",
        answer: "Ya, kami melayani paket borongan jasa bor saja maupun paket all-in material (besi beton SNI dan beton cor ready mix) sesuai gambar spesifikasi konsultan."
      }
    ]
  },

  80: {
    diameter: 80,
    slug: "80",
    metaTitle: "Harga Jasa Bore Pile Diameter 80cm 2026",
    metaDescription: "Jasa bore pile mesin diameter 80 cm harga mulai Rp 300.000/m. Spesifikasi ekstra kuat untuk struktur berat, infrastruktur & pabrik industri. Survei gratis.",
    h1: "Harga Jasa Bore Pile Mesin Diameter 80cm 2026",
    tagline: "Spesifikasi Ekstra Kuat untuk Struktur Berat, Infrastruktur & Pabrik Industri",
    priceFormatted: "Rp 300.000 – Rp 350.000 est.",
    minOrderText: "Minimal order: 200 meter lari untuk mesin mini crane. Volume di bawah 200 meter dikenakan biaya minimum setara perhitungan 200 meter.",
    crosslinkHtml: 'Untuk kebutuhan diameter yang lebih ekonomis, Anda dapat melihat <a href="/layanan/bore-pile/diameter/60/">bore pile 60 cm</a> atau <a href="/layanan/bore-pile/diameter/50/">bore pile 50 cm</a>.',
    introSummary: "<strong>Harga jasa bore pile 80 cm mulai Rp 300.000 – Rp 350.000 per meter lari.</strong> Harga estimasi ini merupakan biaya jasa bor saja (pengeboran, rakit besi tulangan, dan cor pipa tremi). Belum termasuk material besi/beton, mobilisasi alat, dan pembuatan bak sirkulasi air.",
    introParagraph1: "Untuk proyek dengan beban terpusat yang sangat masif, bore pile diameter 80 cm merupakan pilihan utama dalam menjamin ketahanan fondasi jangka panjang. Luas penampangnya yang sangat besar mampu memikul beban kolom masif sekaligus menahan gaya geser lateral ekstrem.",
    introParagraph2: "Pengerjaan diameter 80 cm menuntut presisi alat, kestabilan rig mini crane, dan kru berpengalaman. Sirkulasi air lumpur dijaga secara ketat agar dinding lubang bor tetap tegak dan tidak runtuh sebelum seluruh tahapan pengecoran pipa tremi selesai dilakukan.",
    suitableFor: {
      title: "Bore Pile Diameter 80 cm Cocok untuk Proyek Apa?",
      subtitle: "Diameter 80 cm adalah spesifikasi terbesar yang ditangani rig mini crane modifikasi torsi tinggi Aseven Pile untuk struktur infrastruktur, tiang jembatan, dan beban ekstra berat.",
      items: [
        "Gedung bertingkat tinggi dengan beban kolom tunggal sangat besar",
        "Abutment jembatan dan flyover jalan raya",
        "Pondasi mesin manufaktur berat (silo baja, crusher, mesin cetak baja)",
        "Dinding penahan tanah tebing galian sangat dalam",
        "Pondasi tower telekomunikasi dan transmisi tegangan tinggi"
      ],
      depthText: "18 sampai 25 meter, mengacu ketat pada rekomendasi laporan geoteknik.",
      limitations: "Pengerjaan diameter 80 cm membutuhkan suplai air debit besar dan akses jalan minimal 3,5–4 meter untuk antrean truk mixer beton ready mix selama pengecoran kontinu."
    },
    simulation: {
      title: "Simulasi Contoh Hitungan Biaya Jasa Bor",
      buildingType: "Struktur Industri / Beban Berat",
      points: 12,
      depthM: 20,
      totalM: 240,
      pricePerM: 300000,
      totalCost: 72000000,
      note: "*Contoh simulasi estimasi jasa bor saja untuk 12 titik kedalaman 20 meter (total 240 m¹). Belum termasuk material besi beton, biaya pengiriman alat, dan penampungan sirkulasi air."
    },
    upgradeAdvice: {
      title: "Keunggulan Mini Crane untuk Diameter 80 cm dibanding Crane Raksasa",
      intro: "Banyak kontraktor mengira pengeboran diameter 80 cm hanya bisa dikerjakan alat berat crawler crane raksasa 40 ton. Aseven Pile menyediakan rig mini crane modifikasi torsi tinggi yang dapat mengebor diameter 80 cm di lokasi dengan akses jalan terbatas.",
      nextDiameter: 0,
      currentName: "Mini Crane Aseven Pile (Ø80cm)",
      nextName: "Crawler Crane Raksasa 40 Ton",
      comparisonTable: [
        { label: "Akses Jalan Masuk", current: "Cukup lebar 3,5–4 meter", next: "Butuh jalan lebar minimal 6–8 meter (truk tronton)" },
        { label: "Biaya Mobilisasi Alat", current: "Jauh lebih ekonomis (truk engkel/fuso)", next: "Sangat mahal (lowbed multi-axle + kawal)" },
        { label: "Manuver di Lokasi Sempit", current: "Lincah & kompak di lahan terbatas", next: "Butuh area kerja sangat luas bebas kabel/tiang" },
        { label: "Dampak Getaran Tanah", current: "Minim getaran, aman samping gedung", next: "Getaran pergerakan rantai track crawler berat" }
      ],
      upgradeWhenTitle: "Pilih Mini Crane Aseven Pile kalau:",
      upgradeWhen: [
        "Akses jalan proyek berada di kawasan padat atau jalan kelas menengah",
        "Area kerja terbatas di samping bangunan eksisting",
        "Ingin menekan anggaran mobilisasi alat berat secara signifikan",
        "Target kedalaman tiang berada di kisaran 18 hingga 25 meter"
      ],
      stayWhenTitle: "Pilih Crawler Crane Raksasa kalau:",
      stayWhen: [
        "Proyek jalan tol terbuka bebas hambatan",
        "Kedalaman pengeboran wajib menembus >30 meter pada batuan masif",
        "Diameter tiang rencana melebihi 100 cm (1 meter hingga 1,5 meter)"
      ],
      conclusion: "Jika proyek Anda membutuhkan tiang pondasi kokoh diameter 80 cm namun terkendala akses atau efisiensi anggaran mobdemob, armada mini crane Aseven Pile adalah solusi paling tepat.",
      ctaText: "Konsultasi Teknis Diameter 80 cm →",
      ctaLink: "https://wa.me/6285814173761?text=Halo%20Aseven%20Pile,%20saya%20dari%20website%20ingin%20menanyakan%20terkait%20Jasa%20Bore%20Pile%20Diameter%2080%20cm"
    },
    machineSpecTitle: "Seberapa Dalam Bore Pile 80 cm Bisa Dibor?",
    machineSpec: {
      intro: "Kedalaman pengeboran bore pile diameter 80 cm umumnya berkisar antara <strong>18 sampai 25 meter</strong>, mengacu ketat pada rekomendasi penyelidikan tanah geoteknik dan elevasi lapisan hard strata.",
      maxDepth: "Karena tahanan torsi tanah untuk lubang 80 cm sangat besar, pengeboran dilakukan bertahap menggunakan mata bor auger dan cleaning bucket khusus untuk memastikan dasar tiang bersih dari sedimen lumpur.",
      diameterImpact: "Pengecoran tiang diameter 80 cm membutuhkan volume ready mix yang tinggi secara kontinu, sehingga koordinasi pasokan beton cor dari batching plant disinkronkan langsung saat persiapan pengecoran pipa tremi."
    },
    diameterComparison: {
      title: "Perbandingan Harga dan Kebutuhan Beton Bore Pile",
      intro: "Bandingkan harga jasa bor dan volume beton teoritis per meter untuk diameter 50, 60, dan 80 cm.",
      tableTitle: "Perbandingan D50, D60, dan D80",
      columns: ["50 cm", "60 cm", "80 cm"],
      rows: [
        { label: "Harga jasa bor per meter", cols: ["Rp 215.000", "Rp 250.000 – 300.000", "Rp 300.000 – 350.000"] },
        { label: "Volume beton teoritis per meter", cols: ["0,196 m³ (±196,3 liter)", "0,283 m³ (±282,7 liter)", "0,503 m³ (±502,7 liter)"] }
      ],
      guideTitle: "Catatan",
      guideHtml: "Harga merupakan jasa bor saja, belum termasuk material, mobilisasi, dan biaya pendukung lainnya. Volume beton adalah hitungan teoritis untuk lubang silinder berdasarkan diameter nominal; kebutuhan aktual dapat berbeda mengikuti kondisi lubang dan pelaksanaan di lapangan."
    },
    comparisonData: {
      title: "Bore Pile 80 cm vs Tiang Pancang Spun Pile Skala Besar",
      description: "Perbandingan fondasi beban berat diameter 80 cm cor di tempat dengan tiang pancang spun pile besar.",
      primaryTitle: "Bore Pile Mesin 80 cm",
      primaryDesc: "Bekerja dengan sistem pengeboran rotari tanpa tumbukan palu pemancang. Meskipun berdiameter besar, pengerjaan tetap minim getaran sehingga aman dari risiko keretakan pada bangunan maupun jaringan utilitas di sekitarnya.",
      secondaryTitle: "Tiang Pancang Spun Pile Besar",
      secondaryDesc: "Memerlukan crane pemancang raksasa yang sangat bising dan menggetarkan tanah secara masif, serta membutuhkan akses jalan kelas berat untuk mobilisasi tiang beton pracetak panjang.",
      conclusion: "<strong>Kesimpulan:</strong> Untuk struktur beban berat di lokasi yang memiliki keterbatasan manuver alat berat raksasa atau berada dekat kawasan pemukiman, bore pile mesin diameter 80 cm adalah solusi pondasi yang paling aman dan efisien."
    },
    faqs: [
      {
        question: "Berapa kisaran harga jasa bore pile diameter 80 cm per meter?",
        answer: "Harga jasa bor mesin diameter 80 cm berkisar mulai dari <strong>Rp 300.000 hingga Rp 350.000 per meter lari</strong>, tergantung pada kekerasan lapisan tanah dan total volume pekerjaan proyek Anda."
      },
      {
        question: "Apakah pengerjaan diameter 80 cm bisa menggunakan mesin mini crane?",
        answer: "Ya, rig mini crane Aseven Pile dengan torsi tinggi dan konstruksi rig yang diperkuat mampu mengebor diameter 80 cm untuk lokasi yang tetap membutuhkan akses lebih fleksibel dibanding crane raksasa."
      },
      {
        question: "Berapa minimal order meter lari untuk diameter 80 cm?",
        answer: "Minimal order pekerjaan bor mesin adalah <strong>200 meter lari (m¹)</strong>. Jika volume proyek Anda di bawah 200 m¹, pekerjaan tetap dapat dilayani melalui kesepakatan sistem borongan (lump sum)."
      },
      {
        question: "Mengapa pengecoran bore pile diameter 80 cm wajib memakai pipa tremi?",
        answer: "Pengecoran diameter 80 cm memerlukan volume beton yang sangat besar di dalam lubang yang terisi air sirkulasi. Pipa tremi memastikan beton mengalir padat dari dasar lubang, mendesak air dan lumpur ke atas tanpa risiko beton terurai (segregasi) atau berongga."
      },
      {
        question: "Berapa lama estimasi pengerjaan pondasi bore pile diameter 80 cm?",
        answer: "Waktu pengerjaan diameter 80 cm tergantung pada kekerasan lapisan tanah dan ketersediaan suplai air serta beton cor ready mix. Rata-rata tim kami menyelesaikan 1 hingga 2 titik per hari per rig mini crane untuk kedalaman 18–20 meter."
      },
      {
        question: "Apakah melayani borongan terima beres beserta besi dan ready mix?",
        answer: "Ya, kami dapat menyediakan paket borongan all-in material lengkap dengan besi tulangan ulir SNI dan mutu beton ready mix K-300 / K-350 sesuai arahan konsultan struktur Anda."
      }
    ]
  }
};

export function getDiameterData(diameter: number): DiameterData {
  return BORE_PILE_DIAMETERS[diameter] || BORE_PILE_DIAMETERS[30];
}
