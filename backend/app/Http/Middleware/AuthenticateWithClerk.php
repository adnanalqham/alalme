<?php

namespace App\Http\Middleware;

use App\Services\ClerkAuthService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithClerk
{
    protected ClerkAuthService $clerkAuth;

    public function __construct(ClerkAuthService $clerkAuth)
    {
        $this->clerkAuth = $clerkAuth;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        $token = $request->bearerToken();

        // Check if token is missing
        if (!$token) {
            // If route permits optional guest auth, continue
            if ($guard === 'optional') {
                return $next($request);
            }

            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Missing or invalid Clerk Bearer token.',
            ], 401);
        }

        // Verify Clerk JWT
        $claims = $this->clerkAuth->verifyToken($token);

        if (!$claims || !isset($claims['sub'])) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Invalid or expired Clerk token.',
            ], 401);
        }

        $clerkUserId = $claims['sub'];

        // Synchronize or resolve ALA user
        $user = $this->clerkAuth->resolveUser($clerkUserId, $claims);

        if (!$user) {
            return response()->json([
                'error' => 'Unauthorized',
                'message' => 'Unable to resolve ALA user account.',
            ], 401);
        }

        // Account status check
        if ($user->status === 'SUSPENDED') {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'Your ALA account has been suspended.',
            ], 403);
        }

        // Bind user to request AND Laravel Auth facade
        $request->setUserResolver(fn () => $user);
        auth()->setUser($user);
        \Illuminate\Support\Facades\Auth::setUser($user);

        return $next($request);
    }
}
