<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequirePermission middleware.
 * Usage in routes: ->middleware('permission:PRODUCTS_CREATE')
 */
class RequirePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication required.',
            ], 401);
        }

        foreach ($permissions as $permission) {
            if (!$user->hasPermission($permission)) {
                return response()->json([
                    'error' => 'Forbidden',
                    'message' => "Missing required permission: {$permission}",
                    'required_permission' => $permission,
                ], 403);
            }
        }

        return $next($request);
    }
}
