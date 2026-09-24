<?php

namespace App\Console\Commands;

use App\Models\VehicleMake;
use App\Services\VehicleSyncService;
use Illuminate\Console\Command;

class SyncNhtsaAllCommand extends Command
{
    protected $signature = 'vehicle:sync {--priority : Sync only regional priority makes}';
    protected $description = 'Sync vehicle manufacturers and their key models from NHTSA vPIC';

    public function handle(VehicleSyncService $syncService): int
    {
        $this->info("Step 1/2: Syncing vehicle makes...");
        $makeLog = $syncService->syncMakes(true);
        $this->info("Makes synced: {$makeLog->records_created} created, {$makeLog->records_updated} updated.");

        $this->info("Step 2/2: Syncing models for key regional makes...");
        $makes = VehicleMake::whereIn('name_en', ['Toyota', 'Hyundai', 'Nissan', 'Lexus', 'Honda', 'Kia'])
            ->get();

        foreach ($makes as $make) {
            $this->line("  -> Syncing models for {$make->name_en}...");
            $syncService->syncModelsForMake($make);
        }

        $this->info("Vehicle database sync finished successfully!");
        return Command::SUCCESS;
    }
}
