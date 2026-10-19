<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Driver;
use App\Models\Fleet;
use App\Models\Order;
use App\Models\ShipmentDocument;
use App\Models\TrackingLog;
use App\Models\User;
use App\Models\Vendor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users with specific roles for demo / realistic use
        $users = [
            [
                'name' => 'Arjuna Arrasyid (Direktur Ops)',
                'email' => 'admin@pju.co.id',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Siti Rahmawati (Finance & AR/AP)',
                'email' => 'finance@pju.co.id',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Budi Santoso (Driver Lapangan)',
                'email' => 'driver@pju.co.id',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'PIC PT Contoh Pelanggan A',
                'email' => 'customer@pju.co.id',
                'password' => Hash::make('password123'),
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }

        // 2. Customers (Pelanggan Utama PJU)
        $unilever = Customer::create([
            'name' => 'PT Contoh Pelanggan A Tbk',
            'code' => 'CUST-CPA',
            'contact_person' => 'Hendra Setiawan',
            'phone' => '0812-8877-6655',
            'email' => 'pic.a@contohpelanggan.co.id',
            'address' => 'Kawasan Industri Jababeka IX Blok C No. 1, Cikarang, Bekasi',
            'payment_term_days' => 45,
        ]);

        $mayora = Customer::create([
            'name' => 'PT Contoh Pelanggan B Tbk',
            'code' => 'CUST-CPB',
            'contact_person' => 'Dedi Gunawan',
            'phone' => '0813-2244-8899',
            'email' => 'pic.b@contohpelanggan.co.id',
            'address' => 'Jl. Tomang Raya 21-23, Jakarta Barat',
            'payment_term_days' => 30,
        ]);

        $indofood = Customer::create([
            'name' => 'PT Contoh Pelanggan C Tbk',
            'code' => 'CUST-CPC',
            'contact_person' => 'Rina Wijaya',
            'phone' => '0815-9988-1122',
            'email' => 'pic.c@contohpelanggan.co.id',
            'address' => 'Menara Sudirman Lantai 12, Jakarta Selatan',
            'payment_term_days' => 30,
        ]);

        $astra = Customer::create([
            'name' => 'PT Contoh Pelanggan D Tbk',
            'code' => 'CUST-CPD',
            'contact_person' => 'Wahyu Hidayat',
            'phone' => '0818-4455-6677',
            'email' => 'pic.d@contohpelanggan.co.id',
            'address' => 'Jl. Pegangsaan Dua Km 2.2, Kelapa Gading, Jakarta Utara',
            'payment_term_days' => 60,
        ]);

        // 3. Vendors (Vendor Rekanan Armada Milik Mitra)
        $vendorSBL = Vendor::create([
            'name' => 'PT Sumber Berkah Logistik',
            'code' => 'VND-SBL',
            'contact_person' => 'Bambang Sutrisno',
            'phone' => '0813-1122-3344',
            'email' => 'ops@sumberberkahlogistik.id',
            'address' => 'Jl. Raya Narogong Km 12, Pangkalan 4, Bantar Gebang, Bekasi',
            'bank_name' => 'Bank Central Asia (BCA)',
            'bank_account_no' => '8420-1928-37',
            'bank_account_name' => 'PT SUMBER BERKAH LOGISTIK',
            'payment_term_days' => 14,
        ]);

        $vendorTJE = Vendor::create([
            'name' => 'CV Trans Jawa Express',
            'code' => 'VND-TJE',
            'contact_person' => 'H. Suryadi',
            'phone' => '0821-3344-5566',
            'email' => 'fleet@transjawaexpress.com',
            'address' => 'Jl. Raya Kaligawe Km 5, Genuk, Semarang',
            'bank_name' => 'Bank Mandiri',
            'bank_account_no' => '137-00-1928374-1',
            'bank_account_name' => 'CV TRANS JAWA EXPRESS',
            'payment_term_days' => 14,
        ]);

        $vendorSamudera = Vendor::create([
            'name' => 'PT Samudera Angkutan Prima',
            'code' => 'VND-SAP',
            'contact_person' => 'Iwan Kurniawan',
            'phone' => '0811-9988-7766',
            'email' => 'charter@samuderaprima.co.id',
            'address' => 'Jl. Yos Sudarso No. 88, Tanjung Priok, Jakarta Utara',
            'bank_name' => 'Bank BNI',
            'bank_account_no' => '0293-8472-91',
            'bank_account_name' => 'PT SAMUDERA ANGKUTAN PRIMA',
            'payment_term_days' => 21,
        ]);

        // 4. Fleets (Armada Vendor)
        $fleet1 = Fleet::create([
            'vendor_id' => $vendorSBL->id,
            'plate_number' => 'B 9481 UYT',
            'vehicle_type' => 'Wingbox',
            'capacity_ton' => 20.0,
            'is_active' => true,
        ]);

        $fleet2 = Fleet::create([
            'vendor_id' => $vendorTJE->id,
            'plate_number' => 'H 8122 OB',
            'vehicle_type' => 'CDD Long',
            'capacity_ton' => 7.5,
            'is_active' => true,
        ]);

        $fleet3 = Fleet::create([
            'vendor_id' => $vendorSamudera->id,
            'plate_number' => 'BK 8901 XL',
            'vehicle_type' => 'Tronton',
            'capacity_ton' => 25.0,
            'is_active' => true,
        ]);

        $fleet4 = Fleet::create([
            'vendor_id' => $vendorSBL->id,
            'plate_number' => 'B 9044 PJU',
            'vehicle_type' => 'Fuso',
            'capacity_ton' => 12.0,
            'is_active' => true,
        ]);

        $fleet5 = Fleet::create([
            'vendor_id' => $vendorTJE->id,
            'plate_number' => 'B 9312 TEV',
            'vehicle_type' => 'Trailer 40ft',
            'capacity_ton' => 32.0,
            'is_active' => true,
        ]);

        // 5. Drivers (Pengemudi berbekal GPS smartphone)
        $driverBudi = Driver::create([
            'vendor_id' => $vendorSBL->id,
            'name' => 'Budi Santoso',
            'phone' => '0857-1928-3746',
            'sim_number' => 'SIM B2 UMUM - 9201928472',
            'current_lat' => -6.9175,
            'current_lng' => 110.4283, // Dekat Semarang
            'last_location_update' => Carbon::now()->subMinutes(8),
            'status' => 'on_duty',
        ]);

        $driverAgus = Driver::create([
            'vendor_id' => $vendorTJE->id,
            'name' => 'Agus Riyadi',
            'phone' => '0812-4455-9900',
            'sim_number' => 'SIM B1 - 8192837461',
            'current_lat' => -6.9038,
            'current_lng' => 109.6800, // Dekat Batang / Pekalongan
            'last_location_update' => Carbon::now()->subMinutes(12),
            'status' => 'on_duty',
        ]);

        $driverZul = Driver::create([
            'vendor_id' => $vendorSamudera->id,
            'name' => 'Zulkifli Lubis',
            'phone' => '0813-7766-3322',
            'sim_number' => 'SIM B2 UMUM - 7102938475',
            'current_lat' => -5.4290,
            'current_lng' => 105.2625, // Dekat Bandar Lampung
            'last_location_update' => Carbon::now()->subMinutes(25),
            'status' => 'on_duty',
        ]);

        $driverHadi = Driver::create([
            'vendor_id' => $vendorSBL->id,
            'name' => 'Hadi Sucipto',
            'phone' => '0819-3322-1100',
            'sim_number' => 'SIM B2 - 6201928471',
            'current_lat' => -6.2383,
            'current_lng' => 106.9756, // Bekasi Pool PJU
            'last_location_update' => Carbon::now()->subHours(1),
            'status' => 'standby',
        ]);

        // 6. Orders: Exactly matching Proposal numbers + realistic live data
        // PJU-001: Jakarta - Surabaya (Rp 10.000.000, Vendor Rp 8.500.000, Profit Rp 1.500.000, 15.0%)
        $order1 = Order::create([
            'order_number' => 'PJU-001',
            'customer_id' => $unilever->id,
            'customer_po_number' => 'PO-CPA-2026-0941',
            'origin_city' => 'Jakarta Barat',
            'origin_address' => 'Gudang Distribusi Daan Mogot Km 14, Jakarta Barat',
            'destination_city' => 'Surabaya',
            'destination_address' => 'Distribution Center Rungkut Industri III No. 12, Surabaya',
            'cargo_description' => 'Home Care & Personal Care Products',
            'cargo_weight_ton' => 18.5,
            'vehicle_type_required' => 'Wingbox',
            'vendor_id' => $vendorSBL->id,
            'fleet_id' => $fleet1->id,
            'driver_id' => $driverBudi->id,
            'status' => 'in_transit',
            'pickup_date' => Carbon::now()->subDays(1)->setTime(9, 0),
            'eta_date' => Carbon::now()->addHours(10),
            'customer_price' => 10000000,
            'vendor_cost' => 8500000,
            'uang_jalan' => 0,
            'bongkar_muat' => 0,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'unpaid',
            'customer_invoice_no' => 'INV/PJU/2026/10/001',
            'customer_invoice_date' => Carbon::now()->subDays(1),
            'customer_due_date' => Carbon::now()->addDays(44),
            'vendor_payment_status' => 'unpaid',
            'vendor_invoice_no' => 'BILL/SBL/2026/881',
            'vendor_due_date' => Carbon::now()->addDays(13),
            'notes' => 'Armada Wingbox aman, segel nomor CPA-9921 aman terpasang.',
        ]);

        // Tracking logs for Order 1 (Jakarta -> Cikampek -> Palimanan -> Semarang -> Tol Trans Jawa)
        $route1Points = [
            [-6.1754, 106.8272, 'Jakarta - Pintu Tol Tomang', 'Berangkat dari gudang Jakarta', 45, 'Dalam Perjalanan'],
            [-6.2415, 107.0012, 'Bekasi Timur Km 19', 'Tol Japek lancar jaya', 68, 'Dalam Perjalanan'],
            [-6.3989, 107.4475, 'Tol Cipali Km 86', 'Rest Area Subang, isi solar & istirahat 15 menit', 0, 'Rest Area'],
            [-6.7214, 108.5569, 'Cirebon Km 208', 'Melintas lancar ke arah Jawa Tengah', 72, 'Dalam Perjalanan'],
            [-6.9038, 109.6800, 'Batang - Pekalongan Km 370', 'Lancar terkendali cuaca cerah', 70, 'Dalam Perjalanan'],
            [-6.9932, 110.4203, 'Gerbang Tol Kalikangkung Semarang', 'Melewati Semarang, menuju Solo - Surabaya', 65, 'Dalam Perjalanan'],
        ];

        foreach ($route1Points as $idx => $pt) {
            TrackingLog::create([
                'order_id' => $order1->id,
                'driver_id' => $driverBudi->id,
                'lat' => $pt[0],
                'lng' => $pt[1],
                'location_name' => $pt[2],
                'note' => $pt[3],
                'speed_kmh' => $pt[4],
                'heading' => 95,
                'status_milestone' => $pt[5],
                'created_at' => Carbon::now()->subHours(18 - ($idx * 3)),
            ]);
        }

        // PJU-002: Bekasi - Semarang (Rp 7.500.000, Vendor Rp 6.600.000, Profit Rp 900.000, 12.0%)
        $order2 = Order::create([
            'order_number' => 'PJU-002',
            'customer_id' => $mayora->id,
            'customer_po_number' => 'PO-CPB-OCT-410',
            'origin_city' => 'Bekasi Barat',
            'origin_address' => 'Jl. Oscar 1 Blok C7 No. 20, Harapan Baru 2, Bekasi Barat (Hub PJU)',
            'destination_city' => 'Semarang',
            'destination_address' => 'Kawasan Industri Candi Blok XI No. 8, Krapyak, Semarang',
            'cargo_description' => 'Biskuit & Kopi Kemasan (1.200 Karton)',
            'cargo_weight_ton' => 6.8,
            'vehicle_type_required' => 'CDD Long',
            'vendor_id' => $vendorTJE->id,
            'fleet_id' => $fleet2->id,
            'driver_id' => $driverAgus->id,
            'status' => 'in_transit',
            'pickup_date' => Carbon::now()->subHours(10),
            'eta_date' => Carbon::now()->addHours(3),
            'customer_price' => 7500000,
            'vendor_cost' => 6600000,
            'uang_jalan' => 0,
            'bongkar_muat' => 0,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'unpaid',
            'customer_invoice_no' => 'INV/PJU/2026/10/002',
            'customer_invoice_date' => Carbon::now()->subHours(10),
            'customer_due_date' => Carbon::now()->addDays(29),
            'vendor_payment_status' => 'unpaid',
            'vendor_invoice_no' => 'BILL/TJE/9021',
            'vendor_due_date' => Carbon::now()->addDays(14),
            'notes' => 'Pengiriman tepat waktu untuk pemenuhan stok agen Jawa Tengah.',
        ]);

        $route2Points = [
            [-6.2383, 106.9756, 'Bekasi - Pool PJU Harapan Baru', 'Muat selesai, surat jalan dibawa driver', 0, 'Selesai Muat'],
            [-6.4215, 107.5012, 'Tol Cipali Km 102', 'Laju stabil 70 km/jam', 70, 'Dalam Perjalanan'],
            [-6.7901, 108.6120, 'Palimanan - Kanci', 'Cuaca gerimis ringan, driver waspada', 62, 'Dalam Perjalanan'],
            [-6.9038, 109.6800, 'Batang Kota', 'Mendekati exit tol Krapyak Semarang', 68, 'Mendekati Tujuan'],
        ];

        foreach ($route2Points as $idx => $pt) {
            TrackingLog::create([
                'order_id' => $order2->id,
                'driver_id' => $driverAgus->id,
                'lat' => $pt[0],
                'lng' => $pt[1],
                'location_name' => $pt[2],
                'note' => $pt[3],
                'speed_kmh' => $pt[4],
                'heading' => 102,
                'status_milestone' => $pt[5],
                'created_at' => Carbon::now()->subHours(8 - ($idx * 2)),
            ]);
        }

        // PJU-003: Jakarta - Medan (Rp 18.000.000, Vendor Rp 16.900.000, Profit Rp 1.100.000, 6.1% - DI BAWAH BATAS MARGIN!)
        $order3 = Order::create([
            'order_number' => 'PJU-003',
            'customer_id' => $indofood->id,
            'customer_po_number' => 'PO-CPC-MDN-009',
            'origin_city' => 'Jakarta Utara',
            'origin_address' => 'Pelabuhan Tanjung Priok / Pergudangan Marunda Center, Jakarta',
            'destination_city' => 'Medan',
            'destination_address' => 'Kawasan Industri Medan (KIM II), Mabar, Deli Serdang',
            'cargo_description' => 'Bahan Baku Gandum & Bumbu Instan Food Grade',
            'cargo_weight_ton' => 24.0,
            'vehicle_type_required' => 'Tronton',
            'vendor_id' => $vendorSamudera->id,
            'fleet_id' => $fleet3->id,
            'driver_id' => $driverZul->id,
            'status' => 'in_transit',
            'pickup_date' => Carbon::now()->subDays(2),
            'eta_date' => Carbon::now()->addDays(2),
            'customer_price' => 18000000,
            'vendor_cost' => 16900000,
            'uang_jalan' => 0,
            'bongkar_muat' => 0,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'unpaid',
            'customer_invoice_no' => 'INV/PJU/2026/10/003',
            'customer_invoice_date' => Carbon::now()->subDays(2),
            'customer_due_date' => Carbon::now()->addDays(28),
            'vendor_payment_status' => 'unpaid',
            'vendor_invoice_no' => 'BILL/SAP/5512',
            'vendor_due_date' => Carbon::now()->addDays(19),
            'notes' => 'PENTING: Margin hanya 6.1% (di bawah batas toleransi 10%). Rute feri Bakauheni - Merak mengalami penyesuaian tarif vendor.',
        ]);

        $route3Points = [
            [-6.1042, 106.8833, 'Tanjung Priok, Jakarta', 'Selesai stuffing muatan tronton', 20, 'Berangkat'],
            [-5.9281, 106.0123, 'Pelabuhan Merak Cilegon', 'Antrean kapal feri eksekutif Merak-Bakauheni', 0, 'Dermaga Penyeberangan'],
            [-5.8683, 105.7533, 'Pelabuhan Bakauheni Lampung', 'Kapal sandar, lanjut masuk Tol Bakter', 45, 'Penyeberangan Selesai'],
            [-5.4290, 105.2625, 'Bandar Lampung Km 87', 'Tol Trans Sumatera mengarah ke Palembang', 75, 'Dalam Perjalanan'],
        ];

        foreach ($route3Points as $idx => $pt) {
            TrackingLog::create([
                'order_id' => $order3->id,
                'driver_id' => $driverZul->id,
                'lat' => $pt[0],
                'lng' => $pt[1],
                'location_name' => $pt[2],
                'note' => $pt[3],
                'speed_kmh' => $pt[4],
                'heading' => 315,
                'status_milestone' => $pt[5],
                'created_at' => Carbon::now()->subHours(24 - ($idx * 6)),
            ]);
        }

        // PJU-004: Karawang - Solo (Completed shipment with full documents & paid AR)
        $order4 = Order::create([
            'order_number' => 'PJU-004',
            'customer_id' => $astra->id,
            'customer_po_number' => 'PO-CPD-SLO-772',
            'origin_city' => 'Karawang',
            'origin_address' => 'Kawasan KIIC Lot C-4, Karawang Barat',
            'destination_city' => 'Solo',
            'destination_address' => 'Pabrik Karoseri & Perakitan, Jl. Raya Solo-Semarang Km 12',
            'cargo_description' => 'Automotive Fasteners & Bracket Stamping',
            'cargo_weight_ton' => 11.5,
            'vehicle_type_required' => 'Fuso',
            'vendor_id' => $vendorSBL->id,
            'fleet_id' => $fleet4->id,
            'driver_id' => $driverHadi->id,
            'status' => 'completed',
            'pickup_date' => Carbon::now()->subDays(5),
            'eta_date' => Carbon::now()->subDays(4),
            'delivered_at' => Carbon::now()->subDays(4)->setTime(16, 30),
            'customer_price' => 8800000,
            'vendor_cost' => 7200000,
            'uang_jalan' => 200000,
            'bongkar_muat' => 150000,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'paid',
            'customer_invoice_no' => 'INV/PJU/2026/10/004',
            'customer_invoice_date' => Carbon::now()->subDays(5),
            'customer_due_date' => Carbon::now()->addDays(55),
            'customer_paid_at' => Carbon::now()->subDays(1),
            'vendor_payment_status' => 'paid',
            'vendor_invoice_no' => 'BILL/SBL/8790',
            'vendor_due_date' => Carbon::now()->addDays(9),
            'vendor_paid_at' => Carbon::now()->subDays(2),
            'notes' => 'Pengiriman sukses tanpa komplain, POD fisik telah disahkan warehouse penerima.',
        ]);

        // Documents for Order 4
        ShipmentDocument::create([
            'order_id' => $order4->id,
            'document_type' => 'surat_jalan',
            'file_name' => 'SJ-PJU-004-Karawang-Solo.pdf',
            'file_url' => '/sample-docs/surat-jalan-004.pdf',
            'notes' => 'Surat Jalan Asli bertanda tangan Kepala Gudang KIIC',
            'uploaded_by_role' => 'admin',
        ]);

        ShipmentDocument::create([
            'order_id' => $order4->id,
            'document_type' => 'bukti_terima_pod',
            'file_name' => 'POD-PJU-004-Solo-Ttd-Cap.jpg',
            'file_url' => '/sample-docs/pod-004.jpg',
            'notes' => 'Bukti serah terima stempel basah QC Solo & ttd security',
            'uploaded_by_role' => 'driver',
        ]);

        // PJU-005: Inquiry / Quotation (New incoming request)
        Order::create([
            'order_number' => 'PJU-005',
            'customer_id' => $indofood->id,
            'customer_po_number' => 'RFQ-CPC-SBY-2026',
            'origin_city' => 'Cibitung, Bekasi',
            'origin_address' => 'Gudang Divisi Mi Instan, Cibitung',
            'destination_city' => 'Surabaya',
            'destination_address' => 'Rungkut Industrial Estate, Surabaya',
            'cargo_description' => 'Mi Instan 2.500 Karton Ekspor',
            'cargo_weight_ton' => 19.0,
            'vehicle_type_required' => 'Wingbox',
            'vendor_id' => $vendorSBL->id,
            'fleet_id' => null,
            'driver_id' => null,
            'status' => 'quotation',
            'pickup_date' => Carbon::now()->addDays(2),
            'eta_date' => Carbon::now()->addDays(3),
            'customer_price' => 10500000,
            'vendor_cost' => 8700000,
            'uang_jalan' => 0,
            'bongkar_muat' => 200000,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'unpaid',
            'vendor_payment_status' => 'unpaid',
            'notes' => 'Menunggu persetujuan PO resmi dari Procurement pelanggan.',
        ]);

        // PJU-006: Dispatch pending driver departure
        Order::create([
            'order_number' => 'PJU-006',
            'customer_id' => $mayora->id,
            'customer_po_number' => 'PO-CPB-BDG-012',
            'origin_city' => 'Tangerang',
            'origin_address' => 'Pabrik Pengolahan Jatake, Tangerang',
            'destination_city' => 'Bandung',
            'destination_address' => 'Depo Distribusi Soekarno Hatta No. 411, Bandung',
            'cargo_description' => 'Permen & Wafer Kemasan (800 Karton)',
            'cargo_weight_ton' => 5.2,
            'vehicle_type_required' => 'CDD',
            'vendor_id' => $vendorTJE->id,
            'fleet_id' => $fleet2->id,
            'driver_id' => $driverAgus->id,
            'status' => 'dispatched',
            'pickup_date' => Carbon::now()->addHours(4),
            'eta_date' => Carbon::now()->addHours(11),
            'customer_price' => 4500000,
            'vendor_cost' => 3700000,
            'uang_jalan' => 100000,
            'bongkar_muat' => 100000,
            'waiting_time' => 0,
            'other_cost' => 0,
            'margin_alert_threshold' => 10.0,
            'customer_payment_status' => 'unpaid',
            'vendor_payment_status' => 'unpaid',
            'notes' => 'Driver ditugaskan merapat ke gerbang muat Jatake jam 21:00 WIB.',
        ]);
    }
}
