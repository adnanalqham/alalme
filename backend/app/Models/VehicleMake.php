<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleMake extends Model
{
    protected $table = 'vehicle_makes';

    protected $fillable = [
        'nhtsa_make_id',
        'name_en',
        'name_ar',
        'slug',
        'vehicle_type',
        'logo_url',
        'logo_source',
        'logo_license',
        'logo_status',
        'country_id',
        'is_active',
        'source',
        'source_updated_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'source_updated_at' => 'datetime',
        'nhtsa_make_id' => 'integer',
    ];

    public function models(): HasMany
    {
        return $this->hasMany(VehicleModel::class, 'make_id');
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(VehicleSpec::class, 'make_id');
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(VehicleAlias::class, 'entity_id')
            ->where('entity_type', 'make');
    }

    public function getLocalizedName(string $locale = 'ar'): string
    {
        if ($locale === 'ar' && !empty($this->name_ar)) {
            return $this->name_ar;
        }
        return $this->name_en;
    }

    /**
     * Check if brand logo was manually customized by Admin
     */
    public function isManualLogo(): bool
    {
        return $this->logo_source === 'manual';
    }

    /**
     * Format for API response with guaranteed logo structure
     */
    public function toApiResponse(): array
    {
        return [
            'id' => $this->id,
            'name' => [
                'ar' => $this->name_ar ?? $this->name_en,
                'en' => $this->name_en,
            ],
            'slug' => $this->slug,
            'logo_url' => $this->logo_url,
            'logo_status' => $this->logo_status ?? ($this->logo_url ? 'available' : 'missing'),
            'logo_source' => $this->logo_source ?? 'auto',
            'is_active' => $this->is_active,
        ];
    }
}
