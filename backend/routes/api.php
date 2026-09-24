<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\GarageController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\VehicleSyncController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ManufacturerController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ShopController;
use App\Http\Controllers\Api\V1\ShopBranchController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminShopController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminAuditController;
use App\Http\Controllers\Api\V1\Admin\AdminBannerController;
use App\Http\Controllers\Api\V1\Admin\AdminRoleController;
use App\Http\Controllers\Api\V1\Admin\AdminPermissionController;
use App\Http\Controllers\Api\V1\Admin\AdminUserAccessController;
use App\Http\Controllers\Api\V1\Admin\AdminEmployeeController;
use App\Http\Controllers\Api\V1\Admin\AdminInventoryController;
use App\Http\Controllers\Api\V1\Admin\AdminCommissionController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\AdminGeographyController;
use App\Http\Middleware\AuthenticateWithClerk;


/*
|--------------------------------------------------------------------------
| ALA Automotive Marketplace API Routes — Version 1
|--------------------------------------------------------------------------
|
| Architecture:
|   Clerk Identity → Bearer Token → Laravel Middleware → Business Logic
|
| Authorization:
|   - Roles enforced server-side via RequireRole middleware
|   - Ownership enforced via Policies
|   - All admin routes require ADMIN or SUPER_ADMIN role
|   - All shop routes require SHOP_OWNER or SHOP_EMPLOYEE role
*/

Route::prefix('v1')->group(function () {

    Route::post('/client-error', function (\Illuminate\Http\Request $request) {
        $raw = $request->getContent() ?: json_encode($request->all(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        @file_put_contents(storage_path('logs/client_error.log'), $raw . "\n---\n", FILE_APPEND);
        return response()->json(['status' => 'logged']);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 1. PUBLIC — No auth required
    // ═══════════════════════════════════════════════════════════════════════

    // Vehicle Reference Catalog (public & cached)
    Route::prefix('vehicles')->group(function () {
        Route::get('/makes', [VehicleController::class, 'makes']);
        Route::get('/makes/{make}/models', [VehicleController::class, 'models']);
        Route::get('/models/{model}/years', [VehicleController::class, 'years']);
        Route::get('/{model}/specifications', [VehicleController::class, 'specifications']);
        Route::get('/search', [VehicleController::class, 'search']);
        Route::post('/decode-vin', [VehicleController::class, 'decodeVin']);
    });

    // Product Catalog (public browse)
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/manufacturers', [ManufacturerController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/shops', [ShopController::class, 'index']);
    Route::get('/shops/{id}', [ShopController::class, 'show']);
    Route::get('/shops/{id}/products', [ProductController::class, 'byShop']);
    Route::get('/reviews/shop/{shopId}', [ReviewController::class, 'forShop']);

    // ═══════════════════════════════════════════════════════════════════════
    // 2. AUTHENTICATED — Any valid Clerk user
    // ═══════════════════════════════════════════════════════════════════════

    Route::middleware(AuthenticateWithClerk::class)->group(function () {

        // Auth & profile
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/sync', [AuthController::class, 'sync']);
            Route::post('/register-shop', [AuthController::class, 'registerShop']);
        });

        // My Garage
        Route::prefix('me/vehicles')->group(function () {
            Route::get('/', [GarageController::class, 'index']);
            Route::post('/', [GarageController::class, 'store']);
            Route::put('/{id}', [GarageController::class, 'update']);
            Route::delete('/{id}', [GarageController::class, 'destroy']);
            Route::post('/{id}/default', [GarageController::class, 'setDefault']);
        });

        // Cart (customer)
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'show']);
            Route::post('/items', [CartController::class, 'addItem']);
            Route::put('/items/{productId}', [CartController::class, 'updateItem']);
            Route::delete('/items/{productId}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clear']);
        });

        // Orders (customer)
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::post('/', [OrderController::class, 'store']); // Place order
            Route::get('/{id}', [OrderController::class, 'show']);
            Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
        });

        // Reviews
        Route::post('/reviews', [ReviewController::class, 'store']);

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/{id}/read', [NotificationController::class, 'markRead']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
        });

        // Wishlist
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'index']);
            Route::post('/{productId}', [WishlistController::class, 'toggle']);
        });

        // ─────────────────────────────────────────────────────────────────
        // 3. SHOP PANEL — SHOP_OWNER, SHOP_EMPLOYEE (with permission checks)
        // ─────────────────────────────────────────────────────────────────

        Route::prefix('shop')->middleware('role:SHOP_OWNER,SHOP_EMPLOYEE,ADMIN,SUPER_ADMIN')->group(function () {

            // Shop profile management (owner only for writes)
            Route::get('/profile', [ShopController::class, 'myShop']);
            Route::put('/profile', [ShopController::class, 'update']);

            // Shop branches
            Route::get('/branches', [ShopBranchController::class, 'index']);
            Route::post('/branches', [ShopBranchController::class, 'store']);
            Route::put('/branches/{id}', [ShopBranchController::class, 'update']);
            Route::delete('/branches/{id}', [ShopBranchController::class, 'destroy']);

            // Shop employees
            Route::get('/employees', [EmployeeController::class, 'index']);
            Route::post('/employees/invite', [EmployeeController::class, 'invite']);
            Route::put('/employees/{id}', [EmployeeController::class, 'update']);
            Route::post('/employees/{id}/suspend', [EmployeeController::class, 'suspend']);
            Route::delete('/employees/{id}', [EmployeeController::class, 'remove']);

            // Shop products
            Route::get('/products', [ProductController::class, 'shopProducts']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::get('/products/{id}', [ProductController::class, 'shopProduct']);
            Route::put('/products/{id}', [ProductController::class, 'update']);
            Route::delete('/products/{id}', [ProductController::class, 'destroy']);
            Route::post('/products/{id}/images', [ProductController::class, 'uploadImages']);

            // Shop inventory
            Route::get('/inventory', [InventoryController::class, 'index']);
            Route::put('/inventory/{productId}', [InventoryController::class, 'update']);
            Route::post('/inventory/{productId}/adjust', [InventoryController::class, 'adjust']);
            Route::get('/inventory/movements', [InventoryController::class, 'movements']);

            // Shop orders
            Route::get('/orders', [OrderController::class, 'shopOrders']);
            Route::get('/orders/{id}', [OrderController::class, 'shopOrder']);
            Route::post('/orders/{id}/confirm', [OrderController::class, 'confirm']);
            Route::post('/orders/{id}/status', [OrderController::class, 'updateShopGroupStatus']);

            // Shop dashboard stats
            Route::get('/dashboard', [ShopController::class, 'dashboard']);
        });

        // ─────────────────────────────────────────────────────────────────
        // 4. ADMIN PANEL — ADMIN, SUPER_ADMIN only
        // ─────────────────────────────────────────────────────────────────

        Route::prefix('admin')->middleware('role:ADMIN,SUPER_ADMIN')->group(function () {

            // Dashboard
            Route::get('/dashboard', [AdminDashboardController::class, 'index']);

            // Users
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/{id}', [AdminUserController::class, 'show']);
            Route::put('/users/{id}', [AdminUserController::class, 'update']);
            Route::post('/users/{id}/suspend', [AdminUserController::class, 'suspend']);
            Route::post('/users/{id}/activate', [AdminUserController::class, 'activate']);
            Route::put('/users/{id}/role', [AdminUserAccessController::class, 'changeUserRole']);
            Route::post('/users/{id}/role', [AdminUserAccessController::class, 'changeUserRole']);

            // User Access & Permission Overrides (Section 9, 10, 11)
            Route::get('/users/{id}/access', [AdminUserAccessController::class, 'userAccess']);
            Route::get('/users/{id}/permissions', [AdminUserAccessController::class, 'userPermissions']);
            Route::put('/users/{id}/permissions', [AdminUserAccessController::class, 'updateUserPermissions']);

            // Access Control: Roles (Section 3, 4, 8, 14)
            Route::get('/roles', [AdminRoleController::class, 'index']);
            Route::post('/roles', [AdminRoleController::class, 'store']);
            Route::get('/roles/{id}', [AdminRoleController::class, 'show']);
            Route::put('/roles/{id}', [AdminRoleController::class, 'update']);
            Route::delete('/roles/{id}', [AdminRoleController::class, 'destroy']);
            Route::post('/roles/{id}/duplicate', [AdminRoleController::class, 'duplicate']);
            Route::get('/roles/{id}/permissions', [AdminRoleController::class, 'permissions']);
            Route::put('/roles/{id}/permissions', [AdminRoleController::class, 'syncPermissions']);

            // Access Control: Permissions & Matrix (Section 5, 6, 15)
            Route::get('/permissions', [AdminPermissionController::class, 'index']);
            Route::get('/permissions/matrix', [AdminPermissionController::class, 'matrix']);

            // Employees Management (Section 19)
            Route::get('/employees', [AdminEmployeeController::class, 'index']);

            // Inventory Oversight (Section 23)
            Route::get('/inventory', [AdminInventoryController::class, 'index']);

            // Commissions Management (Section 25)
            Route::get('/commissions', [AdminCommissionController::class, 'index']);
            Route::post('/commissions', [AdminCommissionController::class, 'store']);
            Route::put('/commissions/{id}', [AdminCommissionController::class, 'update']);
            Route::delete('/commissions/{id}', [AdminCommissionController::class, 'destroy']);

            // Geography Management (Section 2, 27)
            Route::get('/geography/countries', [AdminGeographyController::class, 'countries']);
            Route::post('/geography/countries', [AdminGeographyController::class, 'storeCountry']);
            Route::put('/geography/countries/{id}', [AdminGeographyController::class, 'updateCountry']);
            Route::get('/geography/cities', [AdminGeographyController::class, 'cities']);
            Route::post('/geography/cities', [AdminGeographyController::class, 'storeCity']);
            Route::put('/geography/cities/{id}', [AdminGeographyController::class, 'updateCity']);

            // Platform Settings (Section 27)
            Route::get('/settings', [AdminSettingController::class, 'index']);
            Route::put('/settings', [AdminSettingController::class, 'update']);

            // Shops
            Route::get('/shops', [AdminShopController::class, 'index']);
            Route::get('/shops/{id}', [AdminShopController::class, 'show']);
            Route::post('/shops/{id}/approve', [AdminShopController::class, 'approve']);
            Route::post('/shops/{id}/reject', [AdminShopController::class, 'reject']);
            Route::post('/shops/{id}/suspend', [AdminShopController::class, 'suspend']);
            Route::post('/shops/{id}/reactivate', [AdminShopController::class, 'reactivate']);

            // Shop Approvals queue
            Route::get('/shop-approvals', [AdminShopController::class, 'pending']);

            // Products
            Route::get('/products', [AdminProductController::class, 'index']);
            Route::get('/products/{id}', [AdminProductController::class, 'show']);
            Route::post('/products/{id}/disable', [AdminProductController::class, 'disable']);
            Route::post('/products/{id}/enable', [AdminProductController::class, 'enable']);

            // Categories (admin management)
            Route::get('/categories', [AdminCategoryController::class, 'index']);
            Route::post('/categories', [AdminCategoryController::class, 'store']);
            Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
            Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

            // Orders
            Route::get('/orders', [AdminOrderController::class, 'index']);
            Route::get('/orders/{id}', [AdminOrderController::class, 'show']);

            // Reports
            Route::get('/reports/summary', [AdminReportController::class, 'summary']);
            Route::get('/reports/sales', [AdminReportController::class, 'sales']);
            Route::get('/reports/shops', [AdminReportController::class, 'shops']);

            // Audit logs (read-only)
            Route::get('/audit-logs', [AdminAuditController::class, 'index']);
            Route::get('/audit-logs/{id}', [AdminAuditController::class, 'show']);

            // Banners
            Route::get('/banners', [AdminBannerController::class, 'index']);
            Route::post('/banners', [AdminBannerController::class, 'store']);
            Route::put('/banners/{id}', [AdminBannerController::class, 'update']);
            Route::delete('/banners/{id}', [AdminBannerController::class, 'destroy']);

            // Vehicle sync (admin-only)
            Route::post('/vehicles/sync', [VehicleSyncController::class, 'sync']);
            Route::get('/vehicles/sync-status', [VehicleSyncController::class, 'status']);
        });

    }); // end authenticated middleware

}); // end v1 prefix
