<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\WorkOrder;
use App\Models\MaintenanceReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard data based on user role
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'user'      => $user->only(['id', 'name', 'email', 'role']),
            'timestamp' => now()->toISOString(),
        ];

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
     * Consumer dashboard — 2 queries total (1 stats + 1 list)
     */
    private function getConsumerDashboard($user): array
    {
        // Single query: all counts in one round-trip
        $stats = DB::selectOne("
            SELECT
                COUNT(*)                                                        AS total_complaints,
                COUNT(*) FILTER (WHERE status = 'pending')                      AS pending,
                COUNT(*) FILTER (WHERE status = 'approved')                     AS approved,
                COUNT(*) FILTER (WHERE status = 'submitted_to_engineering')     AS under_review,
                COUNT(*) FILTER (WHERE id IN (
                    SELECT complaint_id FROM work_orders WHERE status = 'completed'
                ))                                                              AS completed
            FROM complaints
            WHERE user_id = ?
        ", [$user->id]);

        $myComplaints = Complaint::with(['workOrder'])
            ->where('user_id', $user->id)
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'my_complaints' => $myComplaints,
            'stats' => [
                'total_complaints' => (int) $stats->total_complaints,
                'pending'          => (int) $stats->pending,
                'approved'         => (int) $stats->approved,
                'under_review'     => (int) $stats->under_review,
                'completed'        => (int) $stats->completed,
            ],
        ];
    }

    /**
     * Admin dashboard — 3 queries total (1 stats + 1 recent complaints + 1 recent work orders)
     */
    private function getAdminDashboard(): array
    {
        $month = now()->month;
        $year  = now()->year;

        // Single query: all admin counts in one round-trip
        $stats = DB::selectOne("
            SELECT
                (SELECT COUNT(*) FROM complaints  WHERE status = 'pending')                                               AS pending_complaints,
                (SELECT COUNT(*) FROM work_orders WHERE status = 'pending_assignment')                                    AS pending_assignments,
                (SELECT COUNT(*) FROM work_orders WHERE status IN ('assigned','in_progress'))                             AS active_work_orders,
                (SELECT COUNT(*) FROM work_orders WHERE status = 'completed'
                    AND EXTRACT(MONTH FROM actual_completion_date) = ? AND EXTRACT(YEAR FROM actual_completion_date) = ?) AS completed_this_month,
                (SELECT COUNT(*) FROM users)                                                                              AS total_users
        ", [$month, $year]);

        $recentComplaints = Complaint::with(['user'])
            ->orderBy('submitted_at', 'desc')
            ->limit(5)
            ->get();

        $recentWorkOrders = WorkOrder::with(['complaint.user', 'assignedToUser'])
            ->whereIn('status', ['assigned', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return [
            'stats' => [
                'pending_complaints'   => (int) $stats->pending_complaints,
                'pending_assignments'  => (int) $stats->pending_assignments,
                'active_work_orders'   => (int) $stats->active_work_orders,
                'completed_this_month' => (int) $stats->completed_this_month,
                'total_users'          => (int) $stats->total_users,
            ],
            'recent_complaints'  => $recentComplaints,
            'recent_work_orders' => $recentWorkOrders,
        ];
    }

    /**
     * Engineering dashboard — 3 queries total (1 stats + 1 pending list + 1 decisions list)
     */
    private function getEngineeringDashboard(): array
    {
        $weekStart = now()->startOfWeek()->toDateTimeString();
        $weekEnd   = now()->endOfWeek()->toDateTimeString();

        // Single query: all engineering counts in one round-trip
        $stats = DB::selectOne("
            SELECT
                (SELECT COUNT(*) FROM complaints        WHERE status = 'submitted_to_engineering')              AS pending_reviews,
                (SELECT COUNT(*) FROM complaints        WHERE status = 'approved'
                    AND updated_at BETWEEN ? AND ?)                                                             AS approved_this_week,
                (SELECT COUNT(*) FROM complaints        WHERE status = 'declined'
                    AND updated_at BETWEEN ? AND ?)                                                             AS declined_this_week,
                (SELECT COUNT(*) FROM complaint_approvals)                                                      AS total_reviews
        ", [$weekStart, $weekEnd, $weekStart, $weekEnd]);

        $pendingComplaints = Complaint::where('status', 'submitted_to_engineering')
            ->with(['user'])
            ->orderBy('updated_at', 'asc')
            ->limit(10)
            ->get();

        $recentDecisions = \App\Models\ComplaintApproval::with(['complaint'])
            ->orderBy('reviewed_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'reviewed_at' => $a->reviewed_at,
                'complaint'   => $a->complaint ? ['title' => $a->complaint->title] : null,
            ]);

        return [
            'engineering_stats' => [
                'pending_reviews'    => (int) $stats->pending_reviews,
                'approved_this_week' => (int) $stats->approved_this_week,
                'declined_this_week' => (int) $stats->declined_this_week,
                'total_reviews'      => (int) $stats->total_reviews,
            ],
            'pending_complaints'            => $pendingComplaints,
            'engineering_recent_decisions'  => $recentDecisions,
        ];
    }

    /**
     * Maintenance dashboard — 3 queries total (1 stats + 1 active tasks + 1 completed tasks)
     */
    private function getMaintenanceDashboard($user): array
    {
        $month = now()->month;
        $year  = now()->year;

        // Single query: all maintenance counts + hours sum in one round-trip
        $stats = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE status = 'assigned')                                                         AS assigned_tasks,
                COUNT(*) FILTER (WHERE status = 'in_progress')                                                      AS in_progress_tasks,
                COUNT(*) FILTER (WHERE status = 'completed'
                    AND EXTRACT(MONTH FROM actual_completion_date) = ?
                    AND EXTRACT(YEAR  FROM actual_completion_date) = ?)                                             AS completed_this_month,
                COALESCE((
                    SELECT SUM(hours_worked) FROM maintenance_reports
                    WHERE reported_by = ?
                    AND EXTRACT(MONTH FROM reported_at) = ?
                    AND EXTRACT(YEAR  FROM reported_at) = ?
                ), 0)                                                                                               AS total_hours_this_month
            FROM work_orders
            WHERE assigned_to = ?
        ", [$month, $year, $user->id, $month, $year, $user->id]);

        $myWorkOrders = WorkOrder::with(['complaint.user'])
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->orderBy('estimated_completion_date', 'asc')
            ->limit(10)
            ->get();

        $completedWorkOrders = WorkOrder::with(['complaint', 'maintenanceReport'])
            ->where('assigned_to', $user->id)
            ->where('status', 'completed')
            ->orderBy('actual_completion_date', 'desc')
            ->limit(5)
            ->get();

        return [
            'maintenance_stats' => [
                'assigned_tasks'         => (int) $stats->assigned_tasks,
                'in_progress_tasks'      => (int) $stats->in_progress_tasks,
                'completed_this_month'   => (int) $stats->completed_this_month,
                'total_hours_this_month' => (float) $stats->total_hours_this_month,
            ],
            'my_work_orders'        => $myWorkOrders,
            'completed_work_orders' => $completedWorkOrders,
        ];
    }
}
