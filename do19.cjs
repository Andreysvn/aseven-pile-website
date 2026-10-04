const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

const replacement = `<ComparisonSection
    title={\`Strauss Pile Manual vs Bore Pile Mesin di \${cityData.name}\`}
    description={\`Bingung antara pondasi bor manual (strauss pile) atau bore pile mesin? Berikut bedanya, disesuaikan dengan kondisi lapangan di \${cityData.name}:\`}
    primaryTitle="Strauss Pile Manual"
    primaryDesc={\`Strauss pile adalah metode pengeboran tanah secara manual (tenaga manusia) memutar mata bor. Karena alatnya ringkas, metode ini 100% bebas bising dan bebas getaran. Sangat cocok untuk proyek di gang sempit atau perumahan padat di \${cityData.name} yang tidak bisa dimasuki alat berat. Namun, karena manual, kedalamannya terbatas (rata-rata 6-8 meter) dan hanya bisa menembus tanah lunak hingga sedang.\`}
    secondaryTitle="Bore Pile Mesin (Mini Crane)"
    secondaryDesc="Bore pile mesin menggunakan alat mini crane hidrolik. Metodenya sama-sama mengebor tanah, tetapi karena menggunakan mesin, kemampuannya jauh lebih besar. Bisa mengebor hingga kedalaman 30 meter dan menembus lapisan tanah keras atau berbatu. Cocok untuk bangunan beban berat seperti ruko 3 lantai ke atas atau pabrik. Kelemahannya, butuh ruang manuver alat dan suplai air yang cukup besar untuk sirkulasi."
    conclusion={\`<strong>Kesimpulan:</strong> Jika proyek Anda di <strong>\${cityData.name}</strong> adalah rumah 2 lantai atau pagar yang berlokasi di gang sempit dan tidak butuh kedalaman lebih dari 8 meter, Strauss Pile adalah pilihan paling efisien dan murah. Namun, jika butuh daya dukung besar untuk bangunan 3 lantai ke atas, atau kondisi tanah kerasnya sangat dalam, maka Bore Pile Mesin adalah solusinya.\`}
  />`;

text = text.replace(/<ComparisonSection[\s\S]*?\/>/, replacement);
fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
