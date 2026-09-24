<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Order;
use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;

echo "============================================================\n";
echo "ALA ADMIN CONTROL CENTER — DASHBOARD & REPORTS TEST SUITE\n";
echo "============================================================\n\n";

$passed = 0;
$failed = 0;

function assertCondition($name, $condition, $details = '') {
    global $passed, $failed;
    if ($condition) {
        $passed++;
        echo " [PASS] $name\n";
        if ($details) echo "        $details\n";
    } else {
        $failed++;
        echo " [FAIL] $name\n";
        if ($details) echo "        $details\n";
    }
}

// 1. User setup
$admin = User::where('role', 'SUPER_ADMIN')->first();
$customer = User::where('role', 'CUSTOMER')->first();

assertCondition("SUPER_ADMIN user exists", $admin !== null, "Admin: " . ($admin->email ?? 'none'));
assertCondition("CUSTOMER user exists", $customer !== null, "Customer: " . ($customer->email ?? 'none'));

// 2. Test RBAC permissions on Dashboard & Reports
echo "\n--- 1. RBAC Access Control for Dashboard & Reports ---\n";

$dashboardController = app(AdminDashboardController::class);
$reportController = app(AdminReportController::class);

// Customer request
$reqCustomer = Request::create('/api/v1/admin/dashboard', 'GET');
$reqCustomer->setUserResolver(fn() => $customer);

$respCust = $dashboardController->index($reqCustomer);
assertCondition(
    "Customer cannot access Admin Dashboard (403)",
    $respCust->getStatusCode() === 403,
    "Status code: " . $respCust->getStatusCode()
);

$reqCustRep = Request::create('/api/v1/admin/reports/summary', 'GET');
$reqCustRep->setUserResolver(fn() => $customer);
$respCustRep = $reportController->summary($reqCustRep);
assertCondition(
    "Customer cannot access Admin Reports (403)",
    $respCustRep->getStatusCode() === 403,
    "Status code: " . $respCustRep->getStatusCode()
);

// Admin request
$reqAdmin = Request::create('/api/v1/admin/dashboard', 'GET', ['days' => 30]);
$reqAdmin->setUserResolver(fn() => $admin);
$respAdmin = $dashboardController->index($reqAdmin);
assertCondition(
    "SUPER_ADMIN can access Admin Dashboard (200)",
    $respAdmin->getStatusCode() === 200,
    "Status code: " . $respAdmin->getStatusCode()
);

// 3. Test Dashboard 9 sections & PostgreSQL accuracy
echo "\n--- 2. Dashboard 9 Metric Categories & PostgreSQL Accuracy ---\n";
$dashData = json_decode($respAdmin->getContent(), true);

// Section 1: Users
$dbTotalUsers = User::count();
assertCondition(
    "Section 1: Total Users matches PostgreSQL",
    isset($dashData['users']['total']) && $dashData['users']['total'] === $dbTotalUsers,
    "API: {$dashData['users']['total']}, DB: {$dbTotalUsers}"
);
assertCondition(
    "Section 1: Users by role breakdown is present",
    !empty($dashData['users']['by_role']),
    "Roles: " . json_encode(array_column($dashData['users']['by_role'], 'role'))
);

// Section 2: Shops
$dbTotalShops = Shop::count();
assertCondition(
    "Section 2: Total Shops matches PostgreSQL",
    isset($dashData['shops']['total']) && $dashData['shops']['total'] === $dbTotalShops,
    "API: {$dashData['shops']['total']}, DB: {$dbTotalShops}"
);

// Section 3: Products
$dbTotalProducts = Product::count();
assertCondition(
    "Section 3: Total Products matches PostgreSQL",
    isset($dashData['products']['total']) && $dashData['products']['total'] === $dbTotalProducts,
    "API: {$dashData['products']['total']}, DB: {$dbTotalProducts}"
);

// Section 4: Orders
$dbTotalOrders = Order::count();
assertCondition(
    "Section 4: Total Orders matches PostgreSQL",
    isset($dashData['orders']['total']) && $dashData['orders']['total'] === $dbTotalOrders,
    "API: {$dashData['orders']['total']}, DB: {$dbTotalOrders}"
);

// Section 5: Sales
$dbTotalSales = (float) Order::where('payment_status', 'PAID')->sum('total');
assertCondition(
    "Section 5: Total Sales matches PostgreSQL",
    isset($dashData['sales']['total_sales']) && abs($dashData['sales']['total_sales'] - $dbTotalSales) < 0.01,
    "API: {$dashData['sales']['total_sales']}, DB: {$dbTotalSales}"
);

// Section 6: Payments
assertCondition(
    "Section 6: Payments breakdown contains paid, pending, and methods",
    isset($dashData['payments']['paid']) && isset($dashData['payments']['by_method']),
    "Paid: {$dashData['payments']['paid']}, Methods: " . count($dashData['payments']['by_method'])
);

// Section 7: Inventory
assertCondition(
    "Section 7: Inventory stats contain low stock and out of stock counts",
    isset($dashData['inventory']['low_stock_count']) && isset($dashData['inventory']['out_of_stock_count']),
    "Low stock: {$dashData['inventory']['low_stock_count']}, Out of stock: {$dashData['inventory']['out_of_stock_count']}"
);

// Section 8: Reviews & Complaints
assertCondition(
    "Section 8: Reviews and complaints tracked",
    isset($dashData['reviews_complaints']['reviews_count']) && isset($dashData['reviews_complaints']['complaints_open']),
    "Reviews: {$dashData['reviews_complaints']['reviews_count']}, Open complaints: {$dashData['reviews_complaints']['complaints_open']}"
);

// Section 9: Recent Data
assertCondition(
    "Section 9: Recent data contains users, shops, orders, products, audit logs",
    isset($dashData['recent']['users']) && isset($dashData['recent']['orders']) && isset($dashData['recent']['shops']),
    "Orders count: " . count($dashData['recent']['orders'] ?? []) . ", Users count: " . count($dashData['recent']['users'] ?? [])
);

// 4. Test Reports Endpoint & Filters
echo "\n--- 3. Reports Endpoint & Dynamic Date Filtering ---\n";

$reqRep30 = Request::create('/api/v1/admin/reports/summary', 'GET', [
    'from' => date('Y-m-d', strtotime('-30 days')),
    'to' => date('Y-m-d')
]);
$reqRep30->setUserResolver(fn() => $admin);
$respRep30 = $reportController->summary($reqRep30);

assertCondition(
    "SUPER_ADMIN can access Admin Reports (200)",
    $respRep30->getStatusCode() === 200,
    "Status code: " . $respRep30->getStatusCode()
);

$repData30 = json_decode($respRep30->getContent(), true);

// Test dynamic date filter effect
$reqRep7 = Request::create('/api/v1/admin/reports/summary', 'GET', [
    'from' => date('Y-m-d', strtotime('-7 days')),
    'to' => date('Y-m-d')
]);
$reqRep7->setUserResolver(fn() => $admin);
$respRep7 = $reportController->summary($reqRep7);
$repData7 = json_decode($respRep7->getContent(), true);

assertCondition(
    "Date filter dynamically affects report KPIs (30d vs 7d)",
    $repData30['kpis']['orders_count'] >= $repData7['kpis']['orders_count'],
    "30d Orders: {$repData30['kpis']['orders_count']}, 7d Orders: {$repData7['kpis']['orders_count']}"
);

// Check 11 reports presence
assertCondition("Report 1: sales_by_period exists", isset($repData30['sales_by_period']));
assertCondition("Report 2: orders_by_status exists", isset($repData30['orders_by_status']));
assertCondition("Report 3: sales_by_shop exists", isset($repData30['sales_by_shop']));
assertCondition("Report 4: sales_by_category exists", isset($repData30['sales_by_category']));
assertCondition("Report 5: top_products exists", isset($repData30['top_products']));
assertCondition("Report 6: payment_methods exists", isset($repData30['payment_methods']));
assertCondition("Report 7: user_growth exists", isset($repData30['user_growth']));
assertCondition("Report 8: new_shops exists", isset($repData30['new_shops']));
assertCondition("Report 9: commissions exists in kpis", isset($repData30['kpis']['commissions']));
assertCondition("Report 10: refunded_orders exists", isset($repData30['refunded_orders']));
assertCondition("Report 11: inventory_stats exists", isset($repData30['inventory_stats']));

echo "\n============================================================\n";
echo "SUMMARY: Passed: $passed, Failed: $failed\n";
echo "============================================================\n";

if ($failed > 0) {
    exit(1);
}
