<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Models\ShopBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class ShopBranchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $branches = ShopBranch::where('shop_id', $shop->id)->get();

        return response()->json(['data' => $branches]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'name_ar' => 'required|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:32',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_main' => 'nullable|boolean',
        ]);

        $branch = ShopBranch::create([
            'id' => 'br_' . Str::random(12),
            'shop_id' => $shop->id,
            'name_ar' => $validated['name_ar'],
            'name_en' => $validated['name_en'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'is_main' => $validated['is_main'] ?? false,
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'message' => 'Branch created successfully',
            'data' => $branch,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $branch = ShopBranch::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:150',
            'name_en' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:32',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
            'is_main' => 'nullable|boolean',
        ]);

        $branch->update($validated);

        return response()->json([
            'message' => 'Branch updated successfully',
            'data' => $branch,
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $branch = ShopBranch::where('shop_id', $shop->id)->findOrFail($id);
        $branch->delete();

        return response()->json(['message' => 'Branch deleted successfully']);
    }
}
