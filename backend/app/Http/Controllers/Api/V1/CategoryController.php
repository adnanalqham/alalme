<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CategoryController extends Controller
{
    /**
     * Get category tree or list of active categories.
     */
    public function index(Request $request): JsonResponse
    {
        $parentId = $request->query('parent_id');
        $tree = $request->boolean('tree', false);

        $query = Category::where('is_active', true)->orderBy('sort_order', 'asc')->orderBy('name_ar', 'asc');

        if ($tree) {
            $categories = Category::where('is_active', true)
                ->whereNull('parent_id')
                ->with(['children' => function ($q) {
                    $q->where('is_active', true)->orderBy('sort_order', 'asc');
                }])
                ->orderBy('sort_order', 'asc')
                ->get();
            return response()->json(['data' => $categories]);
        }

        if ($parentId !== null) {
            if ($parentId === 'null' || $parentId === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $parentId);
            }
        }

        $categories = $query->get();

        return response()->json(['data' => $categories]);
    }

    /**
     * Show single category with children.
     */
    public function show($id): JsonResponse
    {
        $category = Category::with(['children' => function ($q) {
            $q->where('is_active', true)->orderBy('sort_order', 'asc');
        }])->findOrFail($id);

        return response()->json(['data' => $category]);
    }
}
