const fs = require('fs');
let cities = JSON.parse(fs.readFileSync('src/data/cities.json', 'utf8'));

const jakarta = cities.find(c => c.slug === 'jakarta');
if (jakarta) {
  jakarta.localFaqsStrauss = [
    {
      "question": "Apa perbedaan Strauss Pile dan Bore Pile Mesin?",
      "answer": "Strauss pile dikerjakan manual dengan tenaga manusia, kedalaman terbatas 6-8 meter, dan cocok untuk area sempit. Bore pile mesin menggunakan mini crane hidrolik, bisa mencapai 30 meter, dan cocok untuk bangunan berat."
    },
    {
      "question": "Berapa lama pengerjaan strauss pile untuk rumah 2 lantai di Jakarta?",
      "answer": "Untuk rumah 2 lantai dengan 12-18 titik pada kedalaman 6 meter, pengerjaan biasanya memakan waktu 5-8 hari kerja, tergantung kondisi tanah dan akses lokasi."
    },
    {
      "question": "Apakah strauss pile aman untuk bangunan yang berbatasan langsung dengan tetangga?",
      "answer": "Ya. Karena tidak menggunakan mesin, tidak ada getaran maupun suara bising. Ini justru keunggulan utama strauss pile dibandingkan metode lain di perumahan padat."
    },
    {
      "question": "Apakah strauss pile bisa dikerjakan di dalam ruangan atau basement?",
      "answer": "Bisa. Alat bor manual kami sangat ringan dan tidak menghasilkan gas buang, sehingga cocok untuk pekerjaan di dalam ruangan atau area tertutup."
    },
    {
      "question": "Apakah tanah di Jakarta Utara yang berawa bisa dipasang strauss pile?",
      "answer": "Bisa, dengan catatan kedalaman dibatasi pada lapisan tanah yang stabil dan menggunakan casing untuk mencegah kelongsoran. Untuk area yang sangat berair, kami akan mengevaluasi apakah strauss pile masih memadai atau perlu bore pile mesin."
    }
  ];
  
  // also update caseStudy for strauss if needed? The user's text says:
  // "Diameter 30 cm, 22 titik, kedalaman 6 meter. Total 11.220.000"
  // Let's add a caseStudyStrauss field to cities.json!
  jakarta.caseStudyStrauss = {
    isReal: true,
    items: [
      {
        diameterCm: 30,
        depthM: 6,
        points: 22,
        price: 85000
      }
    ]
  };
}

fs.writeFileSync('src/data/cities.json', JSON.stringify(cities, null, 2));
