<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

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
    if (Auth::check()) {
        return redirect('/dashboard');
    }

    return Inertia::render('Home', [
        'auth' => [
            'user' => null,
        ],
    ]);
})->name('home');

// Authentication routes
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return view('auth.login');
    })->name('login');
    
    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    });
    
    Route::get('/register', function () {
        return view('auth.register');
    })->name('register');
});

// Logout route
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->name('logout');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    
    // Dashboard - Pass role-based data from server
    Route::get('/dashboard', function () {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $role = $user->role;
        $userId = (int) Auth::id();
        
        // Get basic stats based on role
        $stats = [];
        if ($role === 'ADMIN') {
            $stats = [
                'totalUsers' => \App\Models\User::count(),
                'totalComplaints' => \App\Models\Complaint::count(),
                'pendingComplaints' => \App\Models\Complaint::where('status', 'pending')->count(),
                'activeWorkOrders' => \App\Models\WorkOrder::whereNotIn('status', ['completed', 'closed'])->count(),
            ];
        } elseif ($role === 'ENGINEERING') {
            $stats = [
                'pendingReview' => \App\Models\Complaint::where('status', 'submitted_to_engineering')->count(),
                'approvedThisMonth' => \App\Models\Complaint::where('status', 'approved')
                    ->whereMonth('updated_at', now()->month)->count(),
            ];
        } elseif ($role === 'MAINTENANCE') {
            $stats = [
                'assignedWork' => \App\Models\WorkOrder::where('assigned_to', $userId)
                    ->whereNotIn('status', ['completed', 'closed'])->count(),
                'completedThisMonth' => \App\Models\WorkOrder::where('assigned_to', $userId)
                    ->where('status', 'completed')
                    ->whereMonth('updated_at', now()->month)->count(),
            ];
        } else {
            $stats = [
                'myComplaints' => \App\Models\Complaint::where('user_id', $userId)->count(),
                'pendingComplaints' => \App\Models\Complaint::where('user_id', $userId)
                    ->where('status', 'pending')->count(),
            ];
        }
        
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'stats' => $stats,
            'role' => $role
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
