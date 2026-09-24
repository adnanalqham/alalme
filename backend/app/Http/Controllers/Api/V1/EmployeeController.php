<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Shop;
use App\Models\ShopUser;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $employees = ShopUser::where('shop_id', $shop->id)
            ->with(['user:id,name,email,phone,avatar_url', 'branch'])
            ->get();

        return response()->json(['data' => $employees]);
    }

    public function invite(Request $request): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:MANAGER,EMPLOYEE',
            'branch_id' => 'nullable|exists:shop_branches,id',
            'permissions' => 'nullable|array',
        ]);

        $invitedUser = User::where('email', $validated['email'])->first();

        if (!$invitedUser) {
            return response()->json([
                'error' => 'Not Found',
                'message' => 'No user found with this email. The user must register first.',
            ], 404);
        }

        $existing = ShopUser::where('shop_id', $shop->id)->where('user_id', $invitedUser->id)->first();
        if ($existing) {
            return response()->json([
                'error' => 'Conflict',
                'message' => 'This user is already a member of this shop.',
            ], 409);
        }

        $membership = ShopUser::create([
            'shop_id' => $shop->id,
            'user_id' => $invitedUser->id,
            'branch_id' => $validated['branch_id'] ?? null,
            'role' => $validated['role'],
            'permissions' => $validated['permissions'] ?? [],
            'status' => 'ACTIVE',
            'invited_by' => $user->id,
            'invited_at' => now(),
            'joined_at' => now(),
        ]);

        // If user is currently CUSTOMER, update role to SHOP_EMPLOYEE
        if ($invitedUser->role === 'CUSTOMER') {
            $invitedUser->update(['role' => 'SHOP_EMPLOYEE']);
        }

        return response()->json([
            'message' => 'Employee added successfully',
            'data' => $membership->load(['user', 'branch']),
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $employee = ShopUser::where('shop_id', $shop->id)->findOrFail($id);

        $validated = $request->validate([
            'role' => 'sometimes|in:MANAGER,EMPLOYEE',
            'branch_id' => 'nullable|exists:shop_branches,id',
            'permissions' => 'nullable|array',
            'status' => 'sometimes|in:ACTIVE,SUSPENDED',
        ]);

        $employee->update($validated);

        return response()->json([
            'message' => 'Employee updated successfully',
            'data' => $employee->fresh()->load(['user', 'branch']),
        ]);
    }

    public function suspend(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $employee = ShopUser::where('shop_id', $shop->id)->findOrFail($id);
        $employee->update(['status' => 'SUSPENDED']);

        return response()->json(['message' => 'Employee suspended successfully']);
    }

    public function remove(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $shop = Shop::where('owner_id', $user->id)->firstOrFail();

        $employee = ShopUser::where('shop_id', $shop->id)->findOrFail($id);
        $employee->delete();

        return response()->json(['message' => 'Employee removed successfully']);
    }
}
