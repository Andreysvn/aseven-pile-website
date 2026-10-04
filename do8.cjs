const fs = require('fs');
let text = fs.readFileSync('src/styles/local-seo.css', 'utf8');

text = text.replace('align-self: center; /* overlap and center for mobile */', 'align-self: center;\n  margin: -24px auto;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);');

fs.writeFileSync('src/styles/local-seo.css', text);
