const fs = require('fs');

const mc = fs.readFileSync('src/pages/layanan/bore-pile-mesin/mini-crane.astro', 'utf8');

// The goal is to safely rewrite gawangan using the exact template of mini-crane
let gw = mc;

// 1. Meta & Title
gw = gw.replace(/title="[^"]*"/, 'title="Bore Pile Mesin Gawangan | Aseven Pile"');
gw = gw.replace(/description="[^"]*"/, 'description="Layanan bore pile mesin gawangan. Alat bore pile berbentuk persegi seperti gawang, menggunakan metode wash boring dan dry boring."');

// 2. Hero Section
gw = gw.replace('<span class="badge">Bore Pile Mesin</span>', '<span class="badge">Bore Pile Mesin</span>');
gw = gw.replace('<h1>Mini Crane</h1>', '<h1>Gawangan</h1>');
gw = gw.replace('<p class="subtitle">Solusi bore pile untuk area sempit dan perumahan padat karena minim getaran tanah.</p>', '<p class="subtitle">Alat bore pile berbentuk persegi seperti gawang, perlu menggunakan tali sebagai penopang kestabilan alat saat berdiri. Mesin ini menggunakan metode wash boring (bor basah) dan dry boring (bor kering).</p>');
gw = gw.replace('saya ingin konsultasi bore pile mini crane', 'saya ingin konsultasi bore pile mesin gawangan');
gw = gw.replace('alt="Alat bore pile mini crane"', 'alt="Alat bore pile mesin gawangan"');
gw = gw.replace('/assets/images/layanan/mini-crane/mini-crane-alat.webp', 'https://placehold.co/800x600/eeeeee/999999?text=Hero+Gawangan');

// 3. Spec Section Content
gw = gw.replace('<h2>Kondisi Tepat untuk Mini Crane</h2>', '<h2>Karakteristik Mesin Gawangan</h2>');
gw = gw.replace('<p>Mini Crane adalah pilihan terbaik untuk pekerjaan pondasi di dalam kota atau perumahan padat. Mesin ini tidak menimbulkan getaran besar seperti paku bumi (spun pile), sehingga aman untuk dinding tetangga.</p>', '<p>Gawangan adalah mesin bore pile dengan struktur seperti tripod atau gawang yang menggunakan winch besar. Alat ini sangat stabil dan cocok untuk berbagai kontur tanah.</p>');

// 4. Features List
// Feature 1
gw = gw.replace('<strong>Minim Getaran & Kerusakan</strong>', '<strong>Tenaga Pengeboran Besar</strong>');
gw = gw.replace('<p>Aman dikerjakan mepet tembok tetangga tanpa risiko dinding retak akibat getaran alat berat.</p>', '<p>Didukung oleh tarikan winch yang kuat, mampu menembus lapisan tanah keras atau cadas ringan dengan efisien.</p>');

// Feature 2
gw = gw.replace('<strong>Manuver Cepat di Area Sempit</strong>', '<strong>Struktur Penopang Stabil</strong>');
gw = gw.replace('<p>Mesin bisa berputar 360 derajat dan bermanuver di lahan yang terbatas, mempercepat proses pindah titik bor.</p>', '<p>Kaki-kaki penyangga dapat disesuaikan tinggi rendahnya dan dibantu tali penopang, sehingga alat tetap berdiri tegak di lahan miring.</p>');

// Feature 3
gw = gw.replace('<strong>Mampu Menembus Tanah Keras</strong>', '<strong>Fleksibilitas Metode</strong>');
gw = gw.replace('<p>Menggunakan sistem wash boring (bor basah) untuk mengikis lapisan tanah keras yang tidak bisa ditembus alat manual.</p>', '<p>Dapat menggunakan sistem dry boring (bor kering) maupun wash boring (bor basah) menyesuaikan dengan jenis lapisan tanah di lokasi.</p>');

// 5. Specs Table
// Kedalaman Maksimal
gw = gw.replace('<strong>Sampai 30 Meter <br><small style="font-weight: normal; color: var(--color-text-muted);">(Efektif 20-26m, tergantung jenis tanah, diamte)</small></strong>', '<strong>~ 40 Meter</strong>');
// Diameter
gw = gw.replace('<strong>30, 40, 50, 60, 80 cm <br><small style="font-weight: normal; color: var(--color-text-muted);">(Tidak sedia ukuran 70cm)</small></strong>', '<strong>30, 40, 60, 80 cm</strong>');
// Metode
gw = gw.replace('<strong>Wash Boring &amp; Dry Boring</strong>', '<strong>Wash Boring / Dry</strong>');
// Akses
gw = gw.replace('<strong>Lebar Jalan 3 Meter <br><small style="font-weight: normal; color: var(--color-text-muted);">(Untuk akses mobilisasi truk CDD)</small></strong>', '<strong>2.5 Meter</strong>');
// Min Order
gw = gw.replace('<strong>200 Meter Lari (m&sup1;)</strong>', '<strong>200 Meter Lari (m&sup1;)</strong>');
// Button
gw = gw.replace('saya mau tanya harga bore pile mini crane', 'saya mau tanya harga bore pile mesin gawangan');

// 6. Gallery Section
gw = gw.replace('<h2>Dokumentasi Proyek</h2>', '<h2>Dokumentasi Proyek</h2>');
gw = gw.replace('<p>Foto langsung dari lokasi pengerjaan bore pile mini crane oleh Aseven Pile.</p>', '<p>Foto langsung dari lokasi pengerjaan bore pile mesin gawangan oleh Aseven Pile.</p>');

gw = gw.replace(/\/assets\/images\/layanan\/mini-crane\/mc-gudang.webp/g, 'https://placehold.co/800x600/eeeeee/999999?text=Gawangan+1');
gw = gw.replace('Proyek bore pile mini crane', 'Proyek bore pile mesin gawangan 1');

gw = gw.replace(/\/assets\/images\/layanan\/mini-crane\/mc-sempit.webp/g, 'https://placehold.co/800x600/eeeeee/999999?text=Gawangan+2');
gw = gw.replace('Mini crane di lokasi sempit', 'Proyek bore pile mesin gawangan 2');

gw = gw.replace(/\/assets\/images\/layanan\/mini-crane\/mc-rig-2.webp/g, 'https://placehold.co/800x600/eeeeee/999999?text=Gawangan+3');
gw = gw.replace('Mesin mini crane', 'Proyek bore pile mesin gawangan 3');

gw = gw.replace(/\/assets\/images\/layanan\/mini-crane\/mc-air-abu.webp/g, 'https://placehold.co/800x600/eeeeee/999999?text=Gawangan+4');
gw = gw.replace('Proses wash boring', 'Proyek bore pile mesin gawangan 4');

gw = gw.replace(/\/assets\/images\/layanan\/mini-crane\/mc-air-coklat.webp/g, 'https://placehold.co/800x600/eeeeee/999999?text=Gawangan+5');
gw = gw.replace('Lubang bore pile', 'Proyek bore pile mesin gawangan 5');

// 7. Bottom CTA
gw = gw.replace('<h2>Butuh Bore Pile Mini Crane?</h2>', '<h2>Butuh Bore Pile Mesin Gawangan?</h2>');
gw = gw.replace('konsultasi bore pile mini crane untuk proyek saya', 'konsultasi bore pile mesin gawangan untuk proyek saya');

fs.writeFileSync('src/pages/layanan/bore-pile-mesin/gawangan.astro', gw);
