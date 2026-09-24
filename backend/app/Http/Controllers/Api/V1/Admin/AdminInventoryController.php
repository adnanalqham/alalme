<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminInventoryController extends Controller
{
    /**
     * Platform-wide inventory oversight with low stock and search filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::with([
            'product:id,name_ar,name_en,part_number,oem_number,price,shop_id',
            'product.images',
            'shop:id,name_ar,name_en,city',
            'branch:id,name_ar,name_en',
        ]);

        if ($shopId = $request->query('shop_id')) {
            $query->where('shop_id', $shopId);
        }

        if ($request->boolean('low_stock', false)) {
            $query->whereColumn('quantity', '<=', 'low_stock_threshold');
        }

        if ($request->boolean('out_of_stock', false)) {
            $query->where('quantity', '<=', 0);
        }

        if ($search = $request->query('search')) {
            $query->whereHas('product', function ($pq) use ($search) {
                $pq->where('name_ar', 'ilike', "%{$search}%")
                   ->orWhere('name_en', 'ilike', "%{$search}%")
                   ->orWhere('part_number', 'ilike', "%{$search}%")
                   ->orWhere('oem_number', 'ilike', "%{$search}%");
            });
        }

        $inventories = $query->orderBy('quantity', 'asc')->paginate(30);

        return response()->json($inventories);
    }
}
