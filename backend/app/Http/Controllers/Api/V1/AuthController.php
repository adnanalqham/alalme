<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuthController extends Controller
{
    /**
     * GET /api/v1/auth/me
     * Returns the authoritative ALA business profile, role, shop status, and permissions.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthenticated',
            ], 401);
        }

        $effectivePermissions = method_exists($user, 'getEffectivePermissions') 
            ? $user->getEffectivePermissions() 
            : ($user->permissions ?? []);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'clerk_user_id' => $user->clerk_user_id,
                'email' => $user->email,
                'phone' => $user->phone,
                'full_name' => $user->full_name,
                'avatar_url' => $user->avatar_url,
                'role' => $user->role,
                'role_display_name' => $user->roleModel?->display_name ?? $user->role,
                'status' => $user->status,
                'shop_id' => $user->shop_id,
                'branch_id' => $user->branch_id,
                'permissions' => $effectivePermissions,
                'effective_permissions' => $effectivePermissions,
                'country_id' => $user->country_id,
                'city_id' => $user->city_id,
                'city' => $user->city,
                'address' => $user->address,
                'created_at' => $user->created_at?->toISOString(),
            ],
        ]);
    }

    /**
     * POST /api/v1/auth/sync
     * Update ALA profile details from client or Clerk webhook.
     */
    public function sync(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'full_name' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:255',
            'avatar_url' => 'nullable|url|max:500',
            'city_id' => 'nullable|string|max:32',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
        ]);

        $user->update(array_filter($validated, fn ($val) => !is_null($val)));

        return response()->json([
            'message' => 'User profile updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * POST /api/v1/auth/register-shop
     * Submit shop registration for approval.
     */
    public function registerShop(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name_ar' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:32',
            'commercial_reg_no' => 'nullable|string|max:50',
        ]);

        $shopId = 's_' . bin2hex(random_bytes(8));

        $user->update([
            'role' => 'SHOP_OWNER',
            'shop_id' => $shopId,
            'status' => 'PENDING', // Strict PENDING state awaiting admin review
        ]);

        return response()->json([
            'message' => 'Shop application submitted successfully. Awaiting administrative review.',
            'shop_id' => $shopId,
            'status' => 'PENDING',
        ], 201);
    }
}
