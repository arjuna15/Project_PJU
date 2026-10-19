<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrackingLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'driver_id',
        'lat',
        'lng',
        'speed_kmh',
        'heading',
        'location_name',
        'status_milestone',
        'note',
    ];

    protected $casts = [
        'lat' => 'float',
        'lng' => 'float',
        'speed_kmh' => 'float',
        'heading' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
