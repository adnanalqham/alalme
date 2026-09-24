<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVehicle extends Model
{
    protected $table = 'user_vehicles';

    protected $fillable = [
        'user_id',
        'make_id',
        'model_id',
        'year_id',
        'vehicle_spec_id',
        'nickname',
        'vin',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'make_id' => 'integer',
        'model_id' => 'integer',
        'year_id' => 'integer',
        'vehicle_spec_id' => 'integer',
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

    public function specification(): BelongsTo
    {
        return $this->belongsTo(VehicleSpec::class, 'vehicle_spec_id');
    }
}
