<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title_ar',
        'title_en',
        'image_url',
        'link_url',
        'placement',
        'target',
        'sort_order',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
