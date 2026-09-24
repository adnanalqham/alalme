<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RequireRole middleware.
 * Usage in routes: ->middleware('role:ADMIN') or ->middleware('role:ADMIN,SUPER_ADMIN')
 */
class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Authentication required.',
            ], 401);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have the required role to access this resource.',
                'required_roles' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
