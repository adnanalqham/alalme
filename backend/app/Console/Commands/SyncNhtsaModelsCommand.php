<?php

namespace App\Console\Commands;

use App\Models\VehicleMake;
use App\Services\VehicleSyncService;
use Illuminate\Console\Command;

class SyncNhtsaModelsCommand extends Command
{
    protected $signature = 'vehicle:sync-models {make_id : The ID of the Make in database}';
    protected $description = 'Sync models for a specific vehicle make from NHTSA vPIC';

    public function handle(VehicleSyncService $syncService): int
    {
        $makeId = (int) $this->argument('make_id');
        $make = VehicleMake::find($makeId);

        if (!$make) {
            $this->error("Vehicle make with ID {$makeId} not found.");
            return Command::FAILURE;
        }

        $this->info("Syncing models for: {$make->name_en} (NHTSA ID: {$make->nhtsa_make_id})...");
        $log = $syncService->syncModelsForMake($make);

        if ($log->status === 'SUCCESS') {
            $this->info("Models synced! Processed: {$log->records_processed}, Created: {$log->records_created}, Updated: {$log->records_updated}");
            return Command::SUCCESS;
        }

        $this->error("Sync failed: {$log->error_message}");
        return Command::FAILURE;
    }
}
