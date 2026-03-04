<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StatusManagementService;
use App\Models\Complaint;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StatusController extends Controller
{
    protected $statusService;
    
    public function __construct(StatusManagementService $statusService)
    {
        $this->statusService = $statusService;
    }
    
    /**
     * Get status information
     */
    public function getStatusInfo(Request $request)
    {
        return response()->json([
            'complaint_statuses' => $this->statusService::COMPLAINT_STATUSES,
            'work_order_statuses' => $this->statusService::WORK_ORDER_STATUSES,
            'priority_levels' => $this->statusService::PRIORITY_LEVELS
        ]);
    }
    
    /**
     * Update complaint status
     */
    public function updateComplaintStatus(Request $request, Complaint $complaint)
    {
        $request->validate([
            'status' => 'required|string',
            'reason' => 'nullable|string'
        ]);
        
        try {
            $this->statusService->updateComplaintStatus(
                $complaint, 
                $request->status, 
                $request->reason
            );
            
            return response()->json([
                'message' => 'Status updated successfully',
                'complaint' => $complaint->fresh()
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 403);
        }
    }
    
    /**
     * Update work order status
     */
    public function updateWorkOrderStatus(Request $request, WorkOrder $workOrder)
    {
        $request->validate([
            'status' => 'required|string',
            'reason' => 'nullable|string'
        ]);
        
        try {
            $this->statusService->updateWorkOrderStatus(
                $workOrder, 
                $request->status, 
                $request->reason
            );
            
            return response()->json([
                'message' => 'Status updated successfully',
                'work_order' => $workOrder->fresh()
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 403);
        }
    }
    
    /**
     * Get allowed status transitions
     */
    public function getAllowedTransitions(Request $request)
    {
        $user = Auth::user();
        $type = $request->get('type', 'complaint'); // complaint or work_order
        $currentStatus = $request->get('current_status');
        
        if ($type === 'complaint') {
            $transitions = $this->statusService->getAllowedComplaintTransitions($currentStatus, $user->role);
        } else {
            $transitions = $this->statusService->getAllowedWorkOrderTransitions($currentStatus, $user->role);
        }
        
        return response()->json([
            'allowed_transitions' => $transitions,
            'current_status' => $currentStatus,
            'user_role' => $user->role
        ]);
    }
}