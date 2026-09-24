<?php

namespace App\Services;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleModelYear;
use App\Models\VehicleSyncLog;
use App\Models\VehicleAlias;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class VehicleSyncService
{
    protected NhtsaVehicleService $nhtsaService;

    // Curated priority makes in regional market with their Arabic names
    public const PRIORITY_REGIONAL_MAKES = [
        448 => ['name_en' => 'Toyota', 'name_ar' => 'تويوتا'],
        478 => ['name_en' => 'Nissan', 'name_ar' => 'نيسان'],
        498 => ['name_en' => 'Hyundai', 'name_ar' => 'هيونداي'],
        515 => ['name_en' => 'Lexus', 'name_ar' => 'لكزس'],
        474 => ['name_en' => 'Honda', 'name_ar' => 'هوندا'],
        499 => ['name_en' => 'Kia', 'name_ar' => 'كيا'],
        460 => ['name_en' => 'Ford', 'name_ar' => 'فورد'],
        467 => ['name_en' => 'Chevrolet', 'name_ar' => 'شفروليه'],
        473 => ['name_en' => 'Mazda', 'name_ar' => 'مازدا'],
        481 => ['name_en' => 'Mitsubishi', 'name_ar' => 'ميتسوبيشي'],
        449 => ['name_en' => 'Mercedes-Benz', 'name_ar' => 'مرسيدس بنز'],
        452 => ['name_en' => 'BMW', 'name_ar' => 'BMW'],
    ];

    public function __construct(NhtsaVehicleService $nhtsaService)
    {
        $this->nhtsaService = $nhtsaService;
    }

    /**
     * Controlled sync of primary vehicle makes into PostgreSQL.
     */
    public function syncMakes(bool $priorityOnly = true): VehicleSyncLog
    {
        $log = VehicleSyncLog::create([
            'type' => 'makes',
            'status' => 'RUNNING',
            'started_at' => now(),
        ]);

        try {
            if ($priorityOnly) {
                $processed = 0;
                $created = 0;
                $updated = 0;

                foreach (self::PRIORITY_REGIONAL_MAKES as $nhtsaId => $meta) {
                    $processed++;
                    $make = VehicleMake::firstOrNew(['nhtsa_make_id' => $nhtsaId]);

                    $isNew = !$make->exists;
                    $make->name_en = $meta['name_en'];
                    if (empty($make->name_ar)) {
                        $make->name_ar = $meta['name_ar'];
                    }
                    $make->slug = Str::slug($meta['name_en']);
                    $make->source = 'nhtsa';
                    $make->source_updated_at = now();
                    $make->is_active = true;

                    // Automatically resolve brand logo unless manually customized by Admin
                    if (!$make->isManualLogo()) {
                        $logoMeta = BrandLogoResolver::resolve($make->name_en, $make->name_ar);
                        $make->logo_url = $logoMeta['logo_url'];
                        $make->logo_status = $logoMeta['logo_status'];
                        $make->logo_license = $logoMeta['logo_license'];
                        $make->logo_source = 'auto';
                    }

                    $make->save();

                    if ($isNew) {
                        $created++;
                        // Add Arabic and English aliases
                        $this->createAliases('make', $make->id, [
                            $meta['name_en'],
                            $meta['name_ar'],
                        ]);
                    } else {
                        $updated++;
                    }
                }

                $log->update([
                    'status' => 'SUCCESS',
                    'records_processed' => $processed,
                    'records_created' => $created,
                    'records_updated' => $updated,
                    'finished_at' => now(),
                ]);

                return $log;
            }

            // Full NHTSA GetAllMakes sync
            $externalMakes = $this->nhtsaService->getAllMakes();
            $processed = count($externalMakes);
            $created = 0;
            $updated = 0;

            foreach ($externalMakes as $item) {
                $make = VehicleMake::firstOrNew(['nhtsa_make_id' => $item['nhtsa_make_id']]);
                $isNew = !$make->exists;

                $make->name_en = $item['name_en'];
                $make->slug = Str::slug($item['name_en'] . '-' . $item['nhtsa_make_id']);
                $make->source = 'nhtsa';
                $make->source_updated_at = now();

                if (!$make->isManualLogo()) {
                    $logoMeta = BrandLogoResolver::resolve($item['name_en'], $make->name_ar);
                    $make->logo_url = $logoMeta['logo_url'];
                    $make->logo_status = $logoMeta['logo_status'];
                    $make->logo_license = $logoMeta['logo_license'];
                    $make->logo_source = 'auto';
                }

                $make->save();

                $isNew ? $created++ : $updated++;
            }

            $log->update([
                'status' => 'SUCCESS',
                'records_processed' => $processed,
                'records_created' => $created,
                'records_updated' => $updated,
                'finished_at' => now(),
            ]);

        } catch (Exception $e) {
            Log::error("Failed to sync vehicle makes: " . $e->getMessage());
            $log->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);
        }

        return $log;
    }

    /**
     * Controlled sync of models for a specific make.
     */
    public function syncModelsForMake(VehicleMake $make): VehicleSyncLog
    {
        $log = VehicleSyncLog::create([
            'type' => 'models',
            'status' => 'RUNNING',
            'started_at' => now(),
        ]);

        try {
            if (!$make->nhtsa_make_id) {
                throw new Exception("Vehicle make {$make->name_en} does not have an NHTSA Make ID.");
            }

            $externalModels = $this->nhtsaService->getModelsForMakeId($make->nhtsa_make_id);
            $processed = count($externalModels);
            $created = 0;
            $updated = 0;

            foreach ($externalModels as $item) {
                $slug = Str::slug($item['name_en']);
                if (empty($slug)) {
                    $slug = 'model-' . $item['nhtsa_model_id'];
                }

                $model = VehicleModel::firstOrNew([
                    'make_id' => $make->id,
                    'slug' => $slug,
                ]);

                $isNew = !$model->exists;
                $model->name_en = $item['name_en'];
                $model->nhtsa_model_id = $item['nhtsa_model_id'];
                $model->source = 'nhtsa';
                $model->source_updated_at = now();
                $model->is_active = true;
                $model->save();

                if ($isNew) {
                    $created++;
                    $this->createAliases('model', $model->id, [$item['name_en']]);
                } else {
                    $updated++;
                }
            }

            $log->update([
                'status' => 'SUCCESS',
                'records_processed' => $processed,
                'records_created' => $created,
                'records_updated' => $updated,
                'finished_at' => now(),
            ]);

        } catch (Exception $e) {
            Log::error("Failed to sync models for make {$make->name_en}: " . $e->getMessage());
            $log->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);
        }

        return $log;
    }

    /**
     * Seed years (e.g. 2010 to 2026) for active models.
     */
    public function syncStandardYears(VehicleModel $model, int $startYear = 2010, int $endYear = 2026): int
    {
        $created = 0;
        for ($yr = $endYear; $yr >= $startYear; $yr--) {
            $yearRecord = VehicleModelYear::firstOrCreate(
                ['model_id' => $model->id, 'year' => $yr],
                ['source' => 'nhtsa', 'source_updated_at' => now()]
            );
            if ($yearRecord->wasRecentlyCreated) {
                $created++;
            }
        }
        return $created;
    }

    protected function createAliases(string $entityType, int $entityId, array $aliases): void
    {
        foreach ($aliases as $alias) {
            if (empty($alias)) continue;
            $normalized = VehicleAlias::normalize($alias);

            VehicleAlias::firstOrCreate([
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'normalized_alias' => $normalized,
            ], [
                'language' => preg_match('/[\p{Arabic}]/u', $alias) ? 'ar' : 'en',
                'alias' => $alias,
                'created_at' => now(),
            ]);
        }
    }
}
