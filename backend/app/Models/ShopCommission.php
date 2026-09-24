<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopCommission extends Model
{
    protected $fillable = [
        'shop_id',
        'commission_type',
        'commission_value',
        'effective_from',
        'effective_to',
        'status',
        'created_by',
    ];

    protected $casts = [
        'commission_value' => 'float',
        'effective_from' => 'datetime',
        'effective_to' => 'datetime',
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
}
