<?php

namespace App\Http\Controllers\Api\V1\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * GET /api/v1/admin/dashboard
     * Returns comprehensive, real PostgreSQL-aggregated statistics.
     * Guaranteed 100% authoritative from the database.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && method_exists($user, 'canAccess') && !$user->canAccess('dashboard.view')) {
            return response()->json(['error' => 'Forbidden: You lack dashboard.view permission.'], 403);
        }

        $days = (int) $request->query('days', 30);
        $since = Carbon::now()->subDays($days);
        $previousSince = Carbon::now()->subDays($days * 2);

        // 1. Users
        $totalUsers = DB::table('users')->count();
        $newUsers = DB::table('users')->where('created_at', '>=', $since)->count();
        $usersByRole = DB::table('users')
            ->select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // 2. Shops
        $totalShops = DB::table('shops')->whereNull('deleted_at')->count();
        $activeShops = DB::table('shops')->where('status', 'ACTIVE')->whereNull('deleted_at')->count();
        $pendingShops = DB::table('shops')->where('status', 'PENDING')->whereNull('deleted_at')->count();
        $newShopRequests = DB::table('shops')->where('created_at', '>=', $since)->whereNull('deleted_at')->count();

        // 3. Products
        $totalProducts = DB::table('products')->whereNull('deleted_at')->count();
        $publishedProducts = DB::table('products')->where('status', 'ACTIVE')->whereNull('deleted_at')->count();
        $inactiveProducts = DB::table('products')->where('status', '!=', 'ACTIVE')->whereNull('deleted_at')->count();
        $lowStockProducts = DB::table('inventories')
            ->whereRaw('quantity <= low_stock_threshold AND quantity > 0')
            ->count();

        // 4. Orders
        $totalOrders = DB::table('orders')->whereNull('deleted_at')->count();
        $pendingOrders = DB::table('orders')->where('status', 'PENDING')->whereNull('deleted_at')->count();
        $processingOrders = DB::table('orders')
            ->whereIn('status', ['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'])
            ->whereNull('deleted_at')
            ->count();
        $completedOrders = DB::table('orders')->where('status', 'COMPLETED')->whereNull('deleted_at')->count();
        $cancelledOrders = DB::table('orders')->where('status', 'CANCELLED')->whereNull('deleted_at')->count();

        // 5. Sales & Revenue
        $totalSales = (float) DB::table('orders')->where('payment_status', 'PAID')->whereNull('deleted_at')->sum('total');
        $todaySales = (float) DB::table('orders')
            ->where('payment_status', 'PAID')
            ->whereDate('created_at', Carbon::today())
            ->whereNull('deleted_at')
            ->sum('total');
        $periodSales = (float) DB::table('orders')
            ->where('payment_status', 'PAID')
            ->where('created_at', '>=', $since)
            ->whereNull('deleted_at')
            ->sum('total');
        $previousPeriodSales = (float) DB::table('orders')
            ->where('payment_status', 'PAID')
            ->whereBetween('created_at', [$previousSince, $since])
            ->whereNull('deleted_at')
            ->sum('total');

        $growthRate = 0;
        if ($previousPeriodSales > 0) {
            $growthRate = round((($periodSales - $previousPeriodSales) / $previousPeriodSales) * 100, 1);
        } elseif ($periodSales > 0) {
            $growthRate = 100.0;
        }

        // 6. Payments
        $paymentsPaid = (float) DB::table('orders')->where('payment_status', 'PAID')->whereNull('deleted_at')->sum('total');
        $paymentsPending = (float) DB::table('orders')->where('payment_status', 'PENDING')->whereNull('deleted_at')->sum('total');
        $paymentsRefunded = (float) DB::table('orders')->where('payment_status', 'REFUNDED')->whereNull('deleted_at')->sum('total');
        $paymentsByMethod = DB::table('orders')
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total) as amount'))
            ->whereNull('deleted_at')
            ->groupBy('payment_method')
            ->get();

        // 7. Inventory
        $outOfStockCount = DB::table('inventories')->where('quantity', '<=', 0)->count();
        $inventoryByShop = DB::table('inventories')
            ->join('shops', 'shops.id', '=', 'inventories.shop_id')
            ->select(
                'shops.id',
                'shops.name_ar',
                'shops.name_en',
                DB::raw('COALESCE(SUM(inventories.quantity), 0) as total_qty'),
                DB::raw('COUNT(inventories.id) as items_count')
            )
            ->groupBy('shops.id', 'shops.name_ar', 'shops.name_en')
            ->get();

        // 8. Reviews & Complaints
        $reviewsCount = DB::table('reviews')->whereNull('deleted_at')->count();
        $averageRating = round((float) (DB::table('reviews')->whereNull('deleted_at')->avg('rating') ?: 0), 1);
        $complaintsOpen = DB::table('complaints')->where('status', 'OPEN')->whereNull('deleted_at')->count();
        $complaintsProcessing = DB::table('complaints')->where('status', 'IN_REVIEW')->whereNull('deleted_at')->count();
        $complaintsResolved = DB::table('complaints')->where('status', 'RESOLVED')->whereNull('deleted_at')->count();

        // 9. Recent Activity
        $latestUsers = DB::table('users')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'email', 'full_name', 'role', 'status', 'created_at']);

        $latestShops = DB::table('shops')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name_ar', 'name_en', 'phone', 'status', 'created_at']);

        $latestOrders = DB::table('orders')
            ->leftJoin('users', 'users.id', '=', 'orders.customer_id')
            ->select(
                'orders.id',
                'orders.order_number',
                'orders.total',
                'orders.status',
                'orders.payment_status',
                'orders.created_at',
                'users.full_name as customer_name'
            )
            ->orderBy('orders.created_at', 'desc')
            ->limit(5)
            ->get();

        $latestProducts = DB::table('products')
            ->leftJoin('shops', 'shops.id', '=', 'products.shop_id')
            ->select(
                'products.id',
                'products.name_ar',
                'products.name_en',
                'products.price',
                'products.status',
                'products.part_number',
                'products.created_at',
                'shops.name_ar as shop_name'
            )
            ->orderBy('products.created_at', 'desc')
            ->limit(5)
            ->get();

        $latestAuditLogs = DB::table('audit_logs')
            ->leftJoin('users', 'users.id', '=', 'audit_logs.user_id')
            ->select(
                'audit_logs.id',
                'audit_logs.action',
                'audit_logs.entity_type',
                'audit_logs.entity_id',
                'audit_logs.notes',
                'audit_logs.created_at',
                'users.email as user_email',
                'users.full_name as user_name'
            )
            ->orderBy('audit_logs.created_at', 'desc')
            ->limit(5)
            ->get();

        // Monthly trends for chart
        $monthlySales = DB::table('orders')
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->where('payment_status', 'PAID')
            ->whereNull('deleted_at')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'new' => $newUsers,
                'by_role' => $usersByRole,
            ],
            'shops' => [
                'total' => $totalShops,
                'active' => $activeShops,
                'pending' => $pendingShops,
                'new_requests' => $newShopRequests,
            ],
            'products' => [
                'total' => $totalProducts,
                'published' => $publishedProducts,
                'inactive' => $inactiveProducts,
                'low_stock' => $lowStockProducts,
            ],
            'orders' => [
                'total' => $totalOrders,
                'new' => $pendingOrders,
                'processing' => $processingOrders,
                'completed' => $completedOrders,
                'cancelled' => $cancelledOrders,
            ],
            'sales' => [
                'total_sales' => $totalSales,
                'today_sales' => $todaySales,
                'period_sales' => $periodSales,
                'previous_period_sales' => $previousPeriodSales,
                'growth_rate' => $growthRate,
            ],
            'payments' => [
                'paid' => $paymentsPaid,
                'pending' => $paymentsPending,
                'refunded' => $paymentsRefunded,
                'by_method' => $paymentsByMethod,
            ],
            'inventory' => [
                'low_stock_count' => $lowStockProducts,
                'out_of_stock_count' => $outOfStockCount,
                'by_shop' => $inventoryByShop,
            ],
            'reviews_complaints' => [
                'reviews_count' => $reviewsCount,
                'average_rating' => $averageRating,
                'complaints_open' => $complaintsOpen,
                'complaints_processing' => $complaintsProcessing,
                'complaints_resolved' => $complaintsResolved,
            ],
            'recent' => [
                'users' => $latestUsers,
                'shops' => $latestShops,
                'orders' => $latestOrders,
                'products' => $latestProducts,
                'audit_logs' => $latestAuditLogs,
            ],
            'charts' => [
                'monthly_sales' => $monthlySales,
            ],
            'period' => [
                'days' => $days,
                'from' => $since->toDateString(),
                'to' => Carbon::now()->toDateString(),
            ],
        ]);
    }
}
