<?php

namespace App\Http\Controllers\Api\V1\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AdminReportController extends Controller
{
    /**
     * GET /api/v1/admin/reports/summary
     * Complete analytics engine aggregating directly in PostgreSQL with date filtering.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('reports.view')) {
            return response()->json(['error' => 'Forbidden: You lack reports.view permission.'], 403);
        }

        $fromInput = $request->query('from');
        $toInput = $request->query('to');
        $shopId = $request->query('shop_id');

        $from = $fromInput ? Carbon::parse($fromInput)->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $to = $toInput ? Carbon::parse($toInput)->endOfDay() : Carbon::now()->endOfDay();

        // Base Orders Query helper
        $ordersQuery = DB::table('orders')
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to]);

        if ($shopId) {
            $orderIdsForShop = DB::table('order_shop_groups')
                ->where('shop_id', $shopId)
                ->pluck('order_id');
            $ordersQuery->whereIn('id', $orderIdsForShop);
        }

        // 1. Sales & Revenue Over Time (Daily / Monthly)
        $salesByPeriod = DB::table('orders')
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM-DD') as date"),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->where('payment_status', 'PAID')
            ->groupBy(DB::raw("TO_CHAR(created_at, 'YYYY-MM-DD')"))
            ->orderBy('date', 'asc')
            ->get();

        // 2. Orders by Status over period
        $ordersByStatus = (clone $ordersQuery)
            ->select('status', DB::raw('COUNT(*) as count'), DB::raw('COALESCE(SUM(total), 0) as total_amount'))
            ->groupBy('status')
            ->get();

        // 3. Sales By Shop
        $salesByShop = DB::table('order_shop_groups')
            ->join('shops', 'shops.id', '=', 'order_shop_groups.shop_id')
            ->select(
                'shops.id',
                'shops.name_ar',
                'shops.name_en',
                DB::raw('COUNT(order_shop_groups.id) as orders_count'),
                DB::raw('COALESCE(SUM(order_shop_groups.total), 0) as total_revenue'),
                DB::raw('COALESCE(SUM(order_shop_groups.subtotal * 0.05), 0) as estimated_commission')
            )
            ->whereBetween('order_shop_groups.created_at', [$from, $to])
            ->groupBy('shops.id', 'shops.name_ar', 'shops.name_en')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // 4. Sales By Category
        $salesByCategory = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->select(
                DB::raw("COALESCE(categories.name_ar, categories.name_en, 'عام') as category_name"),
                DB::raw('COUNT(order_items.id) as items_count'),
                DB::raw('COALESCE(SUM(order_items.quantity), 0) as total_qty'),
                DB::raw('COALESCE(SUM(order_items.total_price), 0) as total_amount')
            )
            ->whereBetween('order_items.created_at', [$from, $to])
            ->groupBy('categories.id', 'categories.name_ar', 'categories.name_en')
            ->orderBy('total_amount', 'desc')
            ->get();

        // 5. Top-Selling Products
        $topProducts = DB::table('order_items')
            ->select(
                'product_id',
                'product_name_ar',
                'product_name_en',
                'part_number',
                DB::raw('COALESCE(SUM(quantity), 0) as total_sold'),
                DB::raw('COALESCE(SUM(total_price), 0) as revenue')
            )
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('product_id', 'product_name_ar', 'product_name_en', 'part_number')
            ->orderBy('total_sold', 'desc')
            ->limit(10)
            ->get();

        // 6. Payment Methods Breakdown
        $paymentMethods = (clone $ordersQuery)
            ->select(
                'payment_method',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(total), 0) as amount')
            )
            ->groupBy('payment_method')
            ->get();

        // 7. User Growth Over Period
        $userGrowth = DB::table('users')
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM-DD') as date"),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$from, $to])
            ->groupBy(DB::raw("TO_CHAR(created_at, 'YYYY-MM-DD')"))
            ->orderBy('date', 'asc')
            ->get();

        // 8. New Shops Registered in Period
        $newShops = DB::table('shops')
            ->select(
                'id',
                'name_ar',
                'name_en',
                'status',
                'created_at'
            )
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at', 'desc')
            ->get();

        // 9. Commissions Aggregation
        $totalCommissionEarned = DB::table('order_shop_groups')
            ->whereBetween('created_at', [$from, $to])
            ->sum(DB::raw('subtotal * 0.05'));

        // 10. Returns & Refunds
        $refundedOrders = DB::table('orders')
            ->whereNull('deleted_at')
            ->where('payment_status', 'REFUNDED')
            ->whereBetween('created_at', [$from, $to])
            ->select(
                'id',
                'order_number',
                'total',
                'payment_method',
                'created_at'
            )
            ->get();

        // 11. Inventory Status Summary
        $inventoryStats = [
            'total_items' => DB::table('inventories')->count(),
            'total_units' => (int) DB::table('inventories')->sum('quantity'),
            'low_stock_count' => DB::table('inventories')->whereRaw('quantity <= low_stock_threshold AND quantity > 0')->count(),
            'out_of_stock_count' => DB::table('inventories')->where('quantity', '<=', 0)->count(),
        ];

        // Overall Period KPI summary cards
        $totalPeriodRevenue = (float) (clone $ordersQuery)->where('payment_status', 'PAID')->sum('total');
        $totalPeriodOrders = (int) (clone $ordersQuery)->count();
        $totalPeriodUsers = (int) DB::table('users')->whereBetween('created_at', [$from, $to])->count();

        return response()->json([
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'shop_id' => $shopId,
            ],
            'kpis' => [
                'revenue' => round($totalPeriodRevenue, 2),
                'orders_count' => $totalPeriodOrders,
                'new_users' => $totalPeriodUsers,
                'commissions' => round((float)$totalCommissionEarned, 2),
            ],
            'sales_by_period' => $salesByPeriod,
            'orders_by_status' => $ordersByStatus,
            'sales_by_shop' => $salesByShop,
            'sales_by_category' => $salesByCategory,
            'top_products' => $topProducts,
            'payment_methods' => $paymentMethods,
            'user_growth' => $userGrowth,
            'new_shops' => $newShops,
            'refunded_orders' => $refundedOrders,
            'inventory_stats' => $inventoryStats,
        ]);
    }
}
