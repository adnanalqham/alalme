<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleModelYear extends Model
{
    protected $table = 'vehicle_model_years';

    protected $fillable = [
        'model_id',
        'year',
        'source',
        'source_updated_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'model_id' => 'integer',
        'source_updated_at' => 'datetime',
    ];

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(VehicleSpec::class, 'year_id');
    }
}
