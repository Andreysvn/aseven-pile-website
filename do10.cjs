const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

const regex = /<!-- ================================================ -->\s*<!-- SECTION 1: Header \/ Intro\s*-->\s*<!-- ================================================ -->\s*<section class="ls-section">[\s\S]*?<\/section>/;

text = text.replace(regex, '<!-- ================================================ -->\n  <!-- SECTION 1: Header / Intro                        -->\n  <!-- ================================================ -->\n  <ServiceIntro service="strauss" cityName={cityData.name} hargaMulai={hargaStraussPile} />');

if (!text.includes('import ServiceIntro')) {
    text = text.replace("import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';", "import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';\nimport ServiceIntro from '../../../components/ui/ServiceIntro.astro';");
}

fs.writeFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', text);
