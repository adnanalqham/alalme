<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Banner;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminBannerController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    public function index(Request $request): JsonResponse
    {
        $banners = Banner::orderBy('sort_order', 'asc')->get();
        return response()->json(['data' => $banners]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title_ar' => 'required|string|max:200',
            'title_en' => 'nullable|string|max:200',
            'image_url' => 'required|string|max:500',
            'link_url' => 'nullable|string|max:500',
            'placement' => 'nullable|in:HOME,SEARCH,CATEGORY',
            'target' => 'nullable|in:ALL,CUSTOMER,SHOP_OWNER',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $banner = Banner::create($validated);

        $this->audit->log($request, 'BANNER_CREATED', 'banner', (string)$banner->id, null, $banner->toArray(), "Created banner {$banner->title_ar}");

        return response()->json([
            'message' => 'Banner created successfully',
            'data' => $banner,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $old = $banner->toArray();

        $validated = $request->validate([
            'title_ar' => 'sometimes|string|max:200',
            'title_en' => 'nullable|string|max:200',
            'image_url' => 'sometimes|string|max:500',
            'link_url' => 'nullable|string|max:500',
            'placement' => 'sometimes|in:HOME,SEARCH,CATEGORY',
            'target' => 'sometimes|in:ALL,CUSTOMER,SHOP_OWNER',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $banner->update($validated);

        $this->audit->log($request, 'BANNER_UPDATED', 'banner', (string)$banner->id, $old, $banner->fresh()->toArray(), "Updated banner {$banner->title_ar}");

        return response()->json([
            'message' => 'Banner updated successfully',
            'data' => $banner->fresh(),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $old = $banner->toArray();

        $banner->delete();

        $this->audit->log($request, 'BANNER_DELETED', 'banner', (string)$id, $old, null, "Deleted banner {$old['title_ar']}");

        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
