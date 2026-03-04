<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\StatusManagementService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $statusService;
    
    public function __construct(StatusManagementService $statusService)
    {
        $this->statusService = $statusService;
    }
    
    /**
     * Redirect to role-based dashboard
     */
    public function index()
    {
        $user = Auth::user();
        
        switch ($user->role) {
            case 'ADMIN':
                return redirect()->route('admin.dashboard');
            case 'ENGINEERING':
                return redirect()->route('engineering.dashboard');
            case 'MAINTENANCE':
                return redirect()->route('maintenance.dashboard');
            case 'CONSUMER':
                return redirect()->route('consumer.dashboard');
            default:
                abort(403, 'Invalid user role');
        }
    }
}