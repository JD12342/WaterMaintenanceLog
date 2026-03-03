<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\WorkOrder;
use App\Models\MaintenanceReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get dashboard data based on user role
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $data = [
            'user' => $user->only(['id', 'name', 'email', 'role']),
            'timestamp' => now()->toISOString()
        ];

        // Role-specific dashboard data
        switch ($user->role->value) {
            case 'CONSUMER':
                $data = array_merge($data, $this->getConsumerDashboard($user));
                break;

            case 'ADMIN':
                $data = array_merge($data, $this->getAdminDashboard());
                break;

            case 'ENGINEERING':
                $data = array_merge($data, $this->getEngineeringDashboard());
                break;

            case 'MAINTENANCE':
                $data = array_merge($data, $this->getMaintenanceDashboard($user));
                break;
        }

        return response()->json($data);
    }

    /**
     * Consumer dashboard data
     */
    private function getConsumerDashboard($user): array
    {
        return [
            'my_complaints' => $user->complaints()
                ->with(['workOrder'])
                ->orderBy('submitted_at', 'desc')
                ->limit(5)
                ->get(),
            'stats' => [
                'total_complaints' => $user->complaints()->count(),
                'pending' => $user->complaints()->where('status', 'pending')->count(),
                'approved' => $user->complaints()->where('status', 'approved')->count(),
                'completed' => $user->complaints()->whereHas('workOrder', function($q) {
                    $q->where('status', 'completed');
                })->count(),
            ]
        ];
    }

    /**
     * Admin dashboard data
     */
    private function getAdminDashboard(): array
    {
        return [
            'stats' => [
                'pending_complaints' => Complaint::where('status', 'pending')->count(),
                'pending_assignments' => WorkOrder::where('status', 'pending_assignment')->count(),
                'active_work_orders' => WorkOrder::where('status', 'in_progress')->count(),
                'total_users' => \App\Models\User::count(),
            ],
            'recent_complaints' => Complaint::with(['user'])
                ->orderBy('submitted_at', 'desc')
                ->limit(5)
                ->get(),
            'recent_work_orders' => WorkOrder::with(['complaint.user', 'assignedToUser'])
                ->whereIn('status', ['assigned', 'in_progress'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Engineering dashboard data
     */
    private function getEngineeringDashboard(): array
    {
        return [
            'stats' => [
                'pending_reviews' => Complaint::where('status', 'submitted_to_engineering')->count(),
                'approved_this_month' => Complaint::where('status', 'approved')
                    ->whereMonth('updated_at', now()->month)
                    ->count(),
                'declined_this_month' => Complaint::where('status', 'declined')
                    ->whereMonth('updated_at', now()->month)
                    ->count(),
            ],
            'pending_complaints' => Complaint::where('status', 'submitted_to_engineering')
                ->with(['user'])
                ->orderBy('updated_at', 'asc')
                ->limit(10)
                ->get(),
            'recent_approved' => Complaint::where('status', 'approved')
                ->with(['user', 'workOrder'])
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * Maintenance dashboard data
     */
    private function getMaintenanceDashboard($user): array
    {
        return [
            'stats' => [
                'my_assigned_work' => $user->workOrdersAssignedToMe()
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->count(),
                'completed_this_month' => $user->workOrdersAssignedToMe()
                    ->where('status', 'completed')
                    ->whereMonth('actual_completion_date', now()->month)
                    ->count(),
                'pending_reports' => WorkOrder::where('assigned_to', $user->id)
                    ->where('status', 'completed')
                    ->whereDoesntHave('maintenanceReport')
                    ->count(),
            ],
            'my_work_orders' => $user->workOrdersAssignedToMe()
                ->with(['complaint.user'])
                ->whereIn('status', ['assigned', 'in_progress'])
                ->orderBy('estimated_completion_date', 'asc')
                ->limit(10)
                ->get(),
            'completed_work_orders' => $user->workOrdersAssignedToMe()
                ->with(['complaint', 'maintenanceReport'])
                ->where('status', 'completed')
                ->orderBy('actual_completion_date', 'desc')
                ->limit(5)
                ->get(),
        ];
    }
}
