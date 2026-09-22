const fs = require('fs');
let code = fs.readFileSync('src/components/interactive/CalculatorUI.tsx', 'utf8');

const styleStart = code.indexOf('<style>{`');
const styleEnd = code.indexOf('`}</style>');

if (styleStart > -1 && styleEnd > -1) {
  const cssContent = code.substring(styleStart + 9, styleEnd);
  fs.mkdirSync('src/styles', { recursive: true });
  fs.writeFileSync('src/styles/calculator.css', cssContent.trim());
  
  const newCode = code.substring(0, styleStart) + code.substring(styleEnd + 10);
  const importLine = 'import "../../styles/calculator.css";\n';
  const finalCode = importLine + newCode;
  
  fs.writeFileSync('src/components/interactive/CalculatorUI.tsx', finalCode);
  console.log('CSS extracted successfully.');
} else {
  console.log('Style block not found.');
}
