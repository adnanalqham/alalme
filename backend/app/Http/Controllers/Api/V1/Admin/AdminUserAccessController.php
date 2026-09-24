<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\UserPermission;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminUserAccessController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    /**
     * Get detailed access breakdown for a specific user:
     * - User details
     * - Role base permissions
     * - Additional granted permissions
     * - Denied permissions
     * - Effective permissions calculation
     * - Permission change history
     */
    public function getUserPermissions($id): JsonResponse
    {
        $user = User::with(['roleModel', 'shop', 'userPermissions.permission'])->findOrFail($id);

        // 1. Role base permissions
        $role = Role::where('name', $user->role)->with('permissions')->first();
        $rolePermissions = $role ? $role->permissions : collect();

        // 2. User overrides
        $overrides = UserPermission::where('user_id', $user->id)
            ->with(['permission', 'creator:id,full_name,email'])
            ->get();

        $additionalPermissions = $overrides->where('is_granted', true)->values();
        $deniedPermissions = $overrides->where('is_granted', false)->values();

        // 3. Calculate effective permissions
        $effectivePermissionNames = $user->getEffectivePermissions();
        $effectivePermissions = Permission::whereIn('name', $effectivePermissionNames)->get();

        // 4. Audit history for this user
        $history = AuditLog::where(function ($q) use ($user) {
            $q->where('entity_type', 'user')->where('entity_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('action', 'ilike', '%PERMISSION%')->where('entity_id', $user->id);
        })->with('user:id,full_name,email')
          ->orderBy('created_at', 'desc')
          ->limit(20)
          ->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'role_display_name' => $role?->display_name ?? $user->role,
                'status' => $user->status,
                'shop' => $user->shop ? [
                    'id' => $user->shop->id,
                    'name_ar' => $user->shop->name_ar,
                    'name_en' => $user->shop->name_en,
                ] : null,
                'branch_id' => $user->branch_id,
                'created_at' => $user->created_at,
            ],
            'role_permissions' => $rolePermissions,
            'additional_permissions' => $additionalPermissions,
            'denied_permissions' => $deniedPermissions,
            'effective_permissions' => $effectivePermissions,
            'effective_count' => count($effectivePermissionNames),
            'history' => $history,
        ]);
    }

    /**
     * Update user-level permission overrides (grant, deny, or restore)
     */
    public function updateUserPermissions(Request $request, $id): JsonResponse
    {
        $actor = $request->user();
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'action' => 'required|in:GRANT,DENY,RESTORE',
            'reason' => 'nullable|string|max:500',
        ]);

        $permId = $validated['permission_id'];
        $action = $validated['action'];
        $reason = $validated['reason'] ?? null;
        $permission = Permission::findOrFail($permId);

        $existing = UserPermission::where('user_id', $user->id)->where('permission_id', $permId)->first();
        $oldState = $existing ? $existing->toArray() : null;

        if ($action === 'RESTORE') {
            // Remove override, revert to role inheritance
            if ($existing) {
                $existing->delete();
            }
            $this->audit->log(
                $request,
                'USER_PERMISSION_RESTORED',
                'user',
                $user->id,
                $oldState,
                ['status' => 'inherited_from_role'],
                "Restored default role inheritance for permission {$permission->name} on user {$user->full_name}: {$reason}"
            );
        } else {
            $isGranted = ($action === 'GRANT');
            $userPerm = UserPermission::updateOrCreate(
                ['user_id' => $user->id, 'permission_id' => $permId],
                [
                    'is_granted' => $isGranted,
                    'created_by' => $actor->id,
                    'reason' => $reason,
                ]
            );

            $this->audit->log(
                $request,
                $isGranted ? 'USER_PERMISSION_GRANTED' : 'USER_PERMISSION_DENIED',
                'user',
                $user->id,
                $oldState,
                $userPerm->toArray(),
                ($isGranted ? "Granted additional permission " : "Denied permission ") . "{$permission->name} on user {$user->full_name}: {$reason}"
            );
        }

        return response()->json([
            'message' => 'User permission override updated successfully',
            'effective_permissions' => $user->fresh()->getEffectivePermissions(),
        ]);
    }

    /**
     * Change user role with strict hierarchy validation
     */
    public function changeUserRole(Request $request, $id): JsonResponse
    {
        $actor = $request->user();
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|string|exists:roles,name',
            'reason' => 'nullable|string|max:500',
        ]);

        $targetRole = strtoupper($validated['role']);
        $oldRole = $user->role;

        // 1. Role hierarchy check: Only SUPER_ADMIN can assign SUPER_ADMIN
        if ($targetRole === 'SUPER_ADMIN' && $actor->role !== 'SUPER_ADMIN') {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Only a Super Administrator can assign the Super Administrator role.',
            ], 403);
        }

        // 2. Prevent removing the last SUPER_ADMIN
        if ($oldRole === 'SUPER_ADMIN' && $targetRole !== 'SUPER_ADMIN') {
            $superAdminCount = User::where('role', 'SUPER_ADMIN')->where('status', 'ACTIVE')->count();
            if ($superAdminCount <= 1) {
                return response()->json([
                    'error' => 'Conflict',
                    'message' => 'Cannot demote the last remaining Super Administrator in the system.',
                ], 422);
            }
        }

        // 3. Prevent self-demotion or self-escalation if not authorized
        if ($user->id === $actor->id && $actor->role !== 'SUPER_ADMIN') {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You cannot modify your own administrator role.',
            ], 403);
        }

        $user->update(['role' => $targetRole]);

        $this->audit->log(
            $request,
            'USER_ROLE_CHANGED',
            'user',
            $user->id,
            ['role' => $oldRole],
            ['role' => $targetRole],
            "Changed role of {$user->full_name} from {$oldRole} to {$targetRole}. Reason: " . ($validated['reason'] ?? 'Not specified')
        );

        return response()->json([
            'message' => "User role updated to {$targetRole}",
            'user' => $user->fresh(),
        ]);
    }
}
