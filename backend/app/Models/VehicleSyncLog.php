<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleSyncLog extends Model
{
    protected $table = 'vehicle_sync_logs';

    protected $fillable = [
        'type',
        'status',
        'records_processed',
        'records_created',
        'records_updated',
        'records_failed',
        'started_at',
        'finished_at',
        'error_message',
    ];

    protected $casts = [
        'records_processed' => 'integer',
        'records_created' => 'integer',
        'records_updated' => 'integer',
        'records_failed' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];
}
