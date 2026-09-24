<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopUser extends Model
{
    protected $table = 'shop_users';

    protected $fillable = [
        'shop_id',
        'user_id',
        'branch_id',
        'role',
        'permissions',
        'status',
        'invited_by',
        'invited_at',
        'joined_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'invited_at' => 'datetime',
        'joined_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class, 'shop_id');
    }

    public function branch()
    {
        return $this->belongsTo(ShopBranch::class, 'branch_id');
    }
}
