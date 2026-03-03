<?php

namespace App\Http\Middleware;

use App\Models\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $userRole = $user->role;
        
        // Convert string roles to UserRole enum cases
        $allowedRoles = collect($roles)
            ->map(fn($role) => UserRole::tryFrom($role))
            ->filter() // Remove null values (invalid roles)
            ->toArray();

        if (empty($allowedRoles)) {
            return response()->json(['error' => 'Invalid role specified'], 500);
        }

        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have permission to access this resource',
                'required_roles' => $roles,
                'user_role' => $userRole->value
            ], 403);
        }

        return $next($request);
    }
}