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
    // User Profile & Authentication
    Route::get('/user', [\App\Http\Controllers\Api\UserController::class, 'profile']);
    Route::post('/logout', [\App\Http\Controllers\Api\UserController::class, 'logout']);
    Route::post('/logout-all', [\App\Http\Controllers\Api\UserController::class, 'logoutAll']);
    Route::post('/change-password', [\App\Http\Controllers\Api\UserController::class, 'changePassword']);
});

// Public complaint submission (legacy endpoint)
Route::post('/complaints/public', [\App\Http\Controllers\Api\ComplaintController::class, 'storePublic']);

// API v1 routes
Route::prefix('v1')->group(function() {
    // Public routes
    Route::get('/status', function () {
        return response()->json([
            'status' => 'API is running',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString()
        ]);
    });
    
    // Public complaint submission
    Route::post('/complaints/public', [\App\Http\Controllers\Api\ComplaintController::class, 'storePublic']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Dashboard - Role-based
        Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);
        
        // Admin-only routes
        Route::middleware('role:ADMIN')->prefix('admin')->group(function () {
            // User Management
            Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserManagementController::class);
            Route::get('maintenance-staff', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'getMaintenanceStaff']);
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

        // STATUS MANAGEMENT SYSTEM
        Route::get('status/info', [\App\Http\Controllers\Api\StatusController::class, 'getStatusInfo']);
        Route::get('status/transitions', [\App\Http\Controllers\Api\StatusController::class, 'getAllowedTransitions']);
        Route::put('complaints/{complaint}/status', [\App\Http\Controllers\Api\StatusController::class, 'updateComplaintStatus']);
        Route::put('work-orders/{workOrder}/status', [\App\Http\Controllers\Api\StatusController::class, 'updateWorkOrderStatus']);
    });
});