<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Models\Order;
use App\Models\OrderShopGroup;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ShopController extends Controller
{
    /**
     * Public list of approved active shops.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Shop::where('status', 'ACTIVE')
            ->with(['branches' => function ($q) {
                $q->where('status', 'ACTIVE');
            }])
            ->withCount(['products' => function ($q) {
                $q->where('status', 'ACTIVE');
            }]);

        if ($city = $request->query('city')) {
            $query->where('city', 'ilike', "%{$city}%");
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%")
                  ->orWhere('description_ar', 'ilike', "%{$search}%");
            });
        }

        $shops = $query->orderBy('rating', 'desc')->paginate(20);

        return response()->json($shops);
    }

    /**
     * Public show single shop.
     */
    public function show($id): JsonResponse
    {
        $shop = Shop::where('status', 'ACTIVE')
            ->with(['branches', 'owner:id,name,avatar_url'])
            ->withCount(['products' => function ($q) {
                $q->where('status', 'ACTIVE');
            }])
            ->findOrFail($id);

        return response()->json(['data' => $shop]);
    }

    /**
     * Shop Owner: Get my shop profile.
     */
    public function myShop(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)
            ->with(['branches', 'owner'])
            ->withCount('products')
            ->first();

        if (!$shop) {
            return response()->json([
                'has_shop' => false,
                'message' => 'No shop registered for this account.',
            ], 404);
        }

        return response()->json([
            'has_shop' => true,
            'data' => $shop,
        ]);
    }

    /**
     * Shop Owner: Update my shop profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'name_ar' => 'sometimes|string|max:150',
            'name_en' => 'sometimes|string|max:150',
            'description_ar' => 'nullable|string',
            'description_en' => 'nullable|string',
            'phone' => 'nullable|string|max:32',
            'whatsapp' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:500',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'logo_url' => 'nullable|string|max:500',
            'banner_url' => 'nullable|string|max:500',
            'commercial_reg_no' => 'nullable|string|max:50',
        ]);

        $shop->update($validated);

        return response()->json([
            'message' => 'Shop profile updated successfully',
            'data' => $shop->fresh(),
        ]);
    }

    /**
     * Shop Owner: Dashboard statistics.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $totalProducts = Product::where('shop_id', $shop->id)->count();
        $activeProducts = Product::where('shop_id', $shop->id)->where('status', 'ACTIVE')->count();
        $outOfStock = Product::where('shop_id', $shop->id)->where('status', 'OUT_OF_STOCK')->count();

        // Shop orders from order_shop_groups
        $totalOrders = OrderShopGroup::where('shop_id', $shop->id)->count();
        $pendingOrders = OrderShopGroup::where('shop_id', $shop->id)->where('status', 'PENDING')->count();
        $completedOrders = OrderShopGroup::where('shop_id', $shop->id)->where('status', 'COMPLETED')->count();
        $totalRevenue = OrderShopGroup::where('shop_id', $shop->id)
            ->whereIn('status', ['COMPLETED', 'CONFIRMED', 'PREPARING', 'READY'])
            ->sum('total');

        // Recent 5 orders
        $recentOrders = OrderShopGroup::where('shop_id', $shop->id)
            ->with(['order.customer:id,name,phone', 'items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Low stock products
        $lowStockProducts = Product::where('shop_id', $shop->id)
            ->whereHas('inventories', function ($q) {
                $q->whereColumn('quantity', '<=', 'low_stock_threshold');
            })
            ->with('inventories')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'shop' => [
                    'id' => $shop->id,
                    'name_ar' => $shop->name_ar,
                    'status' => $shop->status,
                    'rating' => $shop->rating,
                    'rating_count' => $shop->rating_count,
                ],
                'summary' => [
                    'total_products' => $totalProducts,
                    'active_products' => $activeProducts,
                    'out_of_stock' => $outOfStock,
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'completed_orders' => $completedOrders,
                    'total_revenue' => round((float)$totalRevenue, 2),
                    'currency' => 'USD',
                ],
                'recent_orders' => $recentOrders,
                'low_stock_alerts' => $lowStockProducts,
            ],
        ]);
    }
}
