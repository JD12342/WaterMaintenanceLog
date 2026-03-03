<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public routes
Route::get('/', function () {
    return Inertia::render('Home', [
        'auth' => [
            'user' => Auth::user()
        ]
    ]);
})->name('home');

// Simple authentication routes for testing
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return view('auth.login'); // Use blade view for now
    })->name('login');
    
    Route::get('/register', function () {
        return view('auth.register'); // Use blade view for now  
    })->name('register');
});

// Authenticated routes - FIXED: Using 'auth' instead of 'auth:sanctum'
Route::middleware(['auth'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('dashboard');

    // Complaints Management - Available to all authenticated users
    Route::get('/complaints', function () {
        return Inertia::render('Complaints/ViewComplaints', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('complaints.index');

    Route::get('/complaints/submit', function () {
        return Inertia::render('Complaints/SubmitComplaint', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('complaints.create');

    // Work Orders Management (Admin/Engineering/Maintenance)
    Route::middleware(['role:ADMIN,ENGINEERING,MAINTENANCE'])->group(function () {
        Route::get('/work-orders', function () {
            return Inertia::render('WorkOrders/ViewWorkOrders', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('work-orders.index');

        Route::get('/work-orders/{id}', function ($id) {
            return Inertia::render('WorkOrders/WorkOrderDetail', [
                'auth' => [
                    'user' => Auth::user()
                ],
                'workOrderId' => $id
            ]);
        })->name('work-orders.show');
    });

    // Maintenance Reports Management  
    Route::get('/maintenance-reports', function () {
        return Inertia::render('MaintenanceReports/ViewReports', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    })->name('maintenance-reports.index');

    // Maintenance staff only - Create report
    Route::middleware(['role:MAINTENANCE'])->group(function () {
        Route::get('/maintenance-reports/create', function () {
            return Inertia::render('MaintenanceReports/CreateReport', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('maintenance-reports.create');
    });

    // Admin only routes
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('/admin/users', function () {
            return Inertia::render('Admin/ManageUsers', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('admin.users');

        Route::get('/admin/settings', function () {
            return Inertia::render('Admin/Settings', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('admin.settings');
    });

    // Engineering only routes  
    Route::middleware(['role:ENGINEERING'])->group(function () {
        Route::get('/engineering/review', function () {
            return Inertia::render('Engineering/ReviewComplaints', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('engineering.review');
    });

    // Maintenance staff routes
    Route::middleware(['role:MAINTENANCE'])->group(function () {
        Route::get('/maintenance/my-work', function () {
            return Inertia::render('Maintenance/MyWork', [
                'auth' => [
                    'user' => Auth::user()
                ]
            ]);
        })->name('maintenance.work');
    });
});

// Catch-all route for any other paths (redirect to home)
Route::get('/{any}', function () {
    return redirect('/');
})->where('any', '^(?!api).*$'); // Exclude API routes
