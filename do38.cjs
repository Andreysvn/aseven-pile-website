const fs = require('fs');
const bore = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');
const strauss = fs.readFileSync('src/pages/area-layanan/strauss-pile/[kota].astro', 'utf8');

const getTags = (content) => {
  const tags = [];
  const regex = /<([A-Z][a-zA-Z0-9]*)\s/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return tags;
};

console.log("Bore Pile:", getTags(bore).join(', '));
console.log("Strauss Pile:", getTags(strauss).join(', '));
