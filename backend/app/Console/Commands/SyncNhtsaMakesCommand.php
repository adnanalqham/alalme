<?php

namespace App\Console\Commands;

use App\Services\VehicleSyncService;
use Illuminate\Console\Command;

class SyncNhtsaMakesCommand extends Command
{
    protected $signature = 'vehicle:sync-makes {--all : Sync full global list instead of curated regional priority list}';
    protected $description = 'Sync vehicle manufacturers (makes) from NHTSA vPIC into PostgreSQL database';

    public function handle(VehicleSyncService $syncService): int
    {
        $all = (bool) $this->option('all');
        $this->info($all ? 'Starting FULL NHTSA makes sync...' : 'Syncing priority regional makes (Toyota, Nissan, Hyundai, Lexus, etc.)...');

        $log = $syncService->syncMakes(!$all);

        if ($log->status === 'SUCCESS') {
            $this->info("Completed successfully! Processed: {$log->records_processed}, Created: {$log->records_created}, Updated: {$log->records_updated}");
            return Command::SUCCESS;
        }

        $this->error("Sync failed: {$log->error_message}");
        return Command::FAILURE;
    }
}
