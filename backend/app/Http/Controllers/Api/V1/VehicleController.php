<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\VehicleService;
use App\Services\NhtsaVehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class VehicleController extends Controller
{
    protected VehicleService $vehicleService;
    protected NhtsaVehicleService $nhtsaService;

    public function __construct(VehicleService $vehicleService, NhtsaVehicleService $nhtsaService)
    {
        $this->vehicleService = $vehicleService;
        $this->nhtsaService = $nhtsaService;
    }

    /**
     * GET /api/v1/vehicles/makes
     */
    public function makes(): JsonResponse
    {
        $makes = $this->vehicleService->getMakes();
        return response()->json([
            'data' => $makes,
        ]);
    }

    /**
     * GET /api/v1/vehicles/makes/{make}/models
     */
    public function models(int $makeId, Request $request): JsonResponse
    {
        $year = $request->has('year') ? (int) $request->query('year') : null;
        $models = $this->vehicleService->getModels($makeId, $year);

        return response()->json([
            'data' => $models,
        ]);
    }

    /**
     * GET /api/v1/vehicles/models/{model}/years
     */
    public function years(int $modelId): JsonResponse
    {
        $years = $this->vehicleService->getYears($modelId);

        return response()->json([
            'data' => $years,
        ]);
    }

    /**
     * GET /api/v1/vehicles/{model}/specifications?year=2020
     */
    public function specifications(int $modelId, Request $request): JsonResponse
    {
        $year = $request->has('year') ? (int) $request->query('year') : null;
        $specs = $this->vehicleService->getSpecifications($modelId, $year);

        return response()->json([
            'data' => $specs,
        ]);
    }

    /**
     * GET /api/v1/vehicles/search?q=Toyota
     */
    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->query('q', '');
        $results = $this->vehicleService->search($query);

        return response()->json([
            'data' => $results,
        ]);
    }

    /**
     * POST /api/v1/vehicles/decode-vin
     */
    public function decodeVin(Request $request): JsonResponse
    {
        $request->validate([
            'vin' => 'required|string|min:11|max:17',
        ]);

        $decoded = $this->nhtsaService->decodeVin($request->input('vin'));

        if (!$decoded) {
            return response()->json([
                'message' => 'Unable to decode VIN number.',
            ], 422);
        }

        return response()->json([
            'data' => $decoded,
        ]);
    }
}
