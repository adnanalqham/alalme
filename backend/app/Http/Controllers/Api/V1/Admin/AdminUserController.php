<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminUserController extends Controller
{
    /**
     * GET /api/v1/admin/users
     * List all users with search, filter, pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        // Filter by role
        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by country
        if ($countryId = $request->query('country_id')) {
            $query->where('country_id', $countryId);
        }

        $perPage = min((int) $request->query('per_page', 25), 100);
        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($users);
    }

    /**
     * GET /api/v1/admin/users/{id}
     * Get a specific user's full profile.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        return response()->json(['user' => $user]);
    }

    /**
     * PUT /api/v1/admin/users/{id}
     * Update user profile fields (not role).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|string|max:150',
            'city_id' => 'sometimes|nullable|string|max:32',
            'city' => 'sometimes|nullable|string|max:100',
            'country_id' => 'sometimes|nullable|string|max:16',
        ]);

        $user->update($validated);

        AuditService::log($actingUser->id, 'USER_UPDATED', 'user', $user->id, [], $validated, $request);

        return response()->json(['message' => 'User updated.', 'user' => $user]);
    }

    /**
     * POST /api/v1/admin/users/{id}/suspend
     * Suspend a user account.
     */
    public function suspend(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $user = User::findOrFail($id);

        // Prevent suspending SUPER_ADMIN
        if ($user->role === 'SUPER_ADMIN' && $actingUser->role !== 'SUPER_ADMIN') {
            return response()->json(['error' => 'Forbidden', 'message' => 'Cannot suspend SUPER_ADMIN.'], 403);
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $oldStatus = $user->status;
        $user->update(['status' => 'SUSPENDED']);

        AuditService::log($actingUser->id, 'USER_SUSPENDED', 'user', $user->id, ['status' => $oldStatus], ['status' => 'SUSPENDED', 'reason' => $validated['reason'] ?? null], $request);

        return response()->json(['message' => 'User suspended.']);
    }

    /**
     * POST /api/v1/admin/users/{id}/activate
     * Reactivate a suspended user account.
     */
    public function activate(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $user = User::findOrFail($id);

        $oldStatus = $user->status;
        $user->update(['status' => 'ACTIVE']);

        AuditService::log($actingUser->id, 'USER_ACTIVATED', 'user', $user->id, ['status' => $oldStatus], ['status' => 'ACTIVE'], $request);

        return response()->json(['message' => 'User activated.']);
    }

    /**
     * POST /api/v1/admin/users/{id}/role
     * Change user role (SUPER_ADMIN only for admin roles).
     */
    public function changeRole(Request $request, string $id): JsonResponse
    {
        $actingUser = $request->user();
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|in:CUSTOMER,SHOP_OWNER,SHOP_EMPLOYEE,ADMIN,SUPER_ADMIN',
        ]);

        // Only SUPER_ADMIN can grant ADMIN or SUPER_ADMIN roles
        if (in_array($validated['role'], ['ADMIN', 'SUPER_ADMIN']) && $actingUser->role !== 'SUPER_ADMIN') {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Only SUPER_ADMIN can grant admin roles.',
            ], 403);
        }

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        AuditService::log($actingUser->id, 'ROLE_CHANGED', 'user', $user->id, ['role' => $oldRole], ['role' => $validated['role']], $request);

        return response()->json(['message' => 'Role updated.', 'user' => $user]);
    }
}
