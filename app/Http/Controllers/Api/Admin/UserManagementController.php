<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * List all users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Filter by role if specified
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->select('id', 'name', 'email', 'role', 'created_at')
                       ->orderBy('created_at', 'desc')
                       ->paginate(15);

        return response()->json($users);
    }

    /**
     * Get specific user
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
        ]);
    }

    /**
     * Create new user (maintenance staff/worker)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:ADMIN,ENGINEERING,MAINTENANCE,CONSUMER'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Update user details
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|unique:users,email,{$user->getKey()}",
            'role' => 'sometimes|in:ADMIN,ENGINEERING,MAINTENANCE,CONSUMER'
        ]);

        $user->update($request->only(['name', 'email', 'role']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Delete user
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent deleting yourself
        if ($user->getKey() === auth()->user()?->getKey()) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get maintenance staff for assignment
     */
    public function getMaintenanceStaff(): JsonResponse
    {
        $staff = User::where('role', 'MAINTENANCE')
                    ->select('id', 'name', 'email')
                    ->orderBy('name')
                    ->get();

        return response()->json([
            'staff' => $staff
        ]);
    }
}
