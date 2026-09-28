const fs = require('fs');
const files = [
  'src/components/ui/ServicesGridNew.astro'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/"\/layanan\/bore-pile-mesin\/gawangan"/g, '"/layanan/bore-pile-mesin/gawangan-mesin"');
  fs.writeFileSync(f, content);
  console.log('Fixed links in ' + f);
});
