# Panduan Peluncuran Iklan Google Ads ASeven Pile
**SOP Pre-Flight, Strategi Bidding Anti-Boncos 2026, Roadmap Transisi Konversi, & Offline Conversion Tracking**

Dokumen ini adalah panduan praktis dan komprehensif untuk Mas Andrey sebelum menyalakan iklan Google Ads berbayar dan mengoperasikan sistem Offline Conversion ASeven Pile.

---

## 1. Filosofi & Strategi Bidding Anti-Boncos 2026

Di era digital marketing modern (2025/2026), banyak pengiklan yang mengalami **"boncos"** karena hanya mengandalkan satu metrik: **Klik WhatsApp**.

### Mengapa Mengandalkan "Klik WA Saja" Bisa Bikin Boncos?
Jika algoritma Google Ads disetel untuk memburu **Klik WhatsApp** sebagai Konversi Utama selamanya:
* AI Google akan mencari siapa saja yang gemar menekan tombol WhatsApp.
* Di lapangan, yang masuk ke WA Mas Andrey sering kali adalah:
  * Sales yang menawarkan oli, solar, alat berat, atau material.
  * Pencari kerja yang menanyakan lowongan operator bor atau kuli.
  * Kompetitor yang sekadar mengecek harga pasaran (*mystery shopper*).
  * Pemilik rumah dengan proyek sangat kecil (1–2 titik) yang tidak masuk nilai minimum borongan (*minimum order*).
* **Hasilnya:** Google merasa sukses ("Nih Mas Andrey, kami kirim 50 chat WA dengan biaya murah!"), padahal di rekening Mas Andrey tidak ada yang transfer DP sama sekali.

### Solusi Modern: Offline Conversion Tracking (OCT)
Dengan sistem Dashboard ASeven Pile:
1. Calon klien mengklik iklan $\rightarrow$ Sistem otomatis mengunci nomor identitas unik iklan (**GCLID**).
2. Klien menghubungi via WhatsApp, melakukan survei lokasi, lalu **Mentransfer DP Proyek (misal Rp 25.000.000 – Rp 50.000.000)**.
3. Mas Andrey mencatat deal tersebut di Dashboard dan menekan tombol **"Export CSV"**.
4. File CSV diunggah ke Google Ads.
5. **AI Google Ads belajar secara presisi:**  
   *"Ternyata profil orang seperti inilah yang benar-benar mentransfer puluhan juta rupiah ke ASeven Pile. Mulai sekarang, anggaran iklan diprioritaskan KHUSUS ke tipe orang seperti ini!"*

---

## 2. Roadmap Transisi 2 Fase (Dari Nol Menuju Offline Conversion)

Karena di hari pertama peluncuran iklan Mas Andrey **belum memiliki data historis closing di akun Google Ads**, kita menerapkan strategi transisi bertahap:

```
[Minggu 1 - 2: Fase Kumpul Data / Start]
• Bidding: Maximize Clicks (Batas Max CPC Rp 15.000 - Rp 25.000)
• Konversi Primer (Primary): Klik WhatsApp (generate_lead)
• Konversi Sekunder (Secondary): Scroll Depth 50% & Kunjungan Halaman
• Goal: Jaring klik pencari riil, kumpulkan bahan bakar data, filter kata kunci negatif.
                     ↓ 
       (Setelah terkumpul minimal 15 deal closing)
                     ↓ 
[Minggu 3+: Fase Anti-Boncos / Value-Based Bidding]
• Bidding: Maximize Conversion Value (Target ROAS)
• Konversi Primer (Primary): Deal Closing / DP Proyek (Offline Conversion via CSV)
• Konversi Sekunder (Secondary): Klik WhatsApp (Diturunkan agar AI tidak memburu sampah)
• Goal: Google HANYA memburu klien berduit yang berpotensi transfer DP puluhan juta.
```

### Tabel Status Konversi per Fase di Akun Google Ads Mas Andrey:

| Nama Konversi di Akun | Tipe / Event | Status di Fase 1 (Minggu 1-2) | Status di Fase 2 (Minggu 3+ setelah ada deal) |
| :--- | :--- | :--- | :--- |
| **WhatsApp** | `Kontak / Situs` (Website Event) | 🟢 **UTAMA (PRIMARY)** (Bahan bakar awal AI Google) | 🟡 **SEKUNDER (SECONDARY)** (Hanya observasi) |
| **offline (Upload)** | `Mengimpor dari klik` (CSV Dashboard) | 🟡 **SEKUNDER (SECONDARY)** (Menampung data transfer DP) | 🟢 **UTAMA (PRIMARY)** (Target penawaran utama Google) |
| **Scroll depth 50%** | `Tayangan halaman / Situs` | 🟡 **SEKUNDER (SECONDARY)** (Anti-boncos, observasi saja) | 🟡 **SEKUNDER (SECONDARY)** (Anti-boncos, observasi saja) |
| **Tayangan halaman** | `Tayangan halaman / Situs` | 🟡 **SEKUNDER (SECONDARY)** (Anti-boncos, observasi saja) | 🟡 **SEKUNDER (SECONDARY)** (Anti-boncos, observasi saja) |

---

## 3. Langkah Teknis di Akun Google Ads

### A. Konfigurasi Tindakan Konversi Offline (`offline (Upload)`)
Tindakan konversi ini sudah dibuat di akun Google Ads Mas Andrey dengan nama **`offline (Upload)`**:
* **Nama konversi:** `offline (Upload)`
* **Nilai (Value):** Pilih *Gunakan nilai yang berbeda untuk setiap konversi* (Use different values for each conversion), mata uang **IDR (Rp)**, nilai default isi `0`.
* **Pengoptimalan tindakan (Action optimization):**
  * Di **Fase 1 (Sekarang)**: Disetel sebagai **Tindakan sekunder (Secondary action)**.
  * Di **Fase 2 (Nanti setelah ada 15 deal)**: Cukup ubah menjadi **Tindakan utama (Primary action)**.

### B. Cara Mengunggah CSV Konversi dari Dashboard ASeven Pile
Setiap kali ada klien yang mentransfer DP atau melunasi proyek:
1. Buka **Dashboard ASeven Pile** di browser.
2. Buka tab **CRM Prospek** $\rightarrow$ klik prospek yang bersangkutan $\rightarrow$ pastikan total nilai proyek / DP sudah terisi dan GCLID sudah terhubung (klik tombol *"Ambil dari log"*).
3. Buka tab **Kinerja Google Ads** di Dashboard $\rightarrow$ klik tombol merah **`Export CSV`**.
4. File CSV resmi Google Ads akan otomatis terunduh ke komputer Mas Andrey.
5. Buka **Google Ads** $\rightarrow$ **Goals** $\rightarrow$ **Conversions** $\rightarrow$ **Uploads (Unggahan)**.
6. Klik tanda tambah biru (**+**) $\rightarrow$ pilih **Source: Upload a file** $\rightarrow$ pilih file CSV yang baru diunduh tadi $\rightarrow$ klik **Apply (Terapkan)**.
7. Dalam beberapa menit, Google Ads akan menampilkan status: *"Successful uploads"*.

---

## 4. Alur Kerja Harian Mas Andrey (SOP Lapangan)

Mas Andrey tidak perlu repot dengan hal rumit. SOP operasional sehari-hari sangat sederhana:

### Alur 1 Langkah (Paling Santai & Cepat — Rekomendasi):
* **Saat klien transfer DP 30% atau deal disepakati:**
  1. Buka drawer prospek di Dashboard ASeven Pile.
  2. Masukkan nama & nomor WA klien.
  3. Klik tombol **"Ambil dari log"** $\rightarrow$ sistem otomatis mengaitkan log trafik klik iklan Google Ads (`gclid`) milik klien tersebut.
  4. Masukkan total nilai proyek (misal `Rp 35.000.000`).
  5. Klik tombol **`100%`** (Status otomatis jadi Lunas/Selesai).
  6. Simpan $\rightarrow$ Klik tombol **"Export CSV"**.
  7. Unggah file CSV tersebut ke menu *Google Ads > Uploads* (cukup 1 minggu sekali atau tiap ada deal masuk).

---

## 5. Daftar Kata Kunci Target (High Buying Intent)

Gunakan jenis pencocokan **Phrase Match (`"..."`)** atau **Exact Match (`[...]`)**. Hindari *Broad Match* tanpa tanda petik di awal agar anggaran tidak boros.

### Kategori Bore Pile (Mesin & Mini Crane)
* `"jasa bore pile jakarta"`
* `"jasa bore pile tangerang"`
* `"jasa bore pile bekasi"`
* `"jasa bore pile depok"`
* `"jasa bore pile bogor"`
* `"harga bor pile per meter"`
* `"biaya borong bore pile"`
* `"kontraktor pondasi bore pile"`
* `"tukang bore pile mesin"`
* `"bore pile mini crane"`

### Kategori Strauss Pile (Manual)
* `"jasa strauss pile jakarta"`
* `"harga strauss pile per meter"`
* `"jasa bor manual strauss pile"`
* `"tukang strauss pile pondasi"`
* `"biaya pondasi strauss pile rumah"`

---

## 6. Daftar Kata Kunci Negatif Wajib (Negative Keywords)

Masukkan daftar kata kunci ini ke menu **Kata Kunci Negatif Kampanye (*Campaign Negative Keywords*)** di Google Ads sebelum kampanye dinyalakan:

### A. Lowongan Kerja & Karir (Paling Sering Menguras Budget)
```
lowongan
loker
kerja
gaji
karir
walk in interview
recruitment
magang
internship
operator bore pile loker
tukang gali loker
```

### B. Edukasi, Skripsi, & Jurnal (Pencari Tugas Kuliah)
```
skripsi
jurnal
pdf
makalah
tugas akhir
contoh perhitungan
analisa struktur pdf
rumus
pengertian
teori
definisi
cara kerja
cara membuat
sejarah
```

### C. Jual Beli / Sewa Alat Bekas (Bukan Pengguna Jasa Konstruksi)
```
jual
beli
bekas
second
mata bor bekas
sewa mesin tanpa operator
rental alat berat saja
harga pipa tremie bekas
shopee
tokopedia
bukalapak
olx
lazada
```

### D. DIY & Non-Target (Bukan Kategori Pondasi)
```
diy
buat sendiri
manual tanpa tukang
murahan
gratis
free
alat bor sumur air
service pompa air
bor sumur jet pump
```

---

## 7. Setelan Otomatisasi URL Iklan (Final URL Suffix — 1x Pasang)

Agar nama kampanye dan kata kunci yang diketik calon klien di Google **otomatis tertangkap di Dashboard tanpa perlu diketik manual**:

1. Di akun Google Ads, buka menu:  
   **Setelan Akun** $\rightarrow$ **Pelacakan** $\rightarrow$ cari kolom **Akhiran URL Final (*Final URL Suffix*)**.
2. Masukkan baris ini:
   ```text
   utm_source=google&utm_medium=cpc&utm_campaign=bore-pile&utm_term={keyword}
   ```
   *(Catatan: Jika Mas Andrey ingin nama kampanye dinamis mengikuti ID kampanye otomatis dari Google, bisa gunakan `utm_campaign={campaignid}`. Namun `utm_campaign=bore-pile` adalah yang paling bersih dan mudah dibaca di dashboard).*
3. Klik **Simpan**.

### Cara Kerjanya di Lapangan:
* **`utm_campaign=bore-pile`:** Langsung melabeli semua prospek dari kampanye bore pile di Dashboard.
* **`{keyword}`:** Google Ads otomatis mengganti parameter ini dengan kata kunci asli yang diketik calon klien saat mencari di Google (misal: *"jasa bore pile jakarta"*).
* **Hasil di Dashboard:** Nama kampanye, kata kunci pencarian, klik, chat WA, dan omzet closing akan otomatis terkelompokkan rapi di tabel Dashboard ASeven Pile.

---

## 8. Ceklist Sebelum Iklan Dijalankan (Pre-Flight Checklist)

Pastikan semua poin berikut sudah diperiksa sebelum menekan tombol *Publish Campaign*:

- [ ] **1. Akhiran URL Final (*Final URL Suffix*):** Sudah dipasang `utm_source=google&utm_medium=cpc&utm_campaign=bore-pile&utm_term={keyword}` di setelan Google Ads.
- [ ] **2. Auto-tagging Aktif:** Pastikan fitur Beri Tag Otomatis aktif di Google Ads (*Setelan Akun $\rightarrow$ Beri tag otomatis / Auto-tagging: Centang Aktif*).
- [ ] **3. Bidding Awal (Fase 1):** Gunakan **Maximize Clicks** dengan batas tawaran (Max CPC Limit) di angka Rp 15.000 – Rp 25.000.
- [ ] **4. Status Konversi Awal:**
  - `WhatsApp`: Disetel sebagai **Tindakan Utama (Primary Action)** (Status: 🟢 Aktif).
  - `Scroll Depth 50%` & `Tayangan Halaman`: Disetel sebagai **Tindakan Sekunder (Secondary Action)**.
  - `offline (Upload)`: Disetel sebagai **Tindakan Sekunder (Secondary Action)** dengan nilai dinamis (akan diubah ke Utama setelah ada 15 deal closing).
- [ ] **5. Kata Kunci Negatif:** Seluruh daftar kata kunci negatif (loker, skripsi, jual alat bekas, sumur bor air) sudah disalin ke menu *Campaign Negative Keywords*.
- [ ] **6. Saldo Akun Google Ads:** Pastikan metode pembayaran utama aktif dan memiliki saldo cukup.
- [ ] **7. URL Tujuan Iklan (Final URL):** Mengarah ke halaman layanan spesifik kota, contoh: `https://asevenpile.com/area-layanan/bore-pile/jakarta/`.
- [ ] **8. Tombol WhatsApp Website:** Sudah diverifikasi di HP dan laptop, klik tombol WA langsung membuka chat ke nomor resmi ASeven Pile (`6285814173761`).
