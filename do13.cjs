const cities = require('./src/data/cities.json');
const jakarta = cities.find(c => c.slug === 'jakarta');
console.log(JSON.stringify(jakarta, null, 2));
