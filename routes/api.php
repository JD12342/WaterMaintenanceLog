<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health checks (public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'service' => config('app.name')
    ]);
});

// Authentication routes (public)
Route::post('/register', function (Request $request) {
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|string|min:8|confirmed',
        'role' => 'sometimes|in:ADMIN,ENGINEERING,MAINTENANCE,CONSUMER'
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => $request->role ?? 'CONSUMER', // Default to CONSUMER if not specified
    ]);

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
        'token_type' => 'Bearer'
    ], 201);
});

Route::post('/login', function (Request $request) {
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    $token = $user->createToken('api-token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
        'token_type' => 'Bearer'
    ]);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Get authenticated user
    Route::get('/user', function (Request $request) {
        return response()->json([
            'user' => $request->user(),
            'tokens_count' => $request->user()->tokens()->count()
        ]);
    });

    // Logout (revoke current token)
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    });

    // Logout from all devices (revoke all tokens)
    Route::post('/logout-all', function (Request $request) {
        $request->user()->tokens()->delete();
        
        return response()->json([
            'message' => 'Successfully logged out from all devices'
        ]);
    });
});

// API v1 routes
Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/status', function () {
        return response()->json([
            'status' => 'API is running',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString()
        ]);
    });
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Add your authenticated API routes here
        Route::get('/dashboard', function (Request $request) {
            return response()->json([
                'message' => 'Welcome to the dashboard',
                'user' => $request->user()->name,
                'role' => $request->user()->role->value,
                'timestamp' => now()->toISOString()
            ]);
        });
        
        // Admin-only routes
        Route::middleware('role:ADMIN')->group(function () {
            Route::get('/admin/users', function () {
                return response()->json([
                    'message' => 'Admin users list',
                    'users' => User::select('id', 'name', 'email', 'role', 'created_at')->paginate(10)
                ]);
            });
            
            Route::post('/admin/users/{user}/role', function (Request $request, User $user) {
                $request->validate([
                    'role' => 'required|in:ADMIN,ENGINEERING,MAINTENANCE,CONSUMER'
                ]);
                
                $user->update(['role' => $request->role]);
                
                return response()->json([
                    'message' => 'User role updated successfully',
                    'user' => $user->fresh(['id', 'name', 'email', 'role'])
                ]);
            });
        });
        
        // Engineering & Maintenance routes
        Route::middleware('role:ENGINEERING,MAINTENANCE')->group(function () {
            Route::get('/maintenance/reports', function (Request $request) {
                return response()->json([
                    'message' => 'Maintenance reports access',
                    'user_role' => $request->user()->role->value,
                    'reports' => ['report1', 'report2', 'report3']
                ]);
            });
        });
        
        // Maintenance-only routes
        Route::middleware('role:MAINTENANCE')->group(function () {
            Route::post('/maintenance/work-orders', function (Request $request) {
                return response()->json([
                    'message' => 'Work order created',
                    'created_by' => $request->user()->name,
                    'role' => $request->user()->role->value
                ]);
            });
        });

        // ==============================================
        // WATER MAINTENANCE WORKFLOW API ROUTES
        // ==============================================

        // COMPLAINTS MANAGEMENT
        Route::apiResource('complaints', \App\Http\Controllers\Api\ComplaintController::class);
        
        // Complaint workflow actions
        Route::post('complaints/{complaint}/submit-to-engineering', [\App\Http\Controllers\Api\ComplaintController::class, 'submitToEngineering']);
        Route::post('complaints/{complaint}/approve', [\App\Http\Controllers\Api\ComplaintController::class, 'approve']);
        Route::post('complaints/{complaint}/decline', [\App\Http\Controllers\Api\ComplaintController::class, 'decline']);

        // WORK ORDERS MANAGEMENT
        Route::apiResource('work-orders', \App\Http\Controllers\Api\WorkOrderController::class);
        
        // Work order workflow actions
        Route::post('work-orders/{work_order}/assign', [\App\Http\Controllers\Api\WorkOrderController::class, 'assign']);
        Route::post('work-orders/{work_order}/start-work', [\App\Http\Controllers\Api\WorkOrderController::class, 'startWork']);
        Route::post('work-orders/{work_order}/complete-work', [\App\Http\Controllers\Api\WorkOrderController::class, 'completeWork']);
        
        // Get maintenance staff for assignment (Admin only)
        Route::get('maintenance-staff', [\App\Http\Controllers\Api\WorkOrderController::class, 'getMaintenanceStaff']);

        // MAINTENANCE REPORTS MANAGEMENT
        Route::apiResource('maintenance-reports', \App\Http\Controllers\Api\MaintenanceReportController::class);
        
        // Maintenance report helpers
        Route::get('maintenance-reports-stats', [\App\Http\Controllers\Api\MaintenanceReportController::class, 'getStats']);
        Route::get('completed-work-orders', [\App\Http\Controllers\Api\MaintenanceReportController::class, 'getCompletedWorkOrders']);

        // DASHBOARD AND OVERVIEW ROUTES
        Route::get('workflow-dashboard', function (Request $request) {
            $user = $request->user();
            
            $data = [
                'user' => $user->only(['id', 'name', 'email', 'role']),
                'timestamp' => now()->toISOString()
            ];

            // Role-specific dashboard data
            switch ($user->role->value) {
                case 'CONSUMER':
                    $data['my_complaints'] = $user->complaints()
                        ->with(['workOrder'])
                        ->orderBy('submitted_at', 'desc')
                        ->limit(5)
                        ->get();
                    $data['complaints_count'] = $user->complaints()->count();
                    break;

                case 'ADMIN':
                    $data['pending_complaints'] = \App\Models\Complaint::where('status', 'pending')->count();
                    $data['pending_assignments'] = \App\Models\WorkOrder::where('status', 'pending_assignment')->count();
                    $data['active_work_orders'] = \App\Models\WorkOrder::where('status', 'in_progress')->count();
                    $data['recent_complaints'] = \App\Models\Complaint::with(['user'])
                        ->orderBy('submitted_at', 'desc')
                        ->limit(5)
                        ->get();
                    break;

                case 'ENGINEERING':
                    $data['pending_reviews'] = \App\Models\Complaint::where('status', 'submitted_to_engineering')->count();
                    $data['approved_this_month'] = \App\Models\Complaint::where('status', 'approved')
                        ->whereMonth('updated_at', now()->month)
                        ->count();
                    $data['pending_complaints'] = \App\Models\Complaint::where('status', 'submitted_to_engineering')
                        ->with(['user'])
                        ->orderBy('updated_at', 'asc')
                        ->limit(5)
                        ->get();
                    break;

                case 'MAINTENANCE':
                    $data['my_assigned_work'] = $user->workOrdersAssignedToMe()
                        ->whereIn('status', ['assigned', 'in_progress'])
                        ->count();
                    $data['completed_this_month'] = $user->workOrdersAssignedToMe()
                        ->where('status', 'completed')
                        ->whereMonth('actual_completion_date', now()->month)
                        ->count();
                    $data['pending_reports'] = \App\Models\WorkOrder::where('assigned_to', $user->id)
                        ->where('status', 'completed')
                        ->whereDoesntHave('maintenanceReport')
                        ->count();
                    $data['my_work_orders'] = $user->workOrdersAssignedToMe()
                        ->with(['complaint.user'])
                        ->whereIn('status', ['assigned', 'in_progress'])
                        ->orderBy('estimated_completion_date', 'asc')
                        ->limit(5)
                        ->get();
                    break;
            }

            return response()->json($data);
        });
    });
});