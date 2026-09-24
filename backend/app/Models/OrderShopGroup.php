<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderShopGroup extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'order_id',
        'shop_id',
        'branch_id',
        'subtotal',
        'delivery_fee',
        'total',
        'status',
        'delivery_type',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function branch()
    {
        return $this->belongsTo(ShopBranch::class, 'branch_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_shop_group_id');
    }
}
