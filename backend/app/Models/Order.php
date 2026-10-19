<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'customer_po_number',
        'origin_city',
        'origin_address',
        'destination_city',
        'destination_address',
        'cargo_description',
        'cargo_weight_ton',
        'vehicle_type_required',
        'vendor_id',
        'fleet_id',
        'driver_id',
        'status',
        'pickup_date',
        'eta_date',
        'delivered_at',
        'customer_price',
        'vendor_cost',
        'uang_jalan',
        'bongkar_muat',
        'waiting_time',
        'other_cost',
        'other_cost_note',
        'total_additional_cost',
        'gross_profit',
        'margin_percentage',
        'margin_alert_threshold',
        'is_under_margin',
        'customer_payment_status',
        'customer_invoice_no',
        'customer_invoice_date',
        'customer_due_date',
        'customer_paid_at',
        'vendor_payment_status',
        'vendor_invoice_no',
        'vendor_due_date',
        'vendor_paid_at',
        'notes',
    ];

    protected $casts = [
        'cargo_weight_ton' => 'float',
        'customer_price' => 'float',
        'vendor_cost' => 'float',
        'uang_jalan' => 'float',
        'bongkar_muat' => 'float',
        'waiting_time' => 'float',
        'other_cost' => 'float',
        'total_additional_cost' => 'float',
        'gross_profit' => 'float',
        'margin_percentage' => 'float',
        'margin_alert_threshold' => 'float',
        'is_under_margin' => 'boolean',
        'pickup_date' => 'datetime',
        'eta_date' => 'datetime',
        'delivered_at' => 'datetime',
        'customer_invoice_date' => 'date',
        'customer_due_date' => 'date',
        'customer_paid_at' => 'datetime',
        'vendor_due_date' => 'date',
        'vendor_paid_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($order) {
            $order->recalculateFinancials();
        });
    }

    public function recalculateFinancials(): void
    {
        $additional = (float)$this->uang_jalan + (float)$this->bongkar_muat + (float)$this->waiting_time + (float)$this->other_cost;
        $this->total_additional_cost = $additional;

        $totalVendorExpense = (float)$this->vendor_cost + $additional;
        $customerPrice = (float)$this->customer_price;

        $grossProfit = $customerPrice - $totalVendorExpense;
        $this->gross_profit = $grossProfit;

        if ($customerPrice > 0) {
            $margin = ($grossProfit / $customerPrice) * 100;
            $this->margin_percentage = round($margin, 2);
        } else {
            $this->margin_percentage = 0.00;
        }

        $threshold = $this->margin_alert_threshold > 0 ? (float)$this->margin_alert_threshold : 10.00;
        $this->margin_alert_threshold = $threshold;
        $this->is_under_margin = $this->margin_percentage < $threshold;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function fleet(): BelongsTo
    {
        return $this->belongsTo(Fleet::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function trackingLogs(): HasMany
    {
        return $this->hasMany(TrackingLog::class)->orderBy('created_at', 'asc');
    }

    public function latestTrackingLog()
    {
        return $this->hasOne(TrackingLog::class)->latestOfMany();
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ShipmentDocument::class)->orderBy('created_at', 'desc');
    }
}
