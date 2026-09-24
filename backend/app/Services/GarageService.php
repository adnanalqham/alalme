<?php

namespace App\Services;

use App\Models\UserVehicle;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleModelYear;
use App\Models\VehicleSpec;
use Exception;
use Illuminate\Support\Facades\DB;

class GarageService
{
    /**
     * List all vehicles in user's garage.
     */
    public function getUserVehicles(string $userId): array
    {
        $vehicles = UserVehicle::with(['make', 'model', 'modelYear', 'specification'])
            ->where('user_id', $userId)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $vehicles->map(function ($v) {
            return [
                'id' => $v->id,
                'make_id' => $v->make_id,
                'make' => [
                    'id' => $v->make->id,
                    'name_en' => $v->make->name_en,
                    'name_ar' => $v->make->name_ar ?? $v->make->name_en,
                ],
                'model_id' => $v->model_id,
                'model' => [
                    'id' => $v->model->id,
                    'name_en' => $v->model->name_en,
                    'name_ar' => $v->model->name_ar ?? $v->model->name_en,
                ],
                'year' => $v->modelYear ? $v->modelYear->year : null,
                'specification' => $v->specification ? [
                    'id' => $v->specification->id,
                    'trim' => $v->specification->trim,
                    'engine' => $v->specification->getEngineSummary(),
                    'fuel_type' => $v->specification->fuel_type,
                    'drive_type' => $v->specification->drive_type,
                ] : null,
                'nickname' => $v->nickname,
                'vin' => $v->vin,
                'is_default' => (bool) $v->is_default,
                'created_at' => $v->created_at->toISOString(),
            ];
        })->toArray();
    }

    /**
     * Add a vehicle to user's garage.
     */
    public function addVehicle(string $userId, array $data): UserVehicle
    {
        // Validation: verify make & model
        $make = VehicleMake::findOrFail($data['make_id']);
        $model = VehicleModel::where('id', $data['model_id'])
            ->where('make_id', $make->id)
            ->firstOrFail();

        $yearId = null;
        if (!empty($data['year'])) {
            $yearRecord = VehicleModelYear::firstOrCreate([
                'model_id' => $model->id,
                'year' => (int) $data['year'],
            ], [
                'source' => 'manual',
                'source_updated_at' => now(),
            ]);
            $yearId = $yearRecord->id;
        }

        $specId = null;
        if (!empty($data['vehicle_spec_id'])) {
            $spec = VehicleSpec::where('id', $data['vehicle_spec_id'])
                ->where('model_id', $model->id)
                ->first();
            if ($spec) {
                $specId = $spec->id;
            }
        }

        return DB::transaction(function () use ($userId, $make, $model, $yearId, $specId, $data) {
            $isFirst = UserVehicle::where('user_id', $userId)->count() === 0;
            $isDefault = $isFirst || !empty($data['is_default']);

            if ($isDefault) {
                UserVehicle::where('user_id', $userId)->update(['is_default' => false]);
            }

            return UserVehicle::create([
                'user_id' => $userId,
                'make_id' => $make->id,
                'model_id' => $model->id,
                'year_id' => $yearId,
                'vehicle_spec_id' => $specId,
                'nickname' => $data['nickname'] ?? null,
                'vin' => $data['vin'] ?? null,
                'is_default' => $isDefault,
            ]);
        });
    }

    /**
     * Delete vehicle from user's garage.
     */
    public function deleteVehicle(string $userId, int $vehicleId): bool
    {
        $vehicle = UserVehicle::where('user_id', $userId)->where('id', $vehicleId)->firstOrFail();
        $wasDefault = $vehicle->is_default;

        $deleted = $vehicle->delete();

        // If deleted was default, set the latest remaining vehicle as default
        if ($wasDefault) {
            $latest = UserVehicle::where('user_id', $userId)->latest()->first();
            if ($latest) {
                $latest->update(['is_default' => true]);
            }
        }

        return (bool) $deleted;
    }

    /**
     * Set a vehicle as default.
     */
    public function setDefaultVehicle(string $userId, int $vehicleId): UserVehicle
    {
        return DB::transaction(function () use ($userId, $vehicleId) {
            $target = UserVehicle::where('user_id', $userId)->where('id', $vehicleId)->firstOrFail();
            UserVehicle::where('user_id', $userId)->update(['is_default' => false]);
            $target->update(['is_default' => true]);
            return $target;
        });
    }
}
