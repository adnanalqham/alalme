<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVehicleCompatibility extends Model
{
    protected $table = 'product_vehicle_compatibilities';

    protected $fillable = [
        'product_id',
        'make_id',
        'model_id',
        'year_from',
        'year_to',
        'engine_code',
        'engine_name',
        'notes',
    ];

    protected $casts = [
        'year_from' => 'integer',
        'year_to' => 'integer',
        'make_id' => 'integer',
        'model_id' => 'integer',
    ];

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'make_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    public function matchesVehicle(string $makeName, string $modelName, int $year): bool
    {
        $makeMatch = strcasecmp($this->make->name_en, $makeName) === 0 ||
                     strcasecmp($this->make->name_ar ?? '', $makeName) === 0;
        
        $modelMatch = !$this->model_id ||
                      strcasecmp($this->model->name_en ?? '', $modelName) === 0 ||
                      strcasecmp($this->model->name_ar ?? '', $modelName) === 0;
        
        $yearMatch = $year >= $this->year_from && $year <= $this->year_to;

        return $makeMatch && $modelMatch && $yearMatch;
    }
}
