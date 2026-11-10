# Panduan Peluncuran Iklan Google Ads ASeven Pile
**SOP Pre-Flight, Strategi Bidding Anti-Boncos, Negative Keywords, & Offline Conversion**

Dokumen ini adalah panduan praktis untuk Mas Andrey sebelum menyalakan iklan Google Ads berbayar dan mengoperasikan sistem Offline Conversion ASeven Pile.

---

## 1. Strategi Bidding Anti-Boncos (2 Fase)

Jangan menyalakan **Smart Bidding (Maximize Conversion Value / Target ROAS)** di hari pertama. Algoritma Google membutuhkan data historis minimal **15–30 konversi** dalam 30 hari terakhir agar bisa memprediksi lelang secara akurat.

```
[Minggu 1 - 2: Fase Kumpul Data]
Bidding: Maximize Clicks (Batas Max CPC Rp 15.000 - Rp 25.000)
Tujuan: Jaring klik pencari riil, kumpulkan data konversi, saring kata kunci negatif.
                    ↓ (Setelah terkumpul ≥ 15 konversi)
[Minggu 3+: Fase Smart Bidding]
Bidding: Maximize Conversion Value (Target ROAS)
Tujuan: AI Google mengoptimasi lelang khusus untuk mendatangkan deal puluhan juta.
```

### Fase 1: Minggu ke-1 s/d ke-2 (Data Gathering & Stabilisasi)
* **Strategi Bidding:** **Maksimalkan Klik (*Maximize Clicks*)** dengan **Batas Tawaran CPC Maksimum (*Max CPC Bid Limit*)**.
* **Rekomendasi Batas CPC:** Pasang di kisaran **Rp 15.000 – Rp 25.000** per klik.
  * *Tujuan:* Mencegah algoritma Google memasang bid liar (misal Rp 60.000/klik) saat awal lelang.
* **Tugas Harian Operator:**
  1. Pantau tab **Search Terms (Istilah Penelusuran)** di Google Ads 2 hari sekali.
  2. Tambahkan pencarian yang tidak relevan ke daftar **Kata Kunci Negatif**.
  3. Setiap ada yang transfer DP/deal, masukkan ke Dashboard dan ekspor CSV konversinya ke Google Ads.

### Fase 2: Minggu ke-3 dan Seterusnya (Smart Bidding Aktif)
* **Kapan beralih?** Setelah akun memiliki minimal **15–30 data konversi offline** yang terunggah.
* **Ubah Bidding ke:** **Maksimalkan Nilai Konversi (*Maximize Conversion Value*)**.
* **Hasil:** Google akan otomatis memprioritaskan penayangan iklan kepada orang-orang yang profilnya mirip dengan klien yang sudah pernah transfer deal puluhan juta rupiah.

---

## 2. Pilihan Alur Pelaporan Konversi Offline

Mas Andrey bebas memilih alur yang paling nyaman di lapangan:

### Opsi A: Alur 1 Langkah (Paling Santai & Cepat — Pilihan Mas Andrey)
* **Saat klien transfer DP 30%:**
  1. Buka drawer prospek di Dashboard.
  2. Masukkan nama & nomor WA, klik **"Ambil dari log"** untuk menarik GCLID.
  3. Masukkan total nilai proyek (misal Rp 31.000.000).
  4. Klik tombol **`100%`** (Status jadi Lunas/Selesai).
  5. Simpan $\rightarrow$ Klik **"Export CSV"**.
  6. Upload file CSV ke Google Ads Data Manager.
* **Kelebihan:** Cukup **1 kali upload per deal**. Google langsung mencatat nilai proyek penuh (**Rp 31 Jt**) sejak awal. **Tidak perlu mikirin RESTATE lagi.**

### Opsi B: Alur 2 Tahap (Pencatatan Kas Riil Bertahap)
* **Tahap 1 (Saat DP Masuk):**
  * Masukkan nilai DP (misal Rp 9.300.000) $\rightarrow$ Status **DP Masuk** $\rightarrow$ Export CSV $\rightarrow$ Upload ke Google Ads.
* **Tahap 2 (Saat Pengeboran Selesai & Pelunasan Diterima):**
  * Ubah status prospek jadi **Selesai** $\rightarrow$ Export CSV $\rightarrow$ Sistem otomatis membuat file `RESTATE` berisi Order ID yang sama dengan nilai akhir Rp 31.000.000 $\rightarrow$ Upload ke Google Ads untuk menimpa nilai DP lama.

---

## 3. Daftar Kata Kunci Target (High Buying Intent)

Gunakan jenis pencocokan **Phrase Match (`"..."`)** atau **Exact Match (`[...]`)**. Hindari *Broad Match* tanpa tanda baca di awal agar budget tidak bocor.

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

## 4. Daftar Kata Kunci Negatif Wajib (Negative Keywords)

Masukkan daftar ini ke menu **Kata Kunci Negatif Kampanye (*Campaign Negative Keywords*)** di Google Ads sebelum kampanye dinyalakan:

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

### C. Jual Beli / Sewa Alat Bekas (Bukan Pengguna Jasa)
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

### D. DIY & Non-Target
```
diy
buat sendiri
manual tanpa tukang
murahan
gratis
free
alat bor sumur air (jika tidak melayani sumur bor air minum)
service pompa air
bor sumur jet pump
```

---

## 5. Setelan Otomatisasi URL Iklan (Final URL Suffix — 1x Pasang Selamanya)

Agar nama kampanye dan kata kunci yang dicari orang di Google **otomatis tertangkap tanpa perlu diketik manual satu-satu**:

1. Di akun Google Ads, buka menu:  
   **Setelan Akun** (atau di **Setelan Kampanye**) $\rightarrow$ **Opsi URL Kampanye** $\rightarrow$ cari kolom **Akhiran URL Final (*Final URL Suffix*)**.
2. Masukkan baris ini:
   ```text
   utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_term={keyword}
   ```
3. Klik **Simpan**.

### Cara Kerjanya di Lapangan:
* **`{_campaign}`:** Google Ads otomatis mengganti bagian ini dengan nama kampanye yang Mas Andrey buat (misal: *"Bore Pile Jakarta"*).
* **`{keyword}`:** Google Ads otomatis mengganti bagian ini dengan kata kunci asli yang diketik calon klien saat mencari di Google.
* **Hasil di Dashboard:** Nama kampanye, kata kunci pencarian, klik, chat WA, dan omzet closing akan otomatis terkelompokkan rapi tanpa Mas Andrey utak-atik apa pun lagi!

---

## 6. Ceklist Sebelum Iklan Dijalankan (Pre-Flight Checklist)

Pastikan langkah berikut sudah dicentang sebelum menekan tombol *Publish Campaign*:

- [ ] **1. Akhiran URL Final (*Final URL Suffix*):** Sudah dipasang `utm_source=google&utm_medium=cpc&utm_campaign={_campaign}&utm_term={keyword}` di setelan Google Ads.
- [ ] **2. Koneksi Data Manager Google Ads:** Upload perdana CSV sudah pernah dicoba dan kolom terpetakan (`Conversion_Time`, `Order_ID`, `GCLID`, `Conversion_Value`, `Conversion_Currency`).
- [ ] **3. Saldo Akun Google Ads:** Pastikan metode pembayaran utama (kartu debit/kredit/transfer bank) aktif dan memiliki saldo cukup.
- [ ] **4. URL Tujuan Iklan (Final URL):**
  - Pastikan mengarah ke `https://asevenpile.com/area-layanan/bore-pile/jakarta` atau landing page terkait.
  - Pastikan fitur **Auto-tagging** di akun Google Ads aktif (*Setelan Akun $\rightarrow$ Beri tag otomatis / Auto-tagging: Aktif*).
- [ ] **5. Bersihkan Data Simulasi di Sheet:**
  - Hapus baris testing di tab `Leads` (baris `Bpk. Andrey` & ID transaksi uji coba).
  - Hapus atau biarkan baris testing di tab `Events` agar data real nanti tidak rancu dengan data uji coba.
- [ ] **6. Tombol WhatsApp Website:** Cek sekali lagi klik tombol WA di HP, pastikan pesan template pembuka dari website langsung mengarah ke nomor WA resmi ASeven Pile (`6285814173761`).
