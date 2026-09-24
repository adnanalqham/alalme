<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\GarageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class GarageController extends Controller
{
    protected GarageService $garageService;

    public function __construct(GarageService $garageService)
    {
        $this->garageService = $garageService;
    }

    protected function getUserId(Request $request): string
    {
        /** @var \App\Models\User|null $user */
        $user = $request->user();
        return (string) ($user?->id ?? 'user_anonymous');
    }

    /**
     * GET /api/v1/me/vehicles
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);
        $vehicles = $this->garageService->getUserVehicles($userId);

        return response()->json([
            'data' => $vehicles,
        ]);
    }

    /**
     * POST /api/v1/me/vehicles
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'make_id' => 'required|integer|exists:vehicle_makes,id',
            'model_id' => 'required|integer|exists:vehicle_models,id',
            'year' => 'nullable|integer|min:1970|max:' . (date('Y') + 1),
            'vehicle_spec_id' => 'nullable|integer|exists:vehicle_specs,id',
            'nickname' => 'nullable|string|max:100',
            'vin' => 'nullable|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        $userId = $this->getUserId($request);
        $vehicle = $this->garageService->addVehicle($userId, $validated);

        return response()->json([
            'message' => 'Vehicle saved to garage successfully.',
            'data' => $vehicle,
        ], 201);
    }

    /**
     * DELETE /api/v1/me/vehicles/{id}
     */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);
        $this->garageService->deleteVehicle($userId, $id);

        return response()->json([
            'message' => 'Vehicle removed from garage successfully.',
        ]);
    }

    /**
     * POST /api/v1/me/vehicles/{id}/default
     */
    public function setDefault(int $id, Request $request): JsonResponse
    {
        $userId = $this->getUserId($request);
        $vehicle = $this->garageService->setDefaultVehicle($userId, $id);

        return response()->json([
            'message' => 'Default vehicle updated successfully.',
            'data' => $vehicle,
        ]);
    }
}
