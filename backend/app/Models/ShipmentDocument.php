<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'document_type',
        'file_name',
        'file_url',
        'notes',
        'uploaded_by_role',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
