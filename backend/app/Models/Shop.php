<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shop extends Model
{
    use SoftDeletes;

    protected $table = 'shops';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'owner_id', 'name_ar', 'name_en', 'slug',
        'description_ar', 'description_en',
        'phone', 'whatsapp', 'email', 'website',
        'country_id', 'city_id', 'city', 'address',
        'logo_url', 'banner_url', 'status',
        'rejection_reason', 'approved_at', 'approved_by',
        'commercial_reg_no', 'rating', 'rating_count',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'rating' => 'float',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id', 'id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(ShopBranch::class, 'shop_id', 'id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(ShopUser::class, 'shop_id', 'id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'shop_id', 'id');
    }

    public function isActive(): bool
    {
        return $this->status === 'ACTIVE';
    }

    public function isPending(): bool
    {
        return $this->status === 'PENDING';
    }
}
