<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\AuditLog;
use App\Models\City;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminGeographyController extends Controller
{
    /**
     * GET /api/v1/admin/geography/countries
     * List all countries with their city count.
     */
    public function countries(Request $request): JsonResponse
    {
        $countries = Country::withCount('cities')->orderBy('name_ar')->get();

        return response()->json([
            'countries' => $countries,
        ]);
    }

    /**
     * POST /api/v1/admin/geography/countries
     * Create or update a country.
     */
    public function storeCountry(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('geography.manage')) {
            return response()->json(['error' => 'Forbidden: You lack geography.manage permission.'], 403);
        }

        $validated = $request->validate([
            'id' => 'required|string|max:16|unique:countries,id',
            'name_ar' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'code' => 'required|string|max:4|unique:countries,code',
            'phone_code' => 'nullable|string|max:10',
            'currency_code' => 'required|string|max:8',
            'is_active' => 'boolean',
        ]);

        $country = Country::create($validated);

        AuditLog::create([
            'user_id' => $user?->id ?? 'system',
            'action' => 'CREATE',
            'entity_type' => 'Country',
            'entity_id' => $country->id,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Country created successfully.',
            'country' => $country,
        ], 201);
    }

    /**
     * PUT /api/v1/admin/geography/countries/{id}
     */
    public function updateCountry(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('geography.manage')) {
            return response()->json(['error' => 'Forbidden: You lack geography.manage permission.'], 403);
        }

        $country = Country::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:100',
            'name_en' => 'sometimes|string|max:100',
            'phone_code' => 'nullable|string|max:10',
            'currency_code' => 'sometimes|string|max:8',
            'is_active' => 'sometimes|boolean',
        ]);

        $old = $country->toArray();
        $country->update($validated);

        AuditLog::create([
            'user_id' => $user?->id ?? 'system',
            'action' => 'UPDATE',
            'entity_type' => 'Country',
            'entity_id' => $country->id,
            'old_values' => $old,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Country updated successfully.',
            'country' => $country,
        ]);
    }

    /**
     * GET /api/v1/admin/geography/cities
     * List cities, optionally filter by country_id.
     */
    public function cities(Request $request): JsonResponse
    {
        $countryId = $request->query('country_id');

        $query = City::with('country');
        if ($countryId) {
            $query->where('country_id', $countryId);
        }

        $cities = $query->orderBy('name_ar')->get();

        return response()->json([
            'cities' => $cities,
        ]);
    }

    /**
     * POST /api/v1/admin/geography/cities
     */
    public function storeCity(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('geography.manage')) {
            return response()->json(['error' => 'Forbidden: You lack geography.manage permission.'], 403);
        }

        $validated = $request->validate([
            'id' => 'required|string|max:32|unique:cities,id',
            'country_id' => 'required|string|exists:countries,id',
            'name_ar' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'is_active' => 'boolean',
        ]);

        $city = City::create($validated);

        AuditLog::create([
            'user_id' => $user?->id ?? 'system',
            'action' => 'CREATE',
            'entity_type' => 'City',
            'entity_id' => $city->id,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'City created successfully.',
            'city' => $city->load('country'),
        ], 201);
    }

    /**
     * PUT /api/v1/admin/geography/cities/{id}
     */
    public function updateCity(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('geography.manage')) {
            return response()->json(['error' => 'Forbidden: You lack geography.manage permission.'], 403);
        }

        $city = City::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:100',
            'name_en' => 'sometimes|string|max:100',
            'is_active' => 'sometimes|boolean',
        ]);

        $old = $city->toArray();
        $city->update($validated);

        AuditLog::create([
            'user_id' => $user?->id ?? 'system',
            'action' => 'UPDATE',
            'entity_type' => 'City',
            'entity_id' => $city->id,
            'old_values' => $old,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'City updated successfully.',
            'city' => $city->load('country'),
        ]);
    }
}
