<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Product;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminProductController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['shop:id,name_ar,name_en,city', 'category:id,name_ar,name_en', 'manufacturer:id,name_ar,name_en']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%")
                  ->orWhere('part_number', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($shopId = $request->query('shop_id')) {
            $query->where('shop_id', $shopId);
        }

        $products = $query->orderBy('created_at', 'desc')->paginate(25);

        return response()->json($products);
    }

    public function show($id): JsonResponse
    {
        $product = Product::with(['shop', 'category', 'manufacturer', 'images', 'compatibilities', 'inventories.branch'])
            ->findOrFail($id);

        return response()->json(['data' => $product]);
    }

    public function disable(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $oldStatus = $product->status;

        $product->update(['status' => 'SUSPENDED_BY_ADMIN']);

        $this->audit->log(
            $request,
            'PRODUCT_DISABLED',
            'product',
            $product->id,
            ['status' => $oldStatus],
            ['status' => 'SUSPENDED_BY_ADMIN'],
            $request->input('reason', 'Disabled by administrator')
        );

        return response()->json([
            'message' => 'Product disabled by admin',
            'data' => $product->fresh(),
        ]);
    }

    public function enable(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $oldStatus = $product->status;

        $product->update(['status' => 'ACTIVE']);

        $this->audit->log(
            $request,
            'PRODUCT_ENABLED',
            'product',
            $product->id,
            ['status' => $oldStatus],
            ['status' => 'ACTIVE'],
            'Enabled by administrator'
        );

        return response()->json([
            'message' => 'Product activated',
            'data' => $product->fresh(),
        ]);
    }
}
