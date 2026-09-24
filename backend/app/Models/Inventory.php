<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'product_id',
        'shop_id',
        'branch_id',
        'quantity',
        'low_stock_threshold',
        'track_quantity',
        'allow_backorder',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'track_quantity' => 'boolean',
        'allow_backorder' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function branch()
    {
        return $this->belongsTo(ShopBranch::class, 'branch_id');
    }
}
