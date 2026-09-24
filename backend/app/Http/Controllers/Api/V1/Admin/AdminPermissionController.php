<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminPermissionController extends Controller
{
    /**
     * List all permissions with module grouping and counts
     */
    public function index(Request $request): JsonResponse
    {
        $query = Permission::orderBy('module', 'asc')->orderBy('name', 'asc');

        if ($module = $request->query('module')) {
            $query->where('module', $module);
        }

        if ($scope = $request->query('scope')) {
            $query->where('scope', $scope);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('display_name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $permissions = $query->get();

        // Group by module
        $grouped = $permissions->groupBy('module');

        // Module statistics
        $moduleStats = Permission::selectRaw('module, count(*) as count')
            ->groupBy('module')
            ->pluck('count', 'module');

        return response()->json([
            'data' => $permissions,
            'permissions' => $permissions,
            'grouped' => $grouped,
            'modules' => $moduleStats,
            'total' => $permissions->count(),
        ]);
    }

    /**
     * Return comprehensive matrix of roles and permissions
     */
    public function matrix(Request $request): JsonResponse
    {
        $roles = Role::where('status', 'ACTIVE')->with('permissions:id,name')->get();
        $permissions = Permission::orderBy('module', 'asc')->orderBy('name', 'asc')->get();

        $modules = $permissions->groupBy('module')->map(function ($items, $mod) {
            return [
                'module' => $mod,
                'permissions' => $items,
            ];
        })->values();

        // Matrix map: [role_id][permission_id] => boolean
        $matrix = [];
        foreach ($roles as $r) {
            $matrix[$r->id] = $r->permissions->pluck('id')->toArray();
        }

        return response()->json([
            'roles' => $roles->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'display_name' => $r->display_name,
                'is_system' => $r->is_system,
            ]),
            'modules' => $modules,
            'permissions' => $permissions,
            'matrix' => $matrix,
        ]);
    }
}
