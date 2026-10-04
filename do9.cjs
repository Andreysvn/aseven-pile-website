const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

// Replace everything between <!-- SECTION 1: ... --> and <!-- SECTION 2: ... -->
const regex = /<!-- ================================================ -->\s*<!-- SECTION 1: Hero \+ Trust Badges \+ Direct Answer\s*-->\s*<!-- ================================================ -->\s*<section class="ls-section">[\s\S]*?<\/section>/;

text = text.replace(regex, '<!-- ================================================ -->\n  <!-- SECTION 1: Header / Intro                        -->\n  <!-- ================================================ -->\n  <ServiceIntro service="borepile" cityName={cityData.name} hargaMulai={120000} foundingYear={siteConfig.foundingYear} />');

// Add import if missing
if (!text.includes('import ServiceIntro')) {
    text = text.replace("import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';", "import LocalSEOLayout from '../../../components/layout/LocalSEOLayout.astro';\nimport ServiceIntro from '../../../components/ui/ServiceIntro.astro';");
}

fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);
