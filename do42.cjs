const fs = require('fs');

function moveSoilCharacter(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  
  const soilRegex = /<!-- =+ -->\r?\n\s*<!-- SECTION: Karakteristik Tanah\s*-->\r?\n\s*<!-- =+ -->\r?\n\s*<SoilCharacter[^>]+>\r?\n\r?\n/g;
  
  const soilMatch = text.match(soilRegex);
  if (soilMatch) {
    text = text.replace(soilMatch[0], '');
    
    // Insert after CostAddons
    const targetRegex = /(<CostAddons[^>]+>)/;
    text = text.replace(targetRegex, `$1\n\n${soilMatch[0]}`);
    fs.writeFileSync(filePath, text);
  }
}

moveSoilCharacter('src/pages/area-layanan/bore-pile/[kota].astro');
moveSoilCharacter('src/pages/area-layanan/strauss-pile/[kota].astro');
