# Panduan Dashboard GCLID ASeven Pile

Panduan ini menyiapkan pencatatan event website dan CRM privat berbasis Google Sheets. Angka spend, impressions, klik platform, bidding, SEO, Konten, dan Armada di dashboard tetap berlabel **PREVIEW DATA**; hanya event website dan CRM yang ditampilkan sebagai data live.

## 1. Siapkan Google Sheet

1. Buat satu Google Sheet baru di akun pemilik.
2. Salin ID dari URL Sheet, tetapi jangan menaruhnya di website, repositori, atau dokumen publik.
3. Biarkan proyek Apps Script membuat tab `Events`, `Leads`, dan `Audit` beserta header yang diperlukan. Jika membuat header secara manual, jangan mengubah nama atau urutannya.
4. Batasi akses Sheet hanya kepada pemilik dan operator yang memang berwenang. Sheet menyimpan informasi kontak, GCLID, alamat IP, dan catatan operasional.
5. Tetapkan masa retensi data yang sesuai kebutuhan dan kebijakan privasi; tinjau dan hapus data yang tidak lagi diperlukan secara berkala.

Jangan menghapus atau mengurutkan ulang kolom header. API akan menolak header yang tidak cocok agar data tidak tertulis ke kolom yang salah.

## 2. Deploy penerima event publik

1. Buat proyek Apps Script **terpisah** dari dashboard privat.
2. Salin `apps-script/event-ingest/Code.gs` dan `apps-script/event-ingest/appsscript.json` ke proyek tersebut.
3. Di **Project Settings → Script Properties**, tambahkan `SHEET_ID` dengan ID Sheet yang dibuat di atas.
4. Deploy sebagai **Web app**, pilih **Execute as: Me**, dan atur akses agar website dapat mengirim request tanpa login. Penerima ini hanya menyediakan `doPost`; ia tidak menyediakan API baca atau CRM.
5. Salin URL deployment `/exec` dan isi `gclidEventEndpoint` di `src/data/site.config.ts`. Biarkan kosong sampai deployment siap. Build dan deploy website setelah URL ditetapkan.
6. Jangan mengirim URL deployment bersama Sheet ID atau data pengguna ke pihak yang tidak berwenang. Jika URL perlu diganti, perbarui konfigurasi website dan deploy ulang.

Penerima hanya menerima jenis event yang diizinkan, menolak field tak dikenal, dan tidak membuat lead otomatis. GCLID harus berasal dari URL landing yang benar-benar diterima; sistem tidak membuat GCLID simulasi. Teks WhatsApp tidak ditambahi kode tracking.

## 3. Deploy dashboard privat

1. Buat proyek Apps Script **lain** untuk dashboard.
2. Salin `apps-script/dashboard/Code.gs`, `apps-script/dashboard/Index.html`, dan `apps-script/dashboard/appsscript.json`.
3. Di **Project Settings → Script Properties**, tambahkan:
   - `SHEET_ID`: ID Sheet yang sama dengan penerima event.
   - `OWNER_EMAIL`: alamat Google pemilik yang diizinkan membuka dashboard.
   - `CONVERSION_ACTION`: nama persis conversion action Google Ads yang akan menerima impor offline.
4. Deploy sebagai **Web app**, pilih **Execute as: User accessing the web app**, dan batasi akses hanya untuk akun pemilik.
5. Buka URL web app dengan akun pemilik dari laptop dan ponsel. Pastikan tampilan menunjukkan `LIVE · EVENT & CRM`; jika otorisasi gagal, periksa akun aktif, `OWNER_EMAIL`, dan pengaturan akses deployment. Jangan mengubah akses dashboard menjadi publik.

Inisialisasi hanya membuat tab atau header yang belum ada dan tidak menghapus baris lama. Dashboard menolak akses yang tidak cocok dengan `OWNER_EMAIL`. Sebelum penggunaan operasional, pastikan akun yang dipakai memberi identitas email yang dapat diverifikasi oleh Apps Script.

## 4. Alur event, lead, dan konversi

Contoh berikut memakai data fiktif:

1. Pengunjung mendarat pada URL Google Ads dengan GCLID nyata, lalu menekan tombol WhatsApp. Website mengirim event `CLICK_WA`; klik ini **bukan bukti** bahwa pesan benar-benar terkirim atau percakapan terjadi.
2. Setelah prospek benar-benar masuk, pemilik membuat lead CRM dan memilih event WhatsApp yang sesuai. Pencocokan dilakukan manual. IP hanya petunjuk internal dan tidak dipakai sebagai pengenal konversi.
3. Kolom **Total Nilai Proyek / Omset Closing** dapat diisi langsung, misalnya `45000000`. Rincian teknis dan kalkulator add-on bersifat opsional. Jika kalkulator dipakai, pilih biaya yang relevan lalu tekan **Terapkan ke Total**; jika dilewati, total yang diketik tetap dipakai.
4. Saat DP benar-benar diterima, isi nominal DP dan waktu DP yang sebenarnya, lalu simpan status `DP Masuk`. Dashboard menyiapkan satu konversi awal berisi nilai DP dan timestamp DP; Order ID dibuat stabil untuk lead tersebut.
5. Saat proyek selesai, simpan status `Selesai`, total nilai proyek final, dan waktu penyelesaian yang sebenarnya. Jika ada konversi DP awal, dashboard menyiapkan penyesuaian `RESTATE` memakai conversion action dan Order ID yang sama, bukan konversi hitungan kedua. Jika tidak ada DP yang dicatat, proyek selesai membuat satu konversi awal pada waktu penyelesaian.
6. Download CSV dari panel **Konversi Google Ads Offline**, lalu impor secara manual melalui alur Google Ads yang sesuai. Gunakan nama conversion action dan mata uang yang cocok dengan konfigurasi akun. Setelah impor manual, tombol konfirmasi hanya mencatat tindakan operator; dashboard tidak mengetahui apakah Google menerima atau menolak file.

Waktu klik website, waktu DP, dan waktu proyek selesai adalah tiga waktu berbeda. Gunakan waktu kejadian sebenarnya, bukan waktu ketika data baru dimasukkan. Update nilai final lebih awal dari konversi awal atau lebih dari 54 hari sesudahnya ditandai **DIBLOKIR** dan tidak memiliki tombol ekspor/konfirmasi. Tinjau status dan jendela penyesuaian Google Ads sebelum mencoba prosedur lain.

CSV penyesuaian memakai `Order ID`, `Conversion Name`, `Adjustment Time`, `Adjustment Type=RESTATE`, `Adjusted Value`, dan `Adjusted Value Currency`. Dokumentasi resmi:

- [About conversion adjustments](https://support.google.com/google-ads/answer/7686447?hl=en)
- [Upload offline conversion adjustments](https://support.google.com/google-ads/answer/7686280?hl=en)

Pastikan alur impor yang dipakai di akun mendukung penyesuaian nilai (restatement), serta conversion action dan Order ID dapat dicocokkan. Jangan mengimpor CSV RESTATE sebagai konversi baru. Jika Google menolak file, simpan detail penolakan di catatan operator dan selesaikan sesuai petunjuk Google Ads.

## 5. Periksa status dan pulihkan kegagalan

- **Event tidak muncul:** periksa URL deployment penerima di konfigurasi website, status deployment, dan `SHEET_ID` pada proyek event-ingest. Buat satu klik uji dari website; duplikat `eventId` sengaja tidak ditambahkan dua kali.
- **Dashboard menolak akses:** gunakan akun Google pemilik yang benar dan cocokkan dengan `OWNER_EMAIL`. Pastikan web app privat hanya tersedia untuk akun tersebut.
- **Event belum tertaut:** pilih prospek dan event `CLICK_WA` yang tepat secara manual. Event tanpa GCLID nyata tidak dapat membuat konversi Ads.
- **Konversi tidak tersedia:** periksa bahwa lead memiliki event tertaut dengan GCLID nyata, nominal DP/nilai final lebih besar dari nol, timestamp memiliki zona waktu, dan `CONVERSION_ACTION` sudah diatur.
- **Penyesuaian diblokir:** periksa urutan timestamp serta jendela maksimal 54 hari. Jangan mengunduh atau mengimpor update yang ditandai diblokir sebagai konversi baru.
- **Impor manual tertunda:** unduh ulang action yang masih `PENDING` hanya setelah memastikan action tersebut belum diimpor. Status `PREPARED_BY_OWNER` berarti operator mengonfirmasi tindakan manual; itu bukan bukti penerimaan Google.
- **Metrik selain event dan CRM:** nilai Ads spend, SEO, Konten, Armada, dan metrik terkait lainnya adalah data preview, bukan pelaporan live.

## 6. Checklist sebelum live

- [ ] Sheet privat dan masa retensi data ditetapkan.
- [ ] Penerima publik hanya menerima event dan menulis ke Sheet yang benar.
- [ ] Dashboard privat dibatasi kepada pemilik dan lolos uji buka dari ponsel serta laptop.
- [ ] GCLID event uji berasal dari klik nyata; tidak ada GCLID simulasi.
- [ ] Lead dapat ditautkan manual ke event yang benar.
- [ ] Nominal total proyek dapat diketik tanpa membuka kalkulator.
- [ ] Uji DP menghasilkan satu action awal; completion menghasilkan RESTATE dengan Order ID yang sama.
- [ ] Nama conversion action, zona waktu, mata uang, dan template CSV telah dicocokkan dengan akun Google Ads.
- [ ] Import dilakukan manual dan status dashboard tidak dianggap sebagai bukti Google menerima data.
