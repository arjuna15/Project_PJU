<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Customers (Pelanggan PJU)
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->integer('payment_term_days')->default(30);
            $table->timestamps();
        });

        // 2. Vendors (Vendor Rekanan Armada)
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('contact_person')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_account_name')->nullable();
            $table->integer('payment_term_days')->default(14);
            $table->timestamps();
        });

        // 3. Fleets (Armada milik Vendor)
        Schema::create('fleets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('plate_number')->unique();
            $table->string('vehicle_type'); // Pickup, CDE, CDD, Fuso, Wingbox, Tronton, Trailer, Lowbed
            $table->decimal('capacity_ton', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Drivers (Pengemudi)
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('sim_number')->nullable();
            $table->decimal('current_lat', 10, 7)->nullable();
            $table->decimal('current_lng', 10, 7)->nullable();
            $table->timestamp('last_location_update')->nullable();
            $table->string('status')->default('standby'); // standby, on_duty, resting
            $table->timestamps();
        });

        // 5. Orders (Shipment & Monitoring Profit)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // PJU-001, PJU-002, etc.
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('customer_po_number')->nullable();
            
            // Route & Cargo
            $table->string('origin_city');
            $table->text('origin_address')->nullable();
            $table->string('destination_city');
            $table->text('destination_address')->nullable();
            $table->string('cargo_description')->nullable();
            $table->decimal('cargo_weight_ton', 8, 2)->default(0);
            $table->string('vehicle_type_required');

            // Assignment
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fleet_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();

            // Status Workflow: inquiry, quotation, po_confirmed, dispatched, loading, in_transit, arrived, delivered, completed, cancelled
            $table->string('status')->default('inquiry');
            $table->dateTime('pickup_date')->nullable();
            $table->dateTime('eta_date')->nullable();
            $table->dateTime('delivered_at')->nullable();

            // Financial & Profit Calculations
            // Laba Kotor = customer_price - (vendor_cost + total_additional_cost)
            // Margin (%) = Laba Kotor / customer_price * 100%
            $table->decimal('customer_price', 14, 2)->default(0); // Harga Jual ke Pelanggan
            $table->decimal('vendor_cost', 14, 2)->default(0);    // Biaya Vendor Pokok
            $table->decimal('uang_jalan', 14, 2)->default(0);      // Biaya Tambahan: Uang Jalan
            $table->decimal('bongkar_muat', 14, 2)->default(0);    // Biaya Tambahan: Bongkar Muat
            $table->decimal('waiting_time', 14, 2)->default(0);    // Biaya Tambahan: Waiting Time
            $table->decimal('other_cost', 14, 2)->default(0);     // Biaya Tambahan Lainnya
            $table->string('other_cost_note')->nullable();
            $table->decimal('total_additional_cost', 14, 2)->default(0);
            $table->decimal('gross_profit', 14, 2)->default(0);   // Laba Kotor
            $table->decimal('margin_percentage', 5, 2)->default(0); // Margin %
            $table->decimal('margin_alert_threshold', 5, 2)->default(10.00); // 10%
            $table->boolean('is_under_margin')->default(false);

            // Invoicing & Payment (Piutang Pelanggan / AR)
            $table->string('customer_payment_status')->default('unpaid'); // unpaid, partial, paid
            $table->string('customer_invoice_no')->nullable();
            $table->date('customer_invoice_date')->nullable();
            $table->date('customer_due_date')->nullable();
            $table->dateTime('customer_paid_at')->nullable();

            // Payables to Vendor (Utang Vendor / AP)
            $table->string('vendor_payment_status')->default('unpaid'); // unpaid, partial, paid
            $table->string('vendor_invoice_no')->nullable();
            $table->date('vendor_due_date')->nullable();
            $table->dateTime('vendor_paid_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'pickup_date']);
            $table->index('is_under_margin');
            $table->index('customer_payment_status');
            $table->index('vendor_payment_status');
        });

        // 6. Tracking Logs (GPS checkpoints from Driver mobile)
        Schema::create('tracking_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->decimal('speed_kmh', 5, 2)->default(0);
            $table->integer('heading')->nullable();
            $table->string('location_name')->nullable();
            $table->string('status_milestone')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'created_at']);
        });

        // 7. Documents (Surat Jalan, Bukti Terima POD, dll)
        Schema::create('shipment_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('document_type'); // surat_jalan, bukti_terima_pod, timbangan, invoice
            $table->string('file_name');
            $table->string('file_url');
            $table->text('notes')->nullable();
            $table->string('uploaded_by_role')->default('driver');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_documents');
        Schema::dropIfExists('tracking_logs');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('drivers');
        Schema::dropIfExists('fleets');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('customers');
    }
};
