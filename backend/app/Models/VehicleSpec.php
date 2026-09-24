<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleSpec extends Model
{
    protected $table = 'vehicle_specs';

    protected $fillable = [
        'model_id',
        'year_id',
        'make_id',
        'model_name',
        'model_year',
        'trim',
        'series',
        'body_class',
        'vehicle_type',
        'doors',
        'engine_model',
        'engine_cylinders',
        'engine_displacement_cc',
        'engine_hp',
        'fuel_type',
        'drive_type',
        'transmission_style',
        'transmission_speeds',
        'electrification_level',
        'raw_data',
        'source',
        'source_updated_at',
    ];

    protected $casts = [
        'model_year' => 'integer',
        'doors' => 'integer',
        'engine_cylinders' => 'integer',
        'engine_displacement_cc' => 'integer',
        'engine_hp' => 'float',
        'raw_data' => 'array',
        'source_updated_at' => 'datetime',
    ];

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function modelYear(): BelongsTo
    {
        return $this->belongsTo(VehicleModelYear::class, 'year_id');
    }

    public function getEngineSummary(): string
    {
        $parts = [];
        if ($this->engine_displacement_cc) {
            $parts[] = number_format($this->engine_displacement_cc / 1000, 1) . 'L';
        }
        if ($this->engine_cylinders) {
            $parts[] = 'I' . $this->engine_cylinders;
        }
        if ($this->fuel_type) {
            $parts[] = $this->fuel_type;
        }
        return count($parts) > 0 ? implode(' ', $parts) : 'Standard Engine';
    }
}
