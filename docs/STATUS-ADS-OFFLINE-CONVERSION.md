# Status Google Ads dan Offline Conversion

Catatan ini merangkum pemeriksaan bersama pemilik pada 10 November 2026. Tujuannya agar status yang sudah terlihat tidak tercampur dengan langkah yang masih perlu dilakukan. Tidak ada data pelanggan, GCLID, ID akun, ID Sheet, atau URL deployment yang dicatat di sini.

## Ringkasan singkat

- Auto-tagging Google Ads terlihat **Ya/aktif**.
- Google Analytics 4 terlihat terhubung di Pengelola Data.
- Website telah mengirim event uji `CLICK_WA` ke Google Sheet dan event tersebut terlihat di dashboard privat.
- Tindakan konversi offline bernama **`offline (Upload)`** telah dibuat di Google Ads.
- Screenshot Project Settings project Apps Script **Dashboard** mengonfirmasi Script Property `CONVERSION_ACTION` berisi nama persis `offline (Upload)`.
- Tindakan offline tersebut terlihat berstatus **Salah dikonfigurasi**. Sumber data offline dilewati saat penyiapan dan belum disambungkan.
- **Belum ada campaign/iklan yang dibuat atau dijalankan**, belum ada klik iklan nyata yang diuji, dan belum ada file konversi offline yang diimpor serta dikonfirmasi diterima Google Ads.

Kesimpulan: fondasi awal sudah ada, tetapi **offline conversion belum siap digunakan untuk bidding atau dilaporkan sebagai sudah teruji**.

## Yang sudah diperiksa

### Akun dan tag

- [x] Pada Setelan akun, `Pemberian tag otomatis` terlihat **Ya**.
- [x] Zona waktu akun yang terlihat adalah **Waktu Indonesia Barat (GMT+07:00)**.
- [x] Di Pengelola Data, Google Analytics (GA4) terlihat terhubung.
- [x] Tag Google `asevenpile.com` terlihat berstatus **Baik**.
- [ ] Tag lain bernama `Aseven Pile` terlihat **Tidak ada data**. Belum dipastikan apakah tag ini memang diperlukan atau tag lama; jangan dihapus tanpa pemeriksaan.

### Tindakan konversi

- [x] Tindakan website **WhatsApp** sudah ada. Sumber konversinya `Situs`; ini mengukur interaksi website, bukan impor DP/proyek.
- [x] Alur pembuatan tindakan offline baru dimulai dengan kategori **Lead yang berkonversi**.
- [x] Nama tindakan yang terlihat adalah **`offline (Upload)`**.
- [x] Pada pengaturan yang ditampilkan, hitungan dipilih **Satu**, nilai dipilih **berbeda untuk setiap konversi**, mata uang **IDR**, nilai default **1**, periode konversi klik-tayang **90 hari**, dan periode konversi penayangan tak dilewati **3 hari**.
- [x] Saat sumber data offline ditawarkan, pemilik memilih **Lewati langkah ini dan siapkan sumber data nanti**.
- [x] Google Ads mengonfirmasi satu tindakan konversi baru dibuat.
- [ ] Daftar konversi kemudian menampilkan tindakan `offline (Upload)` berstatus **Salah dikonfigurasi** dan belum ada konversi.
- [ ] Sumber data offline/Data Manager belum disambungkan atau diuji.

Nilai default `1` bukan nilai DP/proyek. Nilai transaksi nyata seharusnya disediakan oleh data impor apabila format dan sumber impor yang dipakai mendukungnya.

## Uji website dan dashboard

- [x] Pemilik melihat baris `CLICK_WA` di tab `Events` pada Google Sheet setelah menekan tombol WhatsApp.
- [x] Baris event website terlihat di dashboard privat dengan indikator `LIVE · EVENT & CRM`.
- [x] Event `CLICK_WA` hanya membuktikan tombol WhatsApp ditekan; tidak membuktikan pesan dikirim atau percakapan terjadi.
- [ ] Pada screenshot dashboard, satu baris tersebut diklasifikasikan sebagai `Direct`, sementara KPI `Klik WA` terlihat 0. Angka KPI dan filter perlu diperiksa sebelum dipakai sebagai laporan.
- [ ] Kunjungan SEO dilaporkan pemilik sudah muncul di Sheet, tetapi belum terlihat sebagai event SEO pada screenshot dashboard. Kode klasifikasi saat ini memakai `utm_medium=organic` dan belum mengandalkan referrer, sehingga trafik organik tanpa UTM dapat masuk sebagai Direct.
- [ ] Belum ada klik Ads nyata untuk membuktikan GCLID tersimpan pada event `LANDING` dan `CLICK_WA`.

## Catatan penting sebelum deploy website

Situs produksi yang diperiksa memiliki endpoint penerima event. Namun, pada source lokal yang sedang diperiksa, `gclidEventEndpoint` di `src/data/site.config.ts` kosong. **Jangan deploy ulang source ini sebelum konfigurasi produksi dicocokkan**, karena event website dapat berhenti dikirim.

## Yang belum dilakukan

- [ ] Belum ada campaign atau iklan Google Ads yang dibuat/dijalankan.
- [ ] Belum ada klik iklan sungguhan atau GCLID Ads yang diuji.
- [x] Screenshot Project Settings mengonfirmasi `CONVERSION_ACTION` tersimpan pada project Apps Script Dashboard dengan nilai persis `offline (Upload)`.
- [ ] Belum diuji melalui ekspor dan impor konversi nyata bahwa Google Ads menerima nama tindakan tersebut.
- [ ] Belum dipastikan apakah jalur impor yang akan digunakan mendukung CSV konversi awal dan pembaruan nilai (`RESTATE`) yang dikeluarkan dashboard.
- [ ] Belum ada file CSV offline yang diunggah.
- [ ] Belum ada bukti status impor **berhasil/diterima** di Google Ads.
- [ ] Belum diuji apakah pembaruan nilai final proyek dapat diterapkan ke transaksi konversi yang sama tanpa membuat konversi hitungan kedua.
- [ ] Di Ringkasan akun sebelumnya terlihat dua rekomendasi verifikasi pengiklan. Status dan dampaknya terhadap kelayakan campaign perlu ditinjau sebelum peluncuran; jangan membagikan dokumen verifikasi atau data sensitif di chat.

## Langkah berikutnya

Kerjakan satu per satu. Jangan mengklik iklan sendiri untuk menguji GCLID dan jangan mengunggah data pelanggan hanya untuk percobaan.

### 1. Pastikan tindakan konversi dan metode impor

- [ ] Buka **Sasaran → Konversi → Semua konversi** dan pastikan tindakan `offline (Upload)` masih ada.
- [ ] Buka **Alat → Pengelola Data** atau **Sasaran → Konversi → Upload** untuk melihat koneksi offline yang tersedia pada akun.
- [ ] Sebelum memilih koneksi, pastikan metode tersebut mendukung sumber data yang akan dipakai dan format konversi/penyesuaian yang diperlukan. Jika belum jelas, berhenti dan cek dokumentasi Google Ads untuk metode yang tampil.
- [ ] Jangan menganggap tindakan sudah siap hanya karena berhasil dibuat. Status **Salah dikonfigurasi** harus diselesaikan sesuai langkah yang ditampilkan Google Ads.

### 2. Cocokkan konfigurasi dashboard

- [x] Screenshot mengonfirmasi Script Property `CONVERSION_ACTION` berada di project Dashboard (bukan Event Receiver) dan bernilai `offline (Upload)`.
- [ ] Verifikasi melalui impor nyata bahwa nama tindakan dan format data diterima Google Ads. Perubahan Script Properties tidak memerlukan edit kode; jangan tekan Deploy hanya untuk mengatur property.
- [ ] Pastikan property `SHEET_ID` pada dashboard dan penerima event merujuk ke Sheet yang sama, serta `OWNER_EMAIL` tetap membatasi dashboard kepada pemilik.
- [ ] Jangan menaruh URL endpoint, Sheet ID, token, GCLID, atau data pelanggan dalam dokumen publik atau source code.

### 3. Verifikasi format dan alur impor

- [ ] Cocokkan header CSV konversi awal yang diekspor dashboard dengan format yang diterima metode impor Google Ads yang dipilih.
- [ ] Cocokkan metode pembaruan `RESTATE` berdasarkan `Order ID`, conversion action, waktu, nilai, dan mata uang. Jangan mengimpor baris `RESTATE` sebagai konversi baru.
- [ ] Jika metode impor yang tersedia tidak mendukung format atau pembaruan tersebut, jangan unggah. Perbaiki alur dashboard/metode impor terlebih dahulu.
- [ ] Saat ada data bisnis nyata yang sah, gunakan klik iklan dan GCLID asli, lead yang benar-benar tertaut, serta timestamp/nilai DP yang sebenarnya.
- [ ] Setelah impor, periksa hasil pemrosesan Google Ads. Status di dashboard yang hanya mencatat tindakan operator bukan bukti Google menerima data.

### 4. Baru siapkan campaign

- [ ] Tinjau penagihan, verifikasi pengiklan, lokasi target, anggaran, kata kunci, halaman tujuan, dan kebijakan iklan.
- [ ] Jika campaign diluncurkan sebelum ada cukup konversi offline, jangan menganggap tindakan offline yang belum diuji sebagai sinyal bidding yang valid.
- [ ] Jangan mengoptimalkan ke klik WhatsApp seolah-olah itu DP atau pelanggan yang sudah closing.

### 5. Perbaikan dashboard SEO dan metrik lain

- [ ] Perbaiki klasifikasi sumber Log Trafik agar referrer mesin pencari yang tersedia dapat dikenali sebagai SEO; bila sumber tidak jelas, tetap tampilkan Direct/Unknown.
- [ ] Betulkan KPI `Klik WA` dan validasi filter Semua/SEO/Google Ads dengan event yang sama.
- [ ] Tab SEO saat ini masih berstatus `PREVIEW DATA`. Rencanakan sumber live secara terpisah: Search Console untuk klik/impresi/CTR/posisi; GA4 untuk sesi/landing page/perilaku; Sheet/CRM untuk event dan hasil lead.
- [ ] Jangan menghapus label preview sampai rentang tanggal, definisi metrik, waktu pembaruan, dan hasil rekonsiliasi dengan sumber asli sudah benar.
- [ ] Ads spend, metrik Konten, Armada, dan Overview yang belum memiliki sumber live harus tetap diberi label preview.

## Kriteria selesai untuk offline conversion

Offline conversion baru boleh disebut teruji setelah:

1. Auto-tagging aktif dan klik Ads nyata menghasilkan GCLID yang tersimpan dengan benar.
2. Lead sungguhan tertaut ke event WhatsApp/GCLID yang benar.
3. Dashboard menyiapkan file dengan nama tindakan, waktu, ID transaksi, nilai, dan mata uang yang cocok.
4. Google Ads menerima impor dan menampilkan status pemrosesan yang berhasil.
5. Jika nilai final proyek diperbarui, metode yang dipakai menerima penyesuaian pada transaksi yang sama tanpa menghitung konversi baru.

## Referensi

- [Panduan dashboard GCLID](./Google-Ads-GCLID-Tutorial.md)
- [Roadmap dashboard SEO, Ads, dan data operasional](./ROADMAP-DASHBOARD-SEO.md)
- [Desain dashboard GCLID dan offline conversion](./superpowers/specs/2026-11-09-google-ads-gclid-dashboard-design.md)
- Properti Google Ads: [Tentang pemberian tag otomatis](https://support.google.com/google-ads/answer/3095550?hl=id)
- Bantuan Google Ads: [Menyiapkan konversi offline menggunakan GCLID](https://support.google.com/google-ads/answer/7012522?hl=id)
