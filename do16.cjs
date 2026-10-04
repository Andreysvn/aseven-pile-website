const fs = require('fs');
let bore = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

// 1. Get strauss-pile's specific initial imports and variables
// Strauss pile has:
// const hargaStraussPile = cityData.slug === 'jakarta' || cityData.slug.includes('jakarta') ? 95000 : 90000;
// We will just do a string replace on the content of bore-pile

let strauss = bore;

// Replace layout title and path
strauss = strauss.replace(/title=\{\`Harga Jasa Bore Pile \$\{cityData\.name\} 2026\`\}/, "title={`Harga Jasa Strauss Pile ${cityData.name} 2026`}");
strauss = strauss.replace(/description=\{\`Jasa bore pile mesin di \$\{cityData\.name\}\. Harga mulai Rp 120\.000\/m \(O30cm\)\. Alat mini crane milik sendiri, berpengalaman sejak \$\{siteConfig\.foundingYear\}\. Survei & konsultasi gratis\.\`\}/, "description={`Jasa strauss pile manual di ${cityData.name}. Harga mulai Rp 90.000/m (O25cm). Cocok untuk gang sempit dan perumahan padat. Survei & konsultasi gratis.`}");
strauss = strauss.replace(/serviceName="Bore Pile"/g, 'serviceName="Strauss Pile"');
strauss = strauss.replace(/pathContext="bore-pile"/, 'pathContext="strauss-pile"');

// Imports
strauss = strauss.replace(/getProjects\(cityData\.slug, 'borepile'\)/g, "getProjects(cityData.slug, 'strauss')");
strauss = strauss.replace(/getCityFaqs\(cityData, 'borepile'\)/g, "getCityFaqs(cityData, 'strauss')");

// ServiceIntro
strauss = strauss.replace(/<ServiceIntro service="borepile" cityName=\{cityData\.name\} hargaMulai=\{120000\} foundingYear=\{siteConfig\.foundingYear\} \/>/, 
  "const hargaStraussPile = cityData.slug.includes('jakarta') ? 95000 : 90000;\n\n  <ServiceIntro service=\"strauss\" cityName={cityData.name} hargaMulai={hargaStraussPile} />");

// PricingTable
strauss = strauss.replace(/<PricingTable method="borepile" city=\{cityData\.name\} \/>/, '<PricingTable method="strauss" city={cityData.name} />');

// Example variables
strauss = strauss.replace(/Biaya Asli Proyek Bore Pile/g, 'Biaya Asli Proyek Strauss Pile');
strauss = strauss.replace(/Contoh Perhitungan Biaya Bore Pile/g, 'Contoh Perhitungan Biaya Strauss Pile');

// Calculator
strauss = strauss.replace(/<CalculatorUI \n    city=\{cityData\.name\}\n    citySlug=\{cityData\.slug\}\n    locationGroup=\{calcLoc\}\n    method="borepile"\n  \/>/g, 
  '<CalculatorUI \n    city={cityData.name}\n    citySlug={cityData.slug}\n    locationGroup={calcLoc}\n    method="strauss"\n  />');

// Comparison
strauss = strauss.replace(/Bore Pile Mesin vs Tiang Pancang di \$\{cityData\.name\}/g, `Strauss Pile Manual vs Bore Pile Mesin di \${cityData.name}`);
strauss = strauss.replace(/primaryTitle="Bore Pile Mesin"/g, 'primaryTitle="Strauss Pile Manual"');
strauss = strauss.replace(/primaryDesc=\{.*?}/s, 'primaryDesc={`Strauss pile adalah metode pengeboran tanah secara manual (tenaga manusia) memutar mata bor. Karena alatnya ringkas, metode ini 100% bebas bising dan bebas getaran. Sangat cocok untuk proyek di gang sempit atau perumahan padat di ${cityData.name} yang tidak bisa dimasuki alat berat. Namun, karena manual, kedalamannya terbatas (rata-rata 6-8 meter) dan hanya bisa menembus tanah lunak hingga sedang.`}');
strauss = strauss.replace(/secondaryTitle="Tiang Pancang \(Paku Bumi\)"/g, 'secondaryTitle="Bore Pile Mesin (Mini Crane)"');
strauss = strauss.replace(/secondaryDesc=".*?"/s, 'secondaryDesc="Bore pile mesin menggunakan alat mini crane hidrolik. Metodenya sama-sama mengebor tanah, tetapi karena menggunakan mesin, kemampuannya jauh lebih besar. Bisa mengebor hingga kedalaman 30 meter dan menembus lapisan tanah keras atau berbatu. Cocok untuk bangunan beban berat seperti ruko 3 lantai ke atas atau pabrik. Kelemahannya, butuh ruang manuver alat dan suplai air yang cukup besar untuk sirkulasi."');
strauss = strauss.replace(/conclusion=\{.*?}/s, 'conclusion={`<strong>Kesimpulan:</strong> Jika proyek Anda di <strong>${cityData.name}</strong> adalah rumah 2 lantai atau pagar yang berlokasi di gang sempit dan tidak butuh kedalaman lebih dari 8 meter, Strauss Pile adalah pilihan paling efisien dan murah. Namun, jika butuh daya dukung besar untuk bangunan 3 lantai ke atas, atau kondisi tanah kerasnya sangat dalam, maka Bore Pile Mesin adalah solusinya.`}');

// Gallery
strauss = strauss.replace(/Dokumentasi Proyek Bore Pile/g, 'Dokumentasi Proyek Strauss Pile');
strauss = strauss.replace(/Bukti pengerjaan lapangan pondasi bore pile mesin yang dikerjakan/g, 'Bukti pengerjaan lapangan pondasi strauss pile manual yang dikerjakan');
strauss = strauss.replace(/Proses Pengeboran Bore Pile Mesin di/g, 'Proses Pengerjaan Strauss Pile di');

// Process
strauss = strauss.replace(/SOP Pengerjaan Bore Pile di/g, 'SOP Pengerjaan Strauss Pile di');
strauss = strauss.replace(/rig bore pile mesin di titik awal. Pengeboran dilakukan hingga mencapai kedalaman tanah keras/g, 'alat bor manual (pipa dan mata bor silang). Pengeboran dilakukan dengan memutar pipa secara manual oleh 2-3 orang pekerja hingga mencapai tanah keras/maksimal alat');
strauss = strauss.replace(/menggunakan teknik pipa tremi dari dasar lubang, menekan lumpur dan air naik keluar/g, 'langsung ke dalam lubang bor yang dipastikan kering (atau dikuras terlebih dahulu) agar adukan beton');

// FAQ
strauss = strauss.replace(/Pertanyaan Seputar Bore Pile di/g, 'Pertanyaan Seputar Strauss Pile di');

// CTA
strauss = strauss.replace(/saya mau konsultasi jasa bore pile/g, 'saya mau konsultasi jasa strauss pile');
strauss = strauss.replace(/serviceType="bore-pile"/g, 'serviceType="strauss-pile"');

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', strauss);
