# Aplikasi Tracking Unit & Monitoring Profit — PT Parkit Jaya Utama (PJU)

Aplikasi terpadu monitoring pengiriman armada vendor dan dashboard admin profit & margin yang dikembangkan secara spesifik mengacu pada proposal resmi PT Parkit Jaya Utama & PT Escava Jelajah Indonesia.

---

## 🏗 Arsitektur Sistem

1. **Backend (Laravel 11)**:
   - **Lokasi**: `./backend`
   - **Database**: SQLite (dapat dialihkan ke MySQL/PostgreSQL via `.env`)
   - **Fitur Utama**:
     - Kalkulasi otomatis Laba Kotor & Persentase Margin sesuai rumus proposal:
       $$\text{Laba Kotor} = \text{Harga Jual} - (\text{Biaya Vendor} + \text{Biaya Tambahan})$$
       $$\text{Margin (\%)} = \frac{\text{Laba Kotor}}{\text{Harga Jual}} \times 100\%$$
     - Peringatan dini (*early warning alert*) jika margin order di bawah batas toleransi ($< 10,0\%$).
     - Endpoint GPS tracking ponsel pengemudi (`/api/tracking/update-location`).
     - Alur order lengkap: *Inquiry $\rightarrow$ Quotation $\rightarrow$ PO Confirmed $\rightarrow$ Dispatched $\rightarrow$ In Transit $\rightarrow$ POD $\rightarrow$ Invoice & Payment*.
     - Pengelolaan Piutang Pelanggan (AR) dan Utang ke Vendor Armada (AP).
     - Ekspor laporan real-time ke format CSV/Excel.
     - API Public Tracking untuk portal pelanggan (`/api/public/track/{code}`).

2. **Frontend (Next.js 16 + React 19 + Tailwind CSS + Leaflet)**:
   - **Lokasi**: `./frontend`
   - **Fitur Utama**:
     - **Dashboard Profit & Margin**: Visualisasi omzet, pengeluaran vendor, laba kotor, margin rata-rata, tren bulanan, analisis rute teratas, dan ranking vendor armada rekanan.
     - **Live Unit Tracking Map**: Peta satelit & jalanan interaktif (Leaflet + OpenStreetMap) dengan rute polyline kota-kota di Indonesia (Jakarta, Bekasi, Semarang, Surabaya, Lampung, Medan), kecepatan km/jam, dan milestone pengiriman.
     - **Manajemen Order**: Tabel sesuai format proposal dengan status margin visual, tombol pembuatan order baru berbekal live margin preview kalkulator, dan modal dispatch armada vendor.
     - **Arus Kas (AR/AP)**: Monitoring faktur invoice pelanggan yang belum lunas dan kewajiban bayar vendor rekanan dengan tanggal jatuh tempo.
     - **Aplikasi Driver Lapangan**: Simulator tampilan ponsel driver untuk membagikan koordinat GPS terkini dan mengunggah foto fisik Surat Jalan / Bukti Terima (POD) stempel basah.
     - **Portal Mandiri Pelanggan**: Pencarian kiriman publik menggunakan nomor order PJU atau nomor PO pelanggan dengan stepper status perjalanan.
     - **Role Switcher**: Penggantian peran cepat (*Manajemen PJU*, *Staf Keuangan*, *Driver*, *Pelanggan*).

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi saat ini telah aktif dan berjalan di background:
- **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- **Backend API (Laravel 11)**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Perintah Manual (Jika Ingin Dijalankan Ulang)

1. **Jalankan Backend Laravel**:
   ```bash
   cd /home/junancok/Downloads/pju-tracking-app/backend
   php artisan serve --host=127.0.0.1 --port=8000
   ```

2. **Jalankan Frontend Next.js**:
   ```bash
   cd /home/junancok/Downloads/pju-tracking-app/frontend
   npm run dev -- -p 3000
   ```

3. **Reset & Isi Data Awal (Seeder)**:
   ```bash
   cd /home/junancok/Downloads/pju-tracking-app/backend
   php artisan migrate:fresh --seed
   ```

---

## 📊 Data Awal (Sesuai Halaman 3 Proposal)

| No. Order | Rute | Pelanggan | Harga Jual | Biaya Vendor | Laba Kotor | Margin | Keterangan |
|---|---|---|---|---|---|---|---|
| **PJU-001** | Jakarta - Surabaya | PT Unilever Indonesia Tbk | Rp 10.000.000 | Rp 8.500.000 | Rp 1.500.000 | 15,0% | Normal (Sehat) |
| **PJU-002** | Bekasi - Semarang | PT Mayora Indah Tbk | Rp 7.500.000 | Rp 6.600.000 | Rp 900.000 | 12,0% | Normal (Sehat) |
| **PJU-003** | Jakarta - Medan | PT Indofood CBP Sukses Makmur | Rp 18.000.000 | Rp 16.900.000 | Rp 1.100.000 | 6,1% | **Di Bawah Batas Target (< 10%)** |
| **PJU-004** | Karawang - Solo | PT Astra Otoparts Tbk | Rp 8.800.000 | Rp 7.200.000 | Rp 1.250.000 | 14,2% | Selesai (POD Lengkap) |
