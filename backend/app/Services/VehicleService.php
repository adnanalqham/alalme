<?php

namespace App\Services;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleModelYear;
use App\Models\VehicleSpec;
use App\Models\VehicleAlias;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VehicleService
{
    protected NhtsaVehicleService $nhtsa;
    protected VehicleSyncService $sync;

    public function __construct(NhtsaVehicleService $nhtsa, VehicleSyncService $sync)
    {
        $this->nhtsa = $nhtsa;
        $this->sync = $sync;
    }

    /**
     * Get active vehicle makes with caching and localized names.
     */
    public function getMakes(): array
    {
        $ttl = config('vehicles.cache.makes_ttl', 604800);

        return Cache::remember('vehicle:makes:active', $ttl, function () {
            $makes = VehicleMake::where('is_active', true)
                ->orderByRaw("CASE WHEN name_en IN ('Toyota', 'Hyundai', 'Nissan', 'Lexus', 'Honda', 'Kia', 'Ford') THEN 0 ELSE 1 END")
                ->orderBy('name_en', 'asc')
                ->get();

            return $makes->map(function ($m) {
                $logoUrl = $m->logo_url;
                $logoStatus = $m->logo_status;
                $logoSource = $m->logo_source ?? 'auto';

                if (empty($logoUrl) && $logoSource !== 'manual') {
                    $resolved = BrandLogoResolver::resolve($m->name_en, $m->name_ar);
                    $logoUrl = $resolved['logo_url'];
                    $logoStatus = $resolved['logo_status'];
                }

                return [
                    'id' => $m->id,
                    'nhtsa_make_id' => $m->nhtsa_make_id,
                    'name' => [
                        'ar' => $m->name_ar ?? $m->name_en,
                        'en' => $m->name_en,
                    ],
                    'slug' => $m->slug,
                    'logo_url' => $logoUrl,
                    'logo_status' => $logoStatus ?? ($logoUrl ? 'available' : 'missing'),
                    'logo_source' => $logoSource,
                ];
            })->toArray();
        });
    }

    /**
     * Get models for a make, with optional year filter.
     * Database-First: Fetches from PostgreSQL. If empty and NHTSA ID exists, lazy-loads from NHTSA.
     */
    public function getModels(int $makeId, ?int $year = null): array
    {
        $cacheKey = "vehicle:models:{$makeId}:" . ($year ?? 'all');
        $ttl = config('vehicles.cache.models_ttl', 604800);

        return Cache::remember($cacheKey, $ttl, function () use ($makeId, $year) {
            $make = VehicleMake::find($makeId);
            if (!$make) {
                return [];
            }

            // 1. Query PostgreSQL
            $query = VehicleModel::where('make_id', $makeId)
                ->where('is_active', true);

            if ($year) {
                $query->whereHas('modelYears', function ($q) use ($year) {
                    $q->where('year', $year);
                });
            }

            $models = $query->orderBy('name_en', 'asc')->get();

            // 2. Database-First fallback: If no models found in DB but Make has NHTSA ID, lazy-sync from NHTSA
            if ($models->isEmpty() && $make->nhtsa_make_id) {
                try {
                    $this->sync->syncModelsForMake($make);
                    $models = VehicleModel::where('make_id', $makeId)
                        ->where('is_active', true)
                        ->orderBy('name_en', 'asc')
                        ->get();
                } catch (Exception $e) {
                    Log::warning("NHTSA lazy loading failed for make {$makeId}: " . $e->getMessage());
                }
            }

            return $models->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'make_id' => $mod->make_id,
                    'nhtsa_model_id' => $mod->nhtsa_model_id,
                    'name' => [
                        'ar' => $mod->name_ar ?? $mod->name_en,
                        'en' => $mod->name_en,
                    ],
                    'slug' => $mod->slug,
                ];
            })->toArray();
        });
    }

    /**
     * Get years available for a model.
     */
    public function getYears(int $modelId): array
    {
        $cacheKey = "vehicle:years:{$modelId}";
        $ttl = config('vehicles.cache.years_ttl', 604800);

        return Cache::remember($cacheKey, $ttl, function () use ($modelId) {
            $years = VehicleModelYear::where('model_id', $modelId)
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->toArray();

            // Default fallback years (2026 to 2010) if not explicitly set
            if (empty($years)) {
                $model = VehicleModel::find($modelId);
                if ($model) {
                    $this->sync->syncStandardYears($model, 2010, 2026);
                    $years = VehicleModelYear::where('model_id', $modelId)
                        ->orderBy('year', 'desc')
                        ->pluck('year')
                        ->toArray();
                }
            }

            return $years;
        });
    }

    /**
     * Get vehicle technical specifications for a model & year.
     */
    public function getSpecifications(int $modelId, ?int $year = null): array
    {
        $cacheKey = "vehicle:specs:{$modelId}:" . ($year ?? 'all');
        $ttl = config('vehicles.cache.specs_ttl', 604800);

        return Cache::remember($cacheKey, $ttl, function () use ($modelId, $year) {
            $query = VehicleSpec::where('model_id', $modelId);
            if ($year) {
                $query->where('model_year', $year);
            }

            $specs = $query->get();

            return $specs->map(function ($s) {
                return [
                    'id' => $s->id,
                    'year' => $s->model_year,
                    'trim' => $s->trim,
                    'body_class' => $s->body_class,
                    'doors' => $s->doors,
                    'engine_cylinders' => $s->engine_cylinders,
                    'engine_displacement_cc' => $s->engine_displacement_cc,
                    'engine_hp' => $s->engine_hp,
                    'fuel_type' => $s->fuel_type,
                    'drive_type' => $s->drive_type,
                    'transmission_style' => $s->transmission_style,
                ];
            })->toArray();
        });
    }

    /**
     * Normalized bilingual vehicle search (Arabic & English).
     */
    public function search(string $query): array
    {
        $cleanQuery = trim($query);
        if (mb_strlen($cleanQuery, 'UTF-8') < 2) {
            return [];
        }

        $normalized = VehicleAlias::normalize($cleanQuery);
        $ttl = config('vehicles.cache.search_ttl', 86400);

        return Cache::remember("vehicle:search:{$normalized}", $ttl, function () use ($cleanQuery, $normalized) {
            // Find matches via Alias table
            $aliasMatches = VehicleAlias::where('normalized_alias', 'LIKE', "%{$normalized}%")
                ->limit(20)
                ->get();

            $makeIds = $aliasMatches->where('entity_type', 'make')->pluck('entity_id')->toArray();
            $modelIds = $aliasMatches->where('entity_type', 'model')->pluck('entity_id')->toArray();

            // Direct make matches
            $makes = VehicleMake::whereIn('id', $makeIds)
                ->orWhere('name_en', 'ILIKE', "%{$cleanQuery}%")
                ->orWhere('name_ar', 'LIKE', "%{$cleanQuery}%")
                ->where('is_active', true)
                ->limit(10)
                ->get();

            // Direct model matches with parent make
            $models = VehicleModel::with('make')
                ->whereIn('id', $modelIds)
                ->orWhere('name_en', 'ILIKE', "%{$cleanQuery}%")
                ->orWhere('name_ar', 'LIKE', "%{$cleanQuery}%")
                ->where('is_active', true)
                ->limit(15)
                ->get();

            return [
                'makes' => $makes->map(fn($m) => [
                    'id' => $m->id,
                    'name' => ['ar' => $m->name_ar ?? $m->name_en, 'en' => $m->name_en],
                    'slug' => $m->slug,
                ])->toArray(),
                'models' => $models->map(fn($mod) => [
                    'id' => $mod->id,
                    'make_id' => $mod->make_id,
                    'make_name' => ['ar' => $mod->make->name_ar ?? $mod->make->name_en, 'en' => $mod->make->name_en],
                    'name' => ['ar' => $mod->name_ar ?? $mod->name_en, 'en' => $mod->name_en],
                    'slug' => $mod->slug,
                ])->toArray(),
            ];
        });
    }
}
