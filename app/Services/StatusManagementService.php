<?php

namespace App\Services;

use App\Models\Complaint;
use App\Models\WorkOrder;
use App\Models\ComplaintApproval;
use App\Models\MaintenanceReport;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class StatusManagementService
{
    // Complaint Status Flow
    const COMPLAINT_STATUSES = [
        'pending' => 'Pending Review',
        'reviewed' => 'Under Admin Review', 
        'submitted_to_engineering' => 'Engineering Review',
        'approved' => 'Approved for Work',
        'declined' => 'Declined',
        'work_assigned' => 'Work Assigned',
        'in_progress' => 'Work In Progress',
        'completed' => 'Work Completed',
        'closed' => 'Closed'
    ];

    // Work Order Status Flow
    const WORK_ORDER_STATUSES = [
        'created' => 'Created',
        'assigned' => 'Assigned to Technician',
        'in_progress' => 'Work In Progress',
        'completed' => 'Completed',
        'verified' => 'Verified'
    ];

    // Priority Levels
    const PRIORITY_LEVELS = [
        'low' => 'Low Priority',
        'normal' => 'Normal Priority',
        'high' => 'High Priority', 
        'urgent' => 'Urgent Priority'
    ];

    /**
     * Get allowed status transitions for complaints
     */
    public function getAllowedComplaintTransitions(string $currentStatus, string $userRole): array
    {
        $transitions = [
            'pending' => [
                'ADMIN' => ['reviewed', 'submitted_to_engineering', 'closed'],
                'ENGINEERING' => [],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'reviewed' => [
                'ADMIN' => ['submitted_to_engineering', 'closed'],
                'ENGINEERING' => [],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'submitted_to_engineering' => [
                'ADMIN' => ['closed'],
                'ENGINEERING' => ['approved', 'declined'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'approved' => [
                'ADMIN' => ['work_assigned', 'closed'],
                'ENGINEERING' => ['work_assigned'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'declined' => [
                'ADMIN' => ['pending', 'closed'],
                'ENGINEERING' => ['pending'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'work_assigned' => [
                'ADMIN' => ['closed'],
                'ENGINEERING' => [],
                'MAINTENANCE' => ['in_progress'],
                'CONSUMER' => []
            ],
            'in_progress' => [
                'ADMIN' => ['closed'],
                'ENGINEERING' => [],
                'MAINTENANCE' => ['completed'],
                'CONSUMER' => []
            ],
            'completed' => [
                'ADMIN' => ['closed'],
                'ENGINEERING' => ['closed'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ]
        ];

        return $transitions[$currentStatus][$userRole] ?? [];
    }

    /**
     * Validate if status transition is allowed
     */
    public function canTransitionComplaintStatus(Complaint $complaint, string $newStatus, string $userRole): bool
    {
        $allowedTransitions = $this->getAllowedComplaintTransitions($complaint->status, $userRole);
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Update complaint status with validation
     */
    public function updateComplaintStatus(Complaint $complaint, string $newStatus, ?string $reason = null): bool
    {
        $user = Auth::user();
        
        if (!$this->canTransitionComplaintStatus($complaint, $newStatus, $user->role)) {
            throw new InvalidArgumentException('Status transition not allowed for current user role');
        }

        $complaint->update([
            'status' => $newStatus,
            'status_updated_at' => now(),
            'status_updated_by' => $user->id
        ]);

        // Log status change
        $this->logStatusChange($complaint, $complaint->status, $newStatus, $reason);

        return true;
    }

    /**
     * Get allowed work order transitions
     */
    public function getAllowedWorkOrderTransitions(string $currentStatus, string $userRole): array
    {
        $transitions = [
            'created' => [
                'ADMIN' => ['assigned'],
                'ENGINEERING' => ['assigned'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ],
            'assigned' => [
                'ADMIN' => [],
                'ENGINEERING' => [],
                'MAINTENANCE' => ['in_progress'],
                'CONSUMER' => []
            ],
            'in_progress' => [
                'ADMIN' => [],
                'ENGINEERING' => [],
                'MAINTENANCE' => ['completed'],
                'CONSUMER' => []
            ],
            'completed' => [
                'ADMIN' => ['verified'],
                'ENGINEERING' => ['verified'],
                'MAINTENANCE' => [],
                'CONSUMER' => []
            ]
        ];

        return $transitions[$currentStatus][$userRole] ?? [];
    }

    /**
     * Update work order status
     */
    public function updateWorkOrderStatus(WorkOrder $workOrder, string $newStatus, ?string $reason = null): bool
    {
        $user = Auth::user();
        
        if (!$this->canTransitionWorkOrderStatus($workOrder, $newStatus, $user->role)) {
            throw new InvalidArgumentException('Status transition not allowed for current user role');
        }

        $workOrder->update([
            'status' => $newStatus,
            'status_updated_at' => now(),
            'status_updated_by' => $user->id
        ]);

        return true;
    }

    /**
     * Validate work order status transition
     */
    public function canTransitionWorkOrderStatus(WorkOrder $workOrder, string $newStatus, string $userRole): bool
    {
        $allowedTransitions = $this->getAllowedWorkOrderTransitions($workOrder->status, $userRole);
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Get status badge class for UI
     */
    public function getStatusBadgeClass(string $status, string $type = 'complaint'): string
    {
        $badges = [
            'complaint' => [
                'pending' => 'bg-yellow-100 text-yellow-800',
                'reviewed' => 'bg-blue-100 text-blue-800',
                'submitted_to_engineering' => 'bg-purple-100 text-purple-800',
                'approved' => 'bg-green-100 text-green-800',
                'declined' => 'bg-red-100 text-red-800',
                'work_assigned' => 'bg-indigo-100 text-indigo-800',
                'in_progress' => 'bg-orange-100 text-orange-800',
                'completed' => 'bg-emerald-100 text-emerald-800',
                'closed' => 'bg-gray-100 text-gray-800'
            ],
            'work_order' => [
                'created' => 'bg-blue-100 text-blue-800',
                'assigned' => 'bg-indigo-100 text-indigo-800',
                'in_progress' => 'bg-orange-100 text-orange-800',
                'completed' => 'bg-green-100 text-green-800',
                'verified' => 'bg-emerald-100 text-emerald-800'
            ],
            'priority' => [
                'low' => 'bg-gray-100 text-gray-800',
                'normal' => 'bg-blue-100 text-blue-800',
                'high' => 'bg-orange-100 text-orange-800',
                'urgent' => 'bg-red-100 text-red-800'
            ]
        ];

        return $badges[$type][$status] ?? 'bg-gray-100 text-gray-800';
    }

    /**
     * Get human-readable status text
     */
    public function getStatusText(string $status, string $type = 'complaint'): string
    {
        $texts = [
            'complaint' => self::COMPLAINT_STATUSES,
            'work_order' => self::WORK_ORDER_STATUSES,
            'priority' => self::PRIORITY_LEVELS
        ];

        return $texts[$type][$status] ?? ucfirst(str_replace('_', ' ', $status));
    }

    /**
     * Log status changes for audit trail
     */
    private function logStatusChange($model, string $oldStatus, string $newStatus, ?string $reason = null): void
    {
        // You could implement a status_changes table for audit logging
        \Log::info('Status Change', [
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'reason' => $reason,
            'user_id' => Auth::id(),
            'timestamp' => now()
        ]);
    }

    /**
     * Get status statistics for dashboard
     */
    public function getStatusStatistics(string $userRole): array
    {
        $stats = [];

        switch ($userRole) {
            case 'ADMIN':
                $stats = [
                    'total_complaints' => Complaint::count(),
                    'pending_review' => Complaint::where('status', 'pending')->count(),
                    'engineering_review' => Complaint::where('status', 'submitted_to_engineering')->count(),
                    'completed_today' => Complaint::where('status', 'completed')->whereDate('updated_at', today())->count()
                ];
                break;

            case 'ENGINEERING':
                $stats = [
                    'pending_approvals' => Complaint::where('status', 'submitted_to_engineering')->count(),
                    'approved_this_month' => ComplaintApproval::where('action', 'approved')->whereMonth('created_at', now()->month)->count(),
                    'declined_this_month' => ComplaintApproval::where('action', 'declined')->whereMonth('created_at', now()->month)->count(),
                    'active_work_orders' => WorkOrder::whereIn('status', ['assigned', 'in_progress'])->count()
                ];
                break;

            case 'MAINTENANCE':
                $stats = [
                    'assigned_tasks' => WorkOrder::where('assigned_to', Auth::id())->where('status', 'assigned')->count(),
                    'in_progress_tasks' => WorkOrder::where('assigned_to', Auth::id())->where('status', 'in_progress')->count(),
                    'completed_this_month' => WorkOrder::where('assigned_to', Auth::id())->where('status', 'completed')->whereMonth('updated_at', now()->month)->count(),
                    'total_hours_this_month' => MaintenanceReport::whereHas('workOrder', function($q) {
                        $q->where('assigned_to', Auth::id());
                    })->whereMonth('created_at', now()->month)->sum('hours_worked')
                ];
                break;

            case 'CONSUMER':
                $stats = [
                    'total_complaints' => Complaint::where('user_id', Auth::id())->count(),
                    'pending' => Complaint::where('user_id', Auth::id())->where('status', 'pending')->count(),
                    'in_progress' => Complaint::where('user_id', Auth::id())->whereIn('status', ['in_progress', 'work_assigned'])->count(),
                    'completed' => Complaint::where('user_id', Auth::id())->where('status', 'completed')->count()
                ];
                break;
        }

        return $stats;
    }
}