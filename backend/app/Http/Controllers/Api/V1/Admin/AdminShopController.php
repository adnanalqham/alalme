<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Shop;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;

class AdminShopController extends Controller
{
    /**
     * GET /api/v1/admin/shops
     * List all shops with search, filter, pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Shop::with(['owner:id,full_name,email,phone,avatar_url']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'ilike', "%{$search}%")
                  ->orWhere('name_en', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($countryId = $request->query('country_id')) {
            $query->where('country_id', $countryId);
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $shops = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($shops);
    }

    /**
     * GET /api/v1/admin/shop-approvals
     * List all shops pending admin approval.
     */
    public function pending(Request $request): JsonResponse
    {
        $shops = Shop::with(['owner:id,full_name,email,phone'])
            ->where('status', 'PENDING')
            ->orderBy('created_at', 'asc') // Oldest first (FIFO review)
            ->paginate(25);

        return response()->json($shops);
    }

    /**
     * GET /api/v1/admin/shops/{id}
     */
    public function show(string $id): JsonResponse
    {
        $shop = Shop::with([
            'owner:id,full_name,email,phone,avatar_url',
            'branches',
        ])->findOrFail($id);

        // Stats for this shop
        $stats = [
            'products' => DB::table('products')->where('shop_id', $id)->whereNull('deleted_at')->count(),
            'orders' => DB::table('order_shop_groups')->where('shop_id', $id)->count(),
            'employees' => DB::table('shop_users')->where('shop_id', $id)->where('status', 'ACTIVE')->count(),
        ];

        return response()->json(['shop' => $shop, 'stats' => $stats]);
    }

    /**
     * POST /api/v1/admin/shops/{id}/approve
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $shop = Shop::findOrFail($id);

        if ($shop->status !== 'PENDING') {
            return response()->json(['error' => 'Shop is not in PENDING status.'], 422);
        }

        DB::transaction(function () use ($shop, $actingUser, $request) {
            $shop->update([
                'status' => 'ACTIVE',
                'approved_at' => now(),
                'approved_by' => $actingUser->id,
                'rejection_reason' => null,
            ]);

            // Update shop owner role
            DB::table('users')
                ->where('id', $shop->owner_id)
                ->update(['role' => 'SHOP_OWNER', 'status' => 'ACTIVE']);

            AuditService::log($actingUser->id, 'SHOP_APPROVED', 'shop', $shop->id, ['status' => 'PENDING'], ['status' => 'ACTIVE'], $request);

            // Notify shop owner
            DB::table('notifications')->insert([
                'id' => 'n_' . bin2hex(random_bytes(8)),
                'user_id' => $shop->owner_id,
                'type' => 'shop_approved',
                'title_ar' => 'تم اعتماد محلك',
                'title_en' => 'Your shop has been approved',
                'body_ar' => "تم اعتماد محل \"{$shop->name_ar}\" بنجاح. يمكنك الآن بدء إضافة المنتجات.",
                'body_en' => "Your shop \"{$shop->name_en}\" has been approved. You can now start adding products.",
                'data' => json_encode(['shop_id' => $shop->id]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Shop approved successfully.', 'shop' => $shop->fresh()]);
    }

    /**
     * POST /api/v1/admin/shops/{id}/reject
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $shop = Shop::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:500',
        ]);

        DB::transaction(function () use ($shop, $actingUser, $validated, $request) {
            $shop->update([
                'status' => 'REJECTED',
                'rejection_reason' => $validated['reason'],
            ]);

            AuditService::log($actingUser->id, 'SHOP_REJECTED', 'shop', $shop->id, ['status' => $shop->status], ['status' => 'REJECTED', 'reason' => $validated['reason']], $request);

            // Notify shop owner
            DB::table('notifications')->insert([
                'id' => 'n_' . bin2hex(random_bytes(8)),
                'user_id' => $shop->owner_id,
                'type' => 'shop_rejected',
                'title_ar' => 'تم رفض طلب المحل',
                'title_en' => 'Shop application rejected',
                'body_ar' => "تم رفض طلب محل \"{$shop->name_ar}\". السبب: {$validated['reason']}",
                'body_en' => "Your shop application for \"{$shop->name_en}\" was rejected. Reason: {$validated['reason']}",
                'data' => json_encode(['shop_id' => $shop->id, 'reason' => $validated['reason']]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json(['message' => 'Shop rejected.', 'shop' => $shop->fresh()]);
    }

    /**
     * POST /api/v1/admin/shops/{id}/suspend
     */
    public function suspend(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $shop = Shop::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'required|string|min:5|max:500',
        ]);

        $oldStatus = $shop->status;
        $shop->update(['status' => 'SUSPENDED']);

        AuditService::log($actingUser->id, 'SHOP_SUSPENDED', 'shop', $shop->id, ['status' => $oldStatus], ['status' => 'SUSPENDED', 'reason' => $validated['reason']], $request);

        return response()->json(['message' => 'Shop suspended.']);
    }

    /**
     * POST /api/v1/admin/shops/{id}/reactivate
     */
    public function reactivate(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $shop = Shop::findOrFail($id);

        $oldStatus = $shop->status;
        $shop->update(['status' => 'ACTIVE']);

        AuditService::log($actingUser->id, 'SHOP_REACTIVATED', 'shop', $shop->id, ['status' => $oldStatus], ['status' => 'ACTIVE'], $request);

        return response()->json(['message' => 'Shop reactivated.', 'shop' => $shop->fresh()]);
    }
}
