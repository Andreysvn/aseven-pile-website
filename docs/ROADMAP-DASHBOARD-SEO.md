# Roadmap Dashboard: Ads, SEO, dan Data Operasional

Dokumen ini mencatat status integrasi dashboard dan urutan pekerjaan berikutnya. Tujuannya agar data yang tampil sebagai **LIVE** benar-benar berasal dari sumber yang sudah terhubung, sedangkan angka yang belum memiliki sumber tetap diberi label **PREVIEW DATA**.

Terakhir ditinjau: 10 November 2026

## Status saat ini

| Area | Status | Catatan |
|---|---|---|
| Event website ke Google Sheet | Terbukti sebagian | Pemilik melihat event `CLICK_WA` masuk ke tab `Events` dan dashboard. Ini membuktikan jalur event berjalan untuk klik yang diuji, bukan semua jenis kunjungan atau atribusi. |
| Kunjungan SEO di dashboard | Belum benar | Kunjungan yang berasal dari Google organik dapat tercatat, tetapi dashboard dapat melabelinya `Direct`. Kode saat ini hanya mengenali SEO dari `utm_medium=organic` dan belum memakai referrer. |
| GCLID dari klik Google Ads | Belum diuji | Jangan klik iklan sendiri. Tunggu klik iklan yang benar-benar berasal dari calon pelanggan dan periksa apakah GCLID tercatat tanpa membagikan nilainya. |
| Impor konversi offline ke Google Ads | Belum teruji | Kode dashboard dapat menyiapkan CSV DP dan pembaruan nilai final, tetapi belum ada bukti impor diterima Google Ads. Auto-tagging, conversion action, mata uang, dan alur impor akun masih perlu diverifikasi. |
| Statistik SEO di tab SEO | Preview | Dashboard menandai SEO sebagai `PREVIEW DATA`. Grafik, KPI, dan ranking halaman belum boleh dianggap laporan live dari Google. |
| Statistik Ads, Konten, dan Armada | Preview | Belum ada sumber data live untuk spend/impresi/klik Ads, metrik konten, dan armada. |

### Perhatian sebelum deploy website

Situs produksi yang diperiksa sudah mengirim event ke endpoint Apps Script, tetapi `gclidEventEndpoint` pada source lokal di `src/data/site.config.ts` masih kosong. Jangan deploy ulang dari source lokal sebelum konfigurasi produksi dicocokkan; jika tidak, pengiriman event dapat berhenti.

## Prioritas pekerjaan

### P0 — Selesaikan verifikasi Ads tanpa klik iklan sendiri

- [ ] Pemilik memastikan auto-tagging aktif di Google Ads.
- [ ] Pemilik memastikan conversion action offline yang benar tersedia, dengan nama, zona waktu, dan mata uang yang cocok dengan dashboard.
- [ ] Pastikan metode impor Google Ads mendukung format konversi awal serta penyesuaian nilai (`RESTATE`) yang dipakai dashboard.
- [ ] Saat ada klik Ads sungguhan dari calon pelanggan, cek secara privat bahwa landing dan klik WhatsApp terkait membawa GCLID yang sama.
- [ ] Saat ada prospek dan DP sungguhan, lakukan impor konversi sesuai panduan, lalu pastikan status hasil impor di Google Ads. Jangan tandai berhasil hanya karena CSV berhasil diunduh atau dashboard mencatat tindakan operator.
- [ ] Saat proyek selesai, pastikan pembaruan nilai memakai transaksi dan conversion action yang sama; jangan mengimpor `RESTATE` sebagai konversi baru.

**Selesai jika:** pemilik dapat menunjukkan status impor yang diterima Google Ads untuk konversi sungguhan. Jangan membuat klik, GCLID, prospek, atau transaksi palsu untuk memenuhi checklist.

Panduan operasional: [Google-Ads-GCLID-Tutorial.md](./Google-Ads-GCLID-Tutorial.md). Desain alur: [Google Ads GCLID dashboard design](./superpowers/specs/2026-11-09-google-ads-gclid-dashboard-design.md).

### P1 — Betulkan klasifikasi sumber pada Log Trafik

- [ ] Kenali referrer mesin pencari yang diketahui sebagai sinyal SEO ketika tersedia.
- [ ] Pertahankan UTM sebagai sinyal kampanye, dan GCLID sebagai sinyal Ads; jangan menimpa GCLID dengan tebakan berdasarkan referrer.
- [ ] Jika referrer kosong atau tidak cukup jelas, tampilkan `Direct / Unknown`, bukan mengklaim sumber SEO.
- [ ] Pastikan filter SEO menampilkan event organik yang terklasifikasi dan KPI sesuai dengan baris tabel.
- [ ] Tampilkan bahwa referrer tidak selalu dikirim browser dan kueri/kata kunci organik Google tidak dapat diandalkan dari referrer.

**Selesai jika:** event yang sama tidak dihitung ganda, filter sumber konsisten dengan label event, dan sumber yang tidak dapat diketahui tetap ditandai tidak diketahui.

### P2 — Ganti angka SEO preview dengan sumber data nyata

Tentukan dan dokumentasikan koneksi yang akan digunakan sebelum mengubah angka di dashboard:

- **Google Search Console:** klik organik, impresi, CTR, posisi rata-rata, halaman, dan kueri yang tersedia. Data kueri dapat dibatasi oleh Google; posisi rata-rata bukan urutan ranking pasti untuk setiap orang.
- **Google Analytics 4:** sesi/pengguna, landing page, sumber/medium, engagement, dan event konversi sesuai konfigurasi properti.
- **Event website dan CRM yang sudah terhubung:** catatan landing, klik WhatsApp/telepon, lead yang ditautkan, dan status DP/proyek. Ini adalah data operasional situs/CRM, bukan pengganti Search Console atau GA4.

Pekerjaan:

- [ ] Pemilik memastikan properti Search Console dan GA4 yang benar serta akses operator.
- [ ] Pilih metode koneksi yang aman dan dapat dipelihara (misalnya impor terjadwal ke Sheet atau integrasi resmi); jangan menaruh kredensial atau token pada kode publik.
- [ ] Tetapkan rentang tanggal, zona waktu, jadwal pembaruan, dan indikator kapan sinkronisasi terakhir berhasil.
- [ ] Pisahkan definisi metrik: Search Console untuk performa pencarian; GA4 untuk perilaku kunjungan; CRM untuk lead dan hasil bisnis.
- [ ] Tampilkan sumber dan waktu pembaruan data di tab SEO. Jika sinkronisasi gagal atau data belum tersedia, tampilkan error/status stale secara jelas dan jangan menggantinya dengan angka nol seolah-olah tidak ada trafik.
- [ ] Cocokkan sampel beberapa halaman dan rentang tanggal di dashboard dengan laporan sumber sebelum menghapus label `PREVIEW DATA`.
- [ ] Pisahkan SEO dari Direct/Unknown dan Google Ads. Jangan mengatribusikan lead SEO sebagai konversi Google Ads tanpa identitas klik Ads yang cocok.

**Selesai jika:** grafik trafik organik dan tabel landing page hanya memakai data yang cocok dengan sumbernya, tanggal dan definisi metrik jelas, serta data kosong/kedaluwarsa tidak terlihat seperti data live.

### P3 — Rapikan hubungan SEO, landing page, dan lead

- [ ] Tentukan cara menyimpan sumber dan landing page awal saat lead dibuat; jelaskan bahwa sumber dapat tidak diketahui atau hanya perkiraan.
- [ ] Buat laporan landing page SEO yang memisahkan kunjungan, klik kontak, lead CRM, DP, dan proyek selesai.
- [ ] Jangan menyamakan klik WhatsApp dengan percakapan, lead berkualitas, DP, atau closing.
- [ ] Tampilkan tingkat konversi hanya jika pembilang dan penyebut berasal dari periode, sumber, dan definisi yang konsisten.
- [ ] Jangan tampilkan kata kunci pencarian organik individual sebagai fakta jika data sumber tidak menyediakannya.

**Selesai jika:** setiap metrik dapat ditelusuri ke sumber dan definisinya, dan dashboard tidak mengklaim hubungan sebab-akibat yang tidak dibuktikan datanya.

### P4 — Maksimalkan tab dashboard lain secara bertahap

- [ ] **Ads:** hubungkan spend, impresi, klik, dan status kampanye dari sumber Ads yang terverifikasi; sampai tersedia, pertahankan label preview.
- [ ] **Konten:** tentukan sumber kebenaran status halaman/artikel dan ukur performa hanya dari Search Console/GA4 yang tersambung.
- [ ] **Armada:** tentukan sumber data operasional dan siapa yang memperbaruinya sebelum menampilkan angka live.
- [ ] **Overview:** rangkum hanya metrik yang sudah live, beri label sumber dan tanggal pembaruan, serta pertahankan label preview untuk sisanya.
- [ ] Jangan mengubah data demo menjadi klaim performa aktual hanya dengan mengganti label.

## Aturan aman untuk pengujian dan data

- Jangan klik iklan sendiri dan jangan membuat GCLID simulasi.
- Jangan menaruh URL webhook, ID Sheet, token, kontak pelanggan, IP, atau GCLID lengkap di dokumen publik, screenshot, atau repositori.
- Klik tombol WhatsApp hanya membuktikan niat klik; bukan bukti pesan terkirim atau percakapan terjadi.
- Catat waktu DP dan penyelesaian yang sebenarnya, bukan waktu ketika data dimasukkan.
- Pertahankan akses Sheet/dashboard terbatas dan tetapkan kebijakan retensi data operasional.

## Referensi implementasi

- Website mengirim event dan menyimpan atribusi: `src/scripts/main.js`, `src/scripts/gclid-attribution.js`
- URL endpoint website: `src/data/site.config.ts`
- Klasifikasi event dan sumber dashboard: `apps-script/dashboard/Code.gs` (`eventToDashboard_`)
- UI tab SEO dan label status data: `apps-script/dashboard/Index.html`
- Tutorial deploy dan penggunaan: [Google-Ads-GCLID-Tutorial.md](./Google-Ads-GCLID-Tutorial.md)
- Spesifikasi alur event dan konversi: [Google Ads GCLID dashboard design](./superpowers/specs/2026-11-09-google-ads-gclid-dashboard-design.md)

