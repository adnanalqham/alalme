<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Role;
use App\Models\Permission;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class AdminRoleController extends Controller
{
    protected AuditService $audit;

    public function __construct(AuditService $audit)
    {
        $this->audit = $audit;
    }

    /**
     * List all roles with permission count and user count
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::withCount(['permissions', 'users'])->orderBy('id', 'asc')->get();

        return response()->json([
            'data' => $roles,
            'roles' => $roles,
            'total' => $roles->count(),
        ]);
    }

    /**
     * Show single role details with permissions and users
     */
    public function show($id): JsonResponse
    {
        $role = Role::with(['permissions', 'users:id,full_name,email,role,status,shop_id'])->findOrFail($id);

        return response()->json([
            'data' => $role,
        ]);
    }

    /**
     * Create a new custom role
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name|regex:/^[A-Z0-9_]+$/',
            'display_name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'status' => 'nullable|in:ACTIVE,INACTIVE',
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => strtoupper($validated['name']),
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? null,
            'label_ar' => $validated['display_name'],
            'label_en' => $validated['name'],
            'status' => $validated['status'] ?? 'ACTIVE',
            'is_system' => false, // Custom roles only
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        $this->audit->log(
            $request,
            'ROLE_CREATED',
            'role',
            (string)$role->id,
            null,
            $role->load('permissions')->toArray(),
            "Created custom role {$role->name}"
        );

        return response()->json([
            'message' => 'Role created successfully',
            'data' => $role->load(['permissions', 'users']),
        ], 201);
    }

    /**
     * Update an existing role
     */
    public function update(Request $request, $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        $oldRole = $role->toArray();

        $validated = $request->validate([
            'display_name' => 'sometimes|string|max:150',
            'description' => 'nullable|string|max:500',
            'status' => 'sometimes|in:ACTIVE,INACTIVE',
            'permissions' => 'nullable|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        // If system role, preserve system status and immutable name
        if ($role->is_system && isset($validated['status']) && $validated['status'] === 'INACTIVE') {
            return response()->json([
                'error' => 'Unprocessable Entity',
                'message' => 'System roles cannot be deactivated.',
            ], 422);
        }

        $role->update([
            'display_name' => $validated['display_name'] ?? $role->display_name,
            'description' => $validated['description'] ?? $role->description,
            'label_ar' => $validated['display_name'] ?? $role->label_ar,
            'status' => $validated['status'] ?? $role->status,
        ]);

        if (isset($validated['permissions'])) {
            $role->permissions()->sync($validated['permissions']);
        }

        $this->audit->log(
            $request,
            'ROLE_UPDATED',
            'role',
            (string)$role->id,
            $oldRole,
            $role->fresh()->load('permissions')->toArray(),
            "Updated role {$role->name}"
        );

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => $role->fresh()->load(['permissions', 'users']),
        ]);
    }

    /**
     * Delete role (strictly protects system roles)
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $role = Role::withCount('users')->findOrFail($id);

        if ($role->is_system) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'System roles are protected and cannot be deleted.',
            ], 422);
        }

        if ($role->users_count > 0) {
            return response()->json([
                'error' => 'Conflict',
                'message' => "Cannot delete role {$role->name} because {$role->users_count} users are currently assigned to it.",
            ], 409);
        }

        $old = $role->toArray();
        $role->permissions()->detach();
        $role->delete();

        $this->audit->log(
            $request,
            'ROLE_DELETED',
            'role',
            (string)$id,
            $old,
            null,
            "Deleted custom role {$old['name']}"
        );

        return response()->json([
            'message' => 'Role deleted successfully',
        ]);
    }

    /**
     * Get permissions assigned to a role
     */
    public function getPermissions($id): JsonResponse
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json([
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'is_system' => $role->is_system,
            ],
            'permissions' => $role->permissions,
            'permission_ids' => $role->permissions->pluck('id')->toArray(),
        ]);
    }

    /**
     * Update permissions assigned to a role
     */
    public function updatePermissions(Request $request, $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Protect SUPER_ADMIN from having permissions stripped
        if ($role->name === 'SUPER_ADMIN') {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Super Administrator automatically possesses all system permissions.',
            ], 422);
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        $oldPermIds = $role->permissions()->pluck('permissions.id')->toArray();
        $role->permissions()->sync($validated['permissions']);

        $this->audit->log(
            $request,
            'ROLE_PERMISSIONS_SYNCED',
            'role',
            (string)$role->id,
            ['permission_ids' => $oldPermIds],
            ['permission_ids' => $validated['permissions']],
            "Updated permission matrix for role {$role->name}"
        );

        return response()->json([
            'message' => 'Role permissions updated successfully',
            'data' => $role->fresh()->load('permissions'),
        ]);
    }

    public function permissions($id): JsonResponse
    {
        return $this->getPermissions($id);
    }

    public function syncPermissions(Request $request, $id): JsonResponse
    {
        return $this->updatePermissions($request, $id);
    }

    /**
     * Duplicate a role with its permission set
     */
    public function duplicate(Request $request, $id): JsonResponse
    {
        $sourceRole = Role::with('permissions')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name|regex:/^[A-Z0-9_]+$/',
            'display_name' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
        ]);

        $newRole = Role::create([
            'name' => strtoupper($validated['name']),
            'display_name' => $validated['display_name'],
            'description' => $validated['description'] ?? "Cloned from {$sourceRole->display_name}",
            'label_ar' => $validated['display_name'],
            'label_en' => $validated['name'],
            'status' => 'ACTIVE',
            'is_system' => false,
        ]);

        $newRole->permissions()->sync($sourceRole->permissions->pluck('id')->toArray());

        $this->audit->log(
            $request,
            'ROLE_DUPLICATED',
            'role',
            (string)$newRole->id,
            ['cloned_from' => $sourceRole->name],
            $newRole->load('permissions')->toArray(),
            "Cloned role {$sourceRole->name} into {$newRole->name}"
        );

        return response()->json([
            'message' => 'Role duplicated successfully',
            'data' => $newRole->load('permissions'),
        ], 201);
    }
}
