const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

text = text.replace(
    /\{cityData\.groupedAreas && cityData\.groupedAreas\.length > 0 \? \([\s\S]*?\)\n    \)\}/g,
    "<ServiceArea cityData={cityData} serviceName=\"Bore Pile\" />"
);

if (!text.includes('import ServiceArea')) {
    text = text.replace("import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';", "import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';\nimport ServiceArea from '../../../components/ui/ServiceArea.astro';");
}

fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text.trim() + '\n');
