<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleModel extends Model
{
    protected $table = 'vehicle_models';

    protected $fillable = [
        'make_id',
        'nhtsa_model_id',
        'name_en',
        'name_ar',
        'slug',
        'vehicle_type',
        'is_active',
        'source',
        'source_updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'source_updated_at' => 'datetime',
        'nhtsa_model_id' => 'integer',
        'make_id' => 'integer',
    ];

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    public function modelYears(): HasMany
    {
        return $this->hasMany(VehicleModelYear::class, 'model_id');
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(VehicleSpec::class, 'model_id');
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(VehicleAlias::class, 'entity_id')
            ->where('entity_type', 'model');
    }

    public function getLocalizedName(string $locale = 'ar'): string
    {
        if ($locale === 'ar' && !empty($this->name_ar)) {
            return $this->name_ar;
        }
        return $this->name_en;
    }
}
