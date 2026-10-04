const fs = require('fs');

function fixTitles(file) {
    let text = fs.readFileSync(file, 'utf8');
    // Remove "| Aseven Pile" from title props
    text = text.replace(/title={`Harga Jasa Bore Pile \${cityData\.name} \d+ \| Aseven Pile`}/, "title={`Harga Jasa Bore Pile ${cityData.name} 2026`}");
    text = text.replace(/title={`Harga Jasa Strauss Pile \${cityData\.name} \d+ \| Aseven Pile`}/, "title={`Harga Jasa Strauss Pile ${cityData.name} 2026`}");
    
    // Also remove from description if any branding duplication
    fs.writeFileSync(file, text);
}

fixTitles('src/pages/area-layanan/bore-pile/[kota].astro');
fixTitles('src/pages/area-layanan/strauss-pile/[kota].astro');
