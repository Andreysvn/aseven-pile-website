const fs = require('fs');
let text = fs.readFileSync('src/pages/area-layanan/bore-pile/[kota].astro', 'utf8');

const s6start = text.indexOf('<!-- SECTION 6: Keunggulan');
const s7start = text.indexOf('<!-- ================================================ -->\r\n    <!-- SECTION 7: Bore Pile');
if(s7start === -1) { console.log("s7start not found using \\r\\n"); }

const s7_alt = text.indexOf('<!-- SECTION 7: Bore Pile Mesin vs Tiang Pancang');
const section7Header = text.substring(text.lastIndexOf('<!-- ================================================ -->', s7_alt), s7_alt);

let target = text.substring(s6start, s7_alt - section7Header.length);
if(s6start !== -1) {
  const icon1 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
  const icon2 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>';
  const icon3 = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path><path d="M8 18h.01"></path><path d="M16 18h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M16 14h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path></svg>';
  const newFeat = <!-- SECTION 6: Keunggulan -->\n    <ServiceFeatures \n      title={\Keunggulan Jasa Bore Pile Aseven Pile di \\}\n      features={[\n        { title: 'Minim Getaran & Aman', desc: \Mesin bor kami dirancang bekerja tanpa menimbulkan getaran keras. Sangat aman diaplikasikan di lingkungan padat penduduk \ tanpa merusak tembok rumah tetangga.\, iconRawSvg: '' },\n        { title: 'Berpengalaman', desc: 'Tim kami sudah berpengalaman dalam pekerjaan pondasi, khususnya bore pile, dan terbiasa menangani berbagai kondisi tanah di lapangan.', iconRawSvg: '' },\n        { title: 'Komitmen Kualitas', desc: 'Layanan yang dihasilkan mengutamakan kualitas dan dikerjakan sesuai prosedur, spesifikasi yang disepakati, serta Standar Nasional Indonesia (SNI).', iconRawSvg: '' }\n      ]}\n    />\n\n    ;
  
  text = text.replace(target, newFeat);
  fs.writeFileSync('src/pages/area-layanan/bore-pile/[kota].astro', text);
  console.log("Feat Replaced.");
}
