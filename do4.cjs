const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

const imports = "import CostExample from '../../../components/ui/CostExample.astro';\n";
if(!text.includes('CostExample')) {
  text = text.replace("import CostAddons", imports + "import CostAddons");
}

const s5start = text.indexOf('<!-- SECTION 5: Contoh Hitungan');
const s6start = text.indexOf('<!-- SECTION 6: Keunggulan');

if(s5start !== -1 && s6start !== -1) {
  // We want to replace from s5start to just before the "<!-- ==========================" above SECTION 6.
  const endMarker = text.lastIndexOf('<!-- ================================================ -->', s6start);
  const block = text.substring(s5start, endMarker);
  const newBlock = `<!-- SECTION 5: Contoh Hitungan -->\n  <CostExample\n    title={projectTitle}\n    description={projectDesc}\n    ex={ex}\n    note={caseNote}\n  />\n\n  <CostAddons service="borepile" />\n\n  `;
  text = text.replace(block, newBlock);
  fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);
  console.log('Replaced CostExample successfully!');
} else {
  console.log('Could not find block', s5start, s6start);
}
