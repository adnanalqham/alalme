<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleModelYear;
use App\Models\VehicleSpec;
use App\Models\VehicleSyncLog;
use App\Services\VehicleSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class VehicleSyncController extends Controller
{
    protected VehicleSyncService $syncService;

    public function __construct(VehicleSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * POST /api/v1/admin/vehicles/sync
     */
    public function sync(Request $request): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Administrative privileges required.',
            ], 403);
        }

        $type = (string) $request->input('type', 'makes');

        if ($type === 'makes') {
            $priorityOnly = $request->boolean('priority_only', true);
            $log = $this->syncService->syncMakes($priorityOnly);
            return response()->json([
                'message' => 'Vehicle makes sync completed.',
                'log' => $log,
            ]);
        }

        if ($type === 'models') {
            $makeId = (int) $request->input('make_id');
            $make = VehicleMake::findOrFail($makeId);
            $log = $this->syncService->syncModelsForMake($make);
            return response()->json([
                'message' => "Models sync completed for {$make->name_en}.",
                'log' => $log,
            ]);
        }

        return response()->json(['error' => 'Invalid sync type specified.'], 400);
    }

    /**
     * GET /api/v1/admin/vehicles/sync-status
     */
    public function status(Request $request): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Administrative privileges required.',
            ], 403);
        }

        $totalMakes = VehicleMake::count();
        $totalModels = VehicleModel::count();
        $totalYears = VehicleModelYear::count();
        $totalSpecs = VehicleSpec::count();
        $recentLogs = VehicleSyncLog::orderBy('started_at', 'desc')->limit(10)->get();

        return response()->json([
            'stats' => [
                'total_makes' => $totalMakes,
                'total_models' => $totalModels,
                'total_model_years' => $totalYears,
                'total_specifications' => $totalSpecs,
            ],
            'recent_logs' => $recentLogs,
        ]);
    }
}
