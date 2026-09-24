<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'shop_id', 'category_id', 'manufacturer_id',
        'name_ar', 'name_en', 'part_number', 'oem_number', 'barcode',
        'description_ar', 'description_en',
        'condition', 'price_visibility', 'purchase_method',
        'price', 'currency_code', 'status',
        'rating', 'rating_count', 'view_count',
    ];

    protected $casts = [
        'price' => 'float',
        'rating' => 'float',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class, 'shop_id', 'id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function manufacturer(): BelongsTo
    {
        return $this->belongsTo(Manufacturer::class, 'manufacturer_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id')->orderBy('sort_order');
    }

    public function compatibilities()
    {
        return $this->hasMany(ProductVehicleCompatibility::class, 'product_id', 'id');
    }

    public function inventories()
    {
        return $this->hasMany(Inventory::class, 'product_id', 'id');
    }
}
