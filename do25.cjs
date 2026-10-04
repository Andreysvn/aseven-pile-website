const fs = require('fs');
const cities = JSON.parse(fs.readFileSync('src/data/cities.json', 'utf8'));
console.log(Object.keys(cities[0]));
