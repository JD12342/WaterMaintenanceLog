<?php

use App\Http\Controllers\WebDashboardController;
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
        'flash' => [
            'success' => session('success'),
        ],
    ]);
})->name('home');

// Public complaint submission (no auth)
Route::post('/complaints/public', [WebDashboardController::class, 'submitPublicComplaint'])->name('complaints.public');

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

// Logout route — session-only, no DB queries
Route::post('/logout', function (Request $request) {
    // Skip Auth::logout() — it runs SELECT + UPDATE remember_token against remote DB
    // Just destroying the session is sufficient to log the user out
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->name('logout');

// Authenticated routes
Route::middleware(['auth'])->group(function () {
    
    // Dashboard - Inertia-rendered with server-side data (no API calls)
    Route::get('/dashboard', [WebDashboardController::class, 'index'])->name('dashboard');

    // Dashboard actions (POST routes for mutations)
    Route::post('/dashboard/complaints', [WebDashboardController::class, 'submitComplaint']);
    Route::post('/dashboard/complaints/{complaint}/forward', [WebDashboardController::class, 'forwardToEngineering']);
    Route::post('/dashboard/complaints/{complaint}/approve', [WebDashboardController::class, 'approveComplaint']);
    Route::post('/dashboard/complaints/{complaint}/decline', [WebDashboardController::class, 'declineComplaint']);
    Route::post('/dashboard/work-orders', [WebDashboardController::class, 'createWorkOrder']);
    Route::post('/dashboard/work-orders/{workOrder}/start', [WebDashboardController::class, 'startWork']);
    Route::post('/dashboard/work-orders/{workOrder}/complete', [WebDashboardController::class, 'completeWork']);
    Route::post('/dashboard/reports', [WebDashboardController::class, 'submitReport']);
    Route::post('/dashboard/users', [WebDashboardController::class, 'createUser']);
    Route::put('/dashboard/users/{user}', [WebDashboardController::class, 'updateUser']);
    Route::delete('/dashboard/users/{user}', [WebDashboardController::class, 'deleteUser']);

    // Complaints Management - Redirect to dashboard view
    Route::get('/complaints', function () {
        return redirect('/dashboard?view=complaints');
    })->name('complaints.index');

    Route::get('/complaints/submit', function () {
        return redirect('/dashboard?view=complaints');
    })->name('complaints.create');

    // Work Orders Management - Redirect to dashboard view
    Route::middleware(['role:ADMIN,ENGINEERING,MAINTENANCE'])->group(function () {
        Route::get('/work-orders', function () {
            return redirect('/dashboard?view=work-orders');
        })->name('work-orders.index');

        Route::get('/work-orders/{id}', function ($id) {
            return redirect('/dashboard?view=work-orders');
        })->name('work-orders.show');
    });

    // Maintenance Reports - Redirect to dashboard view
    Route::get('/maintenance-reports', function () {
        return redirect('/dashboard?view=reports');
    })->name('maintenance-reports.index');

    Route::middleware(['role:MAINTENANCE'])->group(function () {
        Route::get('/maintenance-reports/create', function () {
            return redirect('/dashboard?view=submit-report');
        })->name('maintenance-reports.create');
    });

    // Admin only routes - Redirect to dashboard views
    Route::middleware(['role:ADMIN'])->group(function () {
        Route::get('/admin/users', function () {
            return redirect('/dashboard?view=users');
        })->name('admin.users');

        Route::get('/admin/settings', function () {
            return redirect('/dashboard');
        })->name('admin.settings');
    });

    // Engineering only routes - Redirect to dashboard views
    Route::middleware(['role:ENGINEERING'])->group(function () {
        Route::get('/engineering/review', function () {
            return redirect('/dashboard?view=pending-approvals');
        })->name('engineering.review');
    });

    // Maintenance staff routes - Redirect to dashboard views
    Route::middleware(['role:MAINTENANCE'])->group(function () {
        Route::get('/maintenance/my-work', function () {
            return redirect('/dashboard?view=assigned-tasks');
        })->name('maintenance.work');
    });
});

// Catch-all route for any other paths (redirect to home)
Route::get('/{any}', function () {
    return redirect('/');
})->where('any', '^(?!api).*$'); // Exclude API routes
