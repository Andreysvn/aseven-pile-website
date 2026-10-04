const fs = require('fs');
let text = fs.readFileSync('src/data/example.ts', 'utf8');
text = text.replace('export function exampleForCity(city: any): ExampleCalc {', 'export function exampleForCity(city: any, service: "borepile" | "strauss" = "borepile"): ExampleCalc {');
text = text.replace('const cs = city.caseStudy;', 'const cs = service === "strauss" && city.caseStudyStrauss ? city.caseStudyStrauss : city.caseStudy;');
fs.writeFileSync('src/data/example.ts', text);
