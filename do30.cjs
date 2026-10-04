const fs = require('fs');
let text = fs.readFileSync('src/data/soil.ts', 'utf8');

text = text.replace('export interface SoilCharacter {', 'export interface SoilCharacter {\n  htmlStrauss?: string;');

const jakartaRegex = /jakarta: \{\s*html: '.*?',\s*\},/g;
const match = text.match(jakartaRegex);

if (match) {
  const replacement = match[0].replace('},', `  htmlStrauss: 'Tanah Jakarta terdiri dari endapan aluvial muda, bekas rawa, dan timbunan organik. Untuk pekerjaan strauss pile yang kedalamannya terbatas pada 6–8 meter, lapisan tanah yang dihadapi umumnya masih dalam zona lempung lunak hingga sedang. Di kawasan pesisir seperti <strong>Jakarta Utara</strong>, tanahnya lebih berair sehingga pengeboran manual bisa lebih lambat dan membutuhkan casing untuk mencegah kelongsoran. Sementara di wilayah seperti <strong>Cengkareng</strong> dan <strong>Kalideres</strong> yang rawan penurunan tanah, strauss pile masih memadai untuk bangunan ringan seperti rumah tinggal atau pagar, selama kedalaman rencananya tidak melebihi kapasitas metode manual.',\n  },`);
  text = text.replace(match[0], replacement);
  fs.writeFileSync('src/data/soil.ts', text);
}
