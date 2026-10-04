const fs = require('fs');
let text = fs.readFileSync('src/components/ui/SoilCharacter.astro', 'utf8');

text = text.replace('interface Props {', 'interface Props {\n  service?: "borepile" | "strauss";');
text = text.replace('const { city, standalone = true } = Astro.props;', 'const { city, service = "borepile", standalone = true } = Astro.props;');
text = text.replace('const entry = SOIL_CHARACTER[city.slug];', 'const entry = SOIL_CHARACTER[city.slug];\nconst contentHtml = (service === "strauss" && entry?.htmlStrauss) ? entry.htmlStrauss : entry?.html;');

text = text.replace(/set:html=\{entry\.html\}/g, 'set:html={contentHtml}');

fs.writeFileSync('src/components/ui/SoilCharacter.astro', text);
