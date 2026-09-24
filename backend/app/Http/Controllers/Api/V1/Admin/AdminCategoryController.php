<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Category;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    public function index(Request $request): JsonResponse
    {
        $categories = Category::with('children')->orderBy('sort_order', 'asc')->get();
        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'slug' => 'nullable|string|max:200|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'icon_url' => 'nullable|string|max:500',
            'image_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name_en']);
            if (Category::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] .= '-' . Str::random(4);
            }
        }

        $category = Category::create($validated);

        $this->audit->log($request, 'CATEGORY_CREATED', 'category', (string)$category->id, null, $category->toArray(), "Created category {$category->name_en}");

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $old = $category->toArray();

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:150',
            'name_en' => 'sometimes|string|max:150',
            'slug' => 'sometimes|string|max:200|unique:categories,slug,' . $id,
            'parent_id' => 'nullable|exists:categories,id',
            'icon_url' => 'nullable|string|max:500',
            'image_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        $this->audit->log($request, 'CATEGORY_UPDATED', 'category', (string)$category->id, $old, $category->fresh()->toArray(), "Updated category {$category->name_en}");

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category->fresh(),
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $old = $category->toArray();

        $category->delete();

        $this->audit->log($request, 'CATEGORY_DELETED', 'category', (string)$id, $old, null, "Deleted category {$old['name_en']}");

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
