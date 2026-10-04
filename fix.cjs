const fs = require('fs');
let text = fs.readFileSync('src/components/ui/CostExample.astro', 'utf8');

text = text.replace(': \\\\ titik \\u00D7 \\ m \\u00D7 \\\\', ': `${ex.items[0].points} titik \\u00D7 ${ex.items[0].depthM} m \\u00D7 ${rupiah(ex.items[0].pricePerM)}`');

fs.writeFileSync('src/components/ui/CostExample.astro', text);
