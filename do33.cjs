const fs = require('fs');
let text = fs.readFileSync('src/components/ui/SoilCharacter.astro', 'utf8');
text = text.replace(
  '<h2 class="ls-mach-title">Karakteristik Tanah di {city.name}</h2>',
  '<h2 class="ls-mach-title">Karakteristik Tanah di {city.name}{service === "strauss" ? " untuk Strauss Pile" : ""}</h2>'
);
fs.writeFileSync('src/components/ui/SoilCharacter.astro', text);
