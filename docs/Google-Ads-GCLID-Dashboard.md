# Panduan Operasional Dashboard GCLID ASeven Pile

Panduan ini menjelaskan fungsi dashboard, cara memasukkan prospek dan transaksi, serta cara mengirim konversi DP dan nilai proyek final ke Google Ads. Panduan ditujukan untuk pemilik yang mengoperasikan dashboard dan impor secara manual.

> **Status penting per 9 November 2026:** dashboard privat dan Google Sheet sudah disiapkan, dan perubahan website sudah dikirim ke GitHub. Namun, pada pemeriksaan terakhir, event GCLID dari website live belum terkonfirmasi masuk ke tab `Events`. Jangan menganggap pelacakan aktif hanya karena deployment Cloudflare berstatus berhasil. Pastikan ada baris event nyata di Sheet sebelum menggunakan data untuk Google Ads.

## 1. Gambaran sistem

Alur datanya terpisah menjadi empat bagian:

1. **Website ASeven Pile** menangkap GCLID/UTM dari URL landing yang benar-benar dibuka dan mencatat event seperti landing atau klik WhatsApp/telepon.
2. **Penerima event Apps Script publik** memvalidasi payload, mencegah event yang sama masuk dua kali, lalu menambahkan baris ke Sheet. Penerima ini hanya menerima dan mencatat event; ia tidak menyediakan akses baca dashboard atau membuat prospek otomatis.
3. **Google Sheets** menjadi sumber data bersama. Tab `Events` menampung event website, `Leads` menampung CRM dan status konversi, sedangkan `Audit` mencatat tindakan operator.
4. **Dashboard Apps Script privat** hanya boleh dibuka oleh akun pemilik. Dashboard membaca event dan prospek dari Sheet, mencocokkan klik WhatsApp ke prospek secara manual, lalu menyiapkan file konversi untuk diimpor ke Google Ads.

Penerima event dan dashboard harus tetap menjadi **dua proyek Apps Script berbeda**. URL penerima boleh dipakai website untuk mengirim event, tetapi Sheet ID, data prospek, dan akses dashboard tidak boleh dipublikasikan.

### Yang live dan yang masih preview

- **Live ketika koneksi sudah terbukti:** event website di `Events`, prospek CRM di `Leads`, pencocokan event–lead, audit, serta daftar CSV konversi yang disiapkan.
- **Bukan laporan Ads live:** spend, impressions, klik iklan dari Google Ads, CPA, ROAS, dan metrik pada tab SEO, Konten, Armada, serta ringkasan yang sumber datanya belum disambungkan. Label `PREVIEW DATA` berarti angkanya bukan hasil sinkronisasi Google Ads.
- Dashboard **tidak** mengimpor CSV ke Google Ads secara otomatis dan tidak dapat membaca hasil penerimaan Google. Operator mengunduh, mengunggah, memeriksa hasil, lalu mencatat impor manual di dashboard.

## 2. Arti tab dashboard

Dashboard memiliki tujuh bagian navigasi:

| Tab | Fungsi |
|---|---|
| **Google Ads** | Area ringkasan Ads dan daftar konversi offline yang menunggu tindakan. Metrik spend dan performa yang berlabel `PREVIEW DATA` bukan laporan Ads live. |
| **SEO** | Ringkasan SEO; status saat ini preview/demo, bukan data analitik tersambung. |
| **Konten** | Roadmap dan status halaman; bukan pelaporan performa live. |
| **CRM** | Pipeline prospek, detail lead, hubungan ke event WhatsApp, nilai proyek, DP, dan aksi konversi. |
| **Armada** | Tampilan operasional; angka dan status yang belum berasal dari sumber live adalah preview/demo. |
| **Log Trafik** | Daftar event yang diterima website beserta GCLID/UTM jika tersedia. |
| **Ringkasan** | Ikhtisar bisnis; bedakan data live CRM/event dari metrik preview. |

Filter tanggal dan tombol ekspor tabel tidak mengubah sumber data. Untuk impor Google Ads, gunakan CSV pada **daftar konversi tertunda** di dashboard, bukan ekspor laporan umum yang berlabel preview.

## 3. Menyiapkan akun Google Ads

Sebelum mencatat DP:

1. Buat atau tentukan **conversion action untuk konversi offline dari klik iklan** di akun Google Ads.
2. Simpan nama conversion action dengan ejaan dan kapitalisasi yang persis sama. Nilai ini harus sama dengan Script Property `CONVERSION_ACTION` di proyek dashboard.
3. Pastikan conversion action menggunakan sumber/jenis impor yang sesuai untuk data GCLID dan memiliki mata uang yang benar, yaitu `IDR`.
4. Tentukan apakah action akan menjadi **Primary** atau **Secondary**:
   - **Primary** masuk ke kolom `Conversions` dan dapat dipakai untuk bidding bila goal yang memuatnya dipakai kampanye.
   - **Secondary** umumnya hanya untuk observasi di `All conversions` dan tidak dipakai untuk bidding pada goal standar.
5. Untuk mengizinkan Smart Bidding memakai sinyal DP, conversion action DP harus Primary dan termasuk goal yang dipakai kampanye. Jangan ubah pengaturan bidding/goal sebelum memastikan tracking, nilai, serta impor berjalan benar.

Nama action, sumber konversi, zona waktu akun, dan mata uang harus konsisten. Perubahan nama conversion action setelah konversi awal diimpor dapat mengganggu pencocokan RESTATE.

Panduan Google tentang status Primary/Secondary: [About primary and secondary conversion actions](https://support.google.com/google-ads/answer/11461796?hl=en).

## 4. Alur kerja harian di CRM

### A. Pastikan event masuk

1. Buka dashboard Apps Script privat menggunakan akun Google pemilik yang diizinkan.
2. Pilih tab **Log Trafik** dan cari event `CLICK_WA` yang sesuai dengan waktu dan halaman prospek.
3. Pastikan GCLID terlihat sebagai nilai nyata jika prospek datang dari klik Google Ads. Jangan mengarang atau mengetik GCLID contoh.
4. Klik WhatsApp hanya mencatat bahwa seseorang menekan tombol. Event itu bukan bukti bahwa pesan benar-benar terkirim, prospek memenuhi syarat, atau transaksi terjadi.

Event tanpa GCLID tetap berguna untuk catatan trafik dan CRM, tetapi tidak dapat dipakai untuk impor konversi offline berbasis GCLID.

### B. Buat prospek dan cocokkan event

1. Buka tab **CRM**, lalu buat prospek baru atau buka prospek yang sudah ada.
2. Isi nama, nomor telepon, layanan, lokasi proyek, sumber, status, dan catatan secukupnya. Prospek tetap boleh disimpan meski GCLID belum ada.
3. Pada detail prospek, gunakan pilihan untuk mencocokkan event `CLICK_WA` yang benar. Pencocokan dilakukan manual oleh pemilik; sistem tidak menebak berdasarkan nomor telepon.
4. Periksa kembali bahwa GCLID pada prospek berasal dari event yang benar. IP hanya informasi internal dan bukan pengenal konversi.
5. Isi **Total Nilai Proyek / Omset Closing** langsung dengan angka rupiah, misalnya `45000000`. Kolom ini tidak membutuhkan rincian kalkulator.
6. Bagian **Kalkulator Rincian & Biaya Tambahan** boleh dibuka jika membantu estimasi. Pilih rincian yang relevan lalu tekan **Terapkan ke Total**; jika dilewati, total yang diketik manual tetap menjadi nilai proyek.
7. Tekan **Simpan Perubahan**.

Nominal yang dimasukkan ke CRM adalah catatan nilai proyek/closing. Konversi DP memakai nominal DP yang benar-benar diterima. Nilai proyek final baru dikirim sebagai penyesuaian ketika proyek selesai.

### C. Catat DP yang benar-benar diterima

1. Setelah uang muka diterima, buka detail lead.
2. Isi nominal DP aktual, bukan persentase perkiraan. Isi waktu DP benar-benar diterima, bukan waktu mengisi dashboard.
3. Ubah status proyek menjadi **DP Masuk**, lalu simpan.
4. Untuk lead ber-GCLID nyata yang sudah ditautkan, dashboard membuat satu aksi konversi awal berisi GCLID, conversion action, nilai DP, waktu DP, mata uang `IDR`, dan Order ID unik.
5. Buka daftar konversi tertunda. Pastikan lead, jumlah DP, waktu, conversion action, dan Order ID benar sebelum mengunduh CSV.

Jika DP sudah tercatat, dashboard tidak mengizinkan perubahan diam-diam atas nilai atau waktu DP awal. Tinjau data dan riwayat konversi sebelum memperbaiki kesalahan agar tidak menghasilkan impor duplikat atau konversi yang tidak dapat dicocokkan.

### D. Catat penyelesaian dan nilai final

1. Saat proyek benar-benar selesai, buka lead dan pastikan **Total Nilai Proyek / Omset Closing** menunjukkan nilai final yang disepakati.
2. Ubah status menjadi **Selesai** dan isi waktu penyelesaian yang sebenarnya.
3. Simpan. Jika DP awal telah dibuat, dashboard menyiapkan aksi **Update nilai final (RESTATE)** dengan conversion action dan Order ID yang sama. Nilai final menggantikan nilai konversi awal untuk pelaporan nilai; ini bukan konversi kedua.
4. Jika DP tidak pernah dicatat, penyelesaian proyek akan menjadi satu konversi awal dengan nilai proyek final.
5. Jika aksi berstatus **DIBLOKIR**, jangan ekspor atau mengimpornya sebagai konversi baru. Periksa alasan pemblokiran dan tanggal transaksi.

Dashboard memakai batas internal konservatif **54 hari** untuk menolak update final yang terlalu lambat. Google dapat mempunyai aturan/kelayakan lain menurut jenis konversi dan metode impor; cek bantuan Google Ads sebelum mengoperasikan kasus yang melewati batas.

## 5. Dari dashboard ke Google Ads

### Impor konversi awal DP

1. Di dashboard, buka daftar konversi tertunda dan pilih aksi **Konversi awal · DP diterima**.
2. Unduh CSV dan periksa kolom berikut:

   `Google Click ID`, `Conversion Name`, `Conversion Time`, `Conversion Value`, `Conversion Currency`, `Order ID`

3. Di Google Ads, buka **Goals → Conversions → Uploads** atau alur impor yang tersedia pada akun. Pilih template/format konversi offline yang menerima GCLID. Tampilan Google Ads dapat berubah; ikuti petunjuk impor resmi yang berlaku pada akun.
4. Unggah file konversi awal tersebut. Jangan mencampur baris konversi baru dan baris penyesuaian dalam file yang sama.
5. Baca hasil pemrosesan Google Ads. Pastikan file diterima dan catat kesalahan bila ada.
6. **Hanya setelah impor berhasil**, kembali ke dashboard dan tekan **Tandai sudah diimpor manual** untuk aksi tersebut.

### Impor RESTATE nilai final

1. Setelah pekerjaan selesai, unduh aksi **Update nilai final (RESTATE)** yang baru muncul.
2. Periksa bahwa Order ID dan Conversion Name identik dengan konversi DP awal; Adjustment Time adalah waktu update yang valid; nilai adalah nilai final; mata uang `IDR`.
3. Impor CSV penyesuaian secara terpisah dari konversi awal. Header yang digunakan:

   `Order ID`, `Conversion Name`, `Adjustment Time`, `Adjustment Type`, `Adjusted Value`, `Adjusted Value Currency`

   Untuk update ini, `Adjustment Type` harus `RESTATE`.

4. Periksa hasil pemrosesan Google Ads. Setelah berhasil, tandai aksi sebagai sudah diimpor manual.
5. Dashboard hanya mencatat bahwa operator menandai tindakan tersebut. Status `PREPARED_BY_OWNER` **bukan** bukti bahwa Google Ads menerima file.

Google mensyaratkan Order ID yang sama dan nama conversion action yang cocok untuk pencocokan adjustment. Penyesuaian harus terjadi setelah konversi awal dan sebelum file diunggah. Google juga memperingatkan bahwa penyesuaian terlalu cepat setelah klik iklan mungkin belum menemukan konversi yang tercatat; periksa diagnosis impor dan panduan akun bila baru saja mengunggah konversi awal.

Dokumentasi resmi:

- [About conversion adjustments](https://support.google.com/google-ads/answer/7686447?hl=en)
- [How to adjust your conversions](https://support.google.com/google-ads/answer/7686280?hl=en)

### Apa yang dilakukan tombol “Tandai sudah diimpor manual”

Tombol tersebut hanya mengubah status aksi di database dashboard dan menulis audit. Ia tidak mengirim CSV ke Google, tidak memeriksa hasil unggahan, dan tidak bisa memastikan konversi tampil di laporan. Jangan tekan tombol sebelum memastikan hasil impor Google Ads.

Jangan unduh dan impor ulang aksi yang sudah berhasil diproses kecuali sedang melakukan pemulihan yang disengaja. Jika impor gagal, baca pesan kesalahan Google sebelum mencoba lagi.

## 6. DP, nilai final, dan Smart Bidding

Alur ini sengaja memakai **satu transaksi per proyek**:

```text
Klik Google Ads dengan GCLID
  → prospek benar-benar masuk
  → DP diterima: impor satu konversi awal (nilai = nominal DP)
  → proyek selesai: RESTATE konversi yang sama (nilai = nilai proyek final)
```

Contoh: DP yang benar-benar diterima Rp13.500.000, kemudian proyek selesai dengan nilai final Rp45.000.000. Google Ads mula-mula menerima satu konversi senilai Rp13.500.000. Setelah RESTATE berhasil, nilai konversi itu diperbarui menjadi Rp45.000.000. **Jumlah konversi tetap satu**, bukan dua.

Implikasi bidding:

- **Maximize conversions / Target CPA:** Smart Bidding mengoptimalkan jumlah konversi utama. RESTATE memperbarui nilai konversi, tetapi tidak menambah atau mengurangi hitungan konversi, sehingga tidak memperbaiki CPA dengan mengubah jumlah konversi.
- **Maximize conversion value / Target ROAS:** strategi berbasis nilai menggunakan nilai konversi yang dilaporkan. Nilai awal DP menjadi sinyal nilai sementara; setelah RESTATE diterima, nilai konversi menjadi nilai proyek final dan dapat memengaruhi nilai konversi/ROAS yang dilaporkan.
- **Secondary conversion action:** biasanya untuk observasi dan tidak menjadi sinyal bidding standar. Jika tujuan memang agar Smart Bidding memakai konversi DP, pastikan action Primary serta goal tersebut dipakai kampanye.
- Mengubah strategi bidding tidak otomatis membuat data cukup atau hasil lebih baik. Strategi nilai memerlukan data nilai yang konsisten dan volume yang memadai menurut jenis kampanye. Ikuti persyaratan/kelayakan yang ditampilkan Google Ads untuk akun dan kampanye Anda.
- Gunakan nilai yang benar-benar terjadi dan timestamp yang benar. Jangan mengirim angka contoh, nilai penawaran yang belum disetujui, atau GCLID buatan sebagai data konversi.

Untuk bisnis dengan siklus proyek panjang, nilai DP adalah sinyal yang lebih cepat, sedangkan nilai proyek final baru tersedia kemudian. RESTATE mempertahankan satu konversi tetapi memperbaiki nilai historisnya. Google menyatakan RESTATE memengaruhi kolom nilai konversi dan strategi bidding berbasis ROAS, bukan jumlah konversi.

Referensi Google:

- [About Maximize conversion value bidding](https://support.google.com/google-ads/answer/7684216?hl=en)
- [About Target ROAS bidding](https://support.google.com/google-ads/answer/6268637?hl=en)
- [About primary and secondary conversion actions](https://support.google.com/google-ads/answer/11461796?hl=en)
- [About conversion adjustments](https://support.google.com/google-ads/answer/7686447?hl=en)

## 7. Data yang disimpan dan keamanan

Sheet memakai tiga tab operasional:

- **`Events`**: `eventId`, jenis event, timestamp, halaman, GCLID/UTM, referrer, device, status penautan, dan kolom operasional lain. Event website yang sudah diterima bersifat append-only; dashboard mengelola tautan lead/status tanpa mengubah isi event asal.
- **`Leads`**: ID lead, waktu dibuat, identitas dan kontak, layanan/lokasi/status, nilai proyek, sumber, event tertaut, GCLID, nilai/waktu DP, nilai/waktu penyelesaian, Order ID, conversion action, mata uang, status konversi, dan catatan.
- **`Audit`**: waktu, operator, jenis tindakan, record yang berubah, dan rincian tindakan.

Perlakukan Sheet sebagai data pelanggan privat. Batasi akses sesuai kebutuhan, jangan bagikan URL dashboard atau Sheet secara publik, dan tentukan retensi data untuk nomor telepon serta catatan prospek. Jangan menaruh Sheet ID, token, kredensial, data prospek, atau URL penerima pribadi di dokumen publik. IP bukan kunci pencocokan dan tidak dikirim sebagai pengenal Google Ads.

## 8. Pemeriksaan dan pemecahan masalah

| Gejala | Yang diperiksa |
|---|---|
| Tidak ada event baru di `Events` | Pastikan versi website live benar-benar memuat tracking, endpoint Apps Script aktif, dan `SHEET_ID` penerima menunjuk ke Sheet yang benar. Status Cloudflare `Success` saja tidak membuktikan event berhasil diterima. |
| `CLICK_WA` masuk tetapi GCLID kosong | Pengunjung mungkin tidak datang dari iklan ber-GCLID, GCLID tidak tersimpan saat kunjungan, atau website belum menjalankan tracking terbaru. Jangan menambahkan GCLID secara tebakan. |
| Lead tersimpan tapi tidak ada aksi Ads | Pastikan event WhatsApp sudah ditautkan, GCLID nyata tersedia, jumlah DP/nilai final lebih besar dari nol, timestamp valid, dan `CONVERSION_ACTION` disetel. |
| Dashboard menolak akses | Gunakan akun Google pemilik, periksa `OWNER_EMAIL`, izin deployment, dan bahwa dashboard tetap privat. |
| CSV awal gagal | Pastikan conversion action cocok persis, sumber impor menerima GCLID, waktu memakai zona waktu eksplisit, nilai positif, mata uang sesuai, dan GCLID asli. Baca rincian diagnosis Google. |
| RESTATE tidak menemukan transaksi | Pastikan konversi awal sudah tercatat/diterima, Order ID sama, Conversion Name sama, Adjustment Time sesudah waktu konversi, serta file adjustment diunggah terpisah. |
| Dashboard menunjukkan `PREPARED_BY_OWNER` | Itu hanya catatan operator, bukan status penerimaan Google. Periksa halaman hasil impor Google Ads. |
| Aksi `DIBLOKIR` | Dashboard menolak ekspor aksi tersebut karena urutan waktu atau batas penyesuaian internal. Jangan mengubahnya menjadi konversi baru untuk menghindari pemblokiran. |

## 9. Checklist sebelum mengandalkan Smart Bidding

- [ ] Dashboard privat dibuka dengan akun pemilik; penerima event tetap proyek terpisah.
- [ ] Event website nyata muncul di tab `Events`; GCLID berasal dari klik iklan sungguhan.
- [ ] Prospek cocok dengan event `CLICK_WA` yang tepat.
- [ ] Nilai DP dan waktu DP sesuai bukti pembayaran.
- [ ] Satu impor DP berhasil dan tidak diimpor dua kali.
- [ ] Saat proyek selesai, RESTATE memakai Conversion Name dan Order ID yang sama; bukan conversion baru.
- [ ] Hasil RESTATE diterima Google Ads dan nilai final tampil sesuai proses pelaporan Google.
- [ ] Conversion action yang diharapkan untuk bidding sudah Primary serta masuk goal kampanye yang benar.
- [ ] Smart Bidding memakai nilai konversi yang realistis; semua metrik yang berlabel `PREVIEW DATA` di dashboard tidak diperlakukan sebagai data Ads live.
- [ ] Pahami bahwa impor masih manual, pelaporan dapat tertunda, dan hasil bidding tidak dijamin oleh dashboard.
