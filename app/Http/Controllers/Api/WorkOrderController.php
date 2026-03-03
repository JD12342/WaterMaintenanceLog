<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkOrderController extends Controller
{
    /**
     * Display a listing of work orders based on user role
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = WorkOrder::with([
            'complaint.user',
            'assignedByUser',
            'assignedToUser',
            'engineeringApprovedByUser',
            'maintenanceReport'
        ]);

        // Filter based on user role
        switch ($user->role->value) {
            case 'ADMIN':
                // Admin sees all work orders
                break;
            case 'ENGINEERING':
                // Engineering sees work orders they've approved
                $query->where('engineering_approved_by', $user->id);
                break;
            case 'MAINTENANCE':
                // Maintenance sees work orders assigned to them
                $query->where('assigned_to', $user->id);
                break;
            case 'CONSUMER':
                // Consumers see work orders related to their complaints
                $query->whereHas('complaint', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                break;
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $workOrders = $query->orderBy('created_at', 'desc')
                          ->paginate($request->input('per_page', 15));

        return response()->json($workOrders);
    }

    /**
     * Create work order from approved complaint (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can create work orders'], 403);
        }

        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'assigned_to' => 'sometimes|exists:users,id',
            'estimated_completion_date' => 'nullable|date|after:today',
            'assignment_notes' => 'nullable|string'
        ]);

        $complaint = Complaint::findOrFail($request->complaint_id);

        // Check if complaint is approved by engineering
        if ($complaint->status !== 'approved') {
            return response()->json(['message' => 'Can only create work order for approved complaints'], 400);
        }

        // Check if work order already exists
        if ($complaint->workOrder) {
            return response()->json(['message' => 'Work order already exists for this complaint'], 400);
        }

        // If assigned_to is provided, validate they are maintenance staff
        if ($request->assigned_to) {
            $maintenanceUser = User::find($request->assigned_to);
            if (!$maintenanceUser->isMaintenance()) {
                return response()->json(['message' => 'Can only assign to maintenance staff'], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Create work order
            $workOrder = WorkOrder::create([
                'complaint_id' => $complaint->id,
                'assigned_by' => Auth::id(),
                'assigned_to' => $request->assigned_to,
                'status' => $request->assigned_to ? 'assigned' : 'pending_assignment',
                'estimated_completion_date' => $request->estimated_completion_date,
                'assignment_notes' => $request->assignment_notes
            ]);

            // Update complaint status
            $complaint->update(['status' => 'assigned']);

            DB::commit();

            $workOrder->load([
                'complaint.user',
                'assignedByUser',
                'assignedToUser'
            ]);

            return response()->json([
                'message' => 'Work order created successfully',
                'work_order' => $workOrder
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create work order'], 500);
        }
    }

    /**
     * Display the specified work order
     */
    public function show(string $id): JsonResponse
    {
        $workOrder = WorkOrder::with([
            'complaint.user',
            'assignedByUser',
            'assignedToUser',
            'engineeringApprovedByUser',
            'maintenanceReport.reportedByUser'
        ])->findOrFail($id);

        // Check authorization
        $user = Auth::user();
        if ($user->isConsumer() && $workOrder->complaint->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->isMaintenance() && $workOrder->assigned_to !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($workOrder);
    }

    /**
     * Assign work order to maintenance staff (Admin only)
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can assign work orders'], 403);
        }

        $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'estimated_completion_date' => 'nullable|date|after:today',
            'assignment_notes' => 'nullable|string'
        ]);

        $workOrder = WorkOrder::findOrFail($id);
        $maintenanceUser = User::find($request->assigned_to);

        if (!$maintenanceUser->isMaintenance()) {
            return response()->json(['message' => 'Can only assign to maintenance staff'], 400);
        }

        $workOrder->update([
            'assigned_to' => $request->assigned_to,
            'status' => 'assigned',
            'estimated_completion_date' => $request->estimated_completion_date,
            'assignment_notes' => $request->assignment_notes
        ]);

        return response()->json([
            'message' => 'Work order assigned successfully',
            'work_order' => $workOrder->load(['assignedToUser', 'complaint'])
        ]);
    }

    /**
     * Start work on the order (Maintenance staff only)
     */
    public function startWork(string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isMaintenance()) {
            return response()->json(['message' => 'Only maintenance staff can start work'], 403);
        }

        $workOrder = WorkOrder::findOrFail($id);

        if ($workOrder->assigned_to !== $user->id) {
            return response()->json(['message' => 'You are not assigned to this work order'], 403);
        }

        if ($workOrder->status !== 'assigned') {
            return response()->json(['message' => 'Work order is not ready to start'], 400);
        }

        $workOrder->update(['status' => 'in_progress']);

        // Update complaint status too
        $workOrder->complaint->update(['status' => 'in_progress']);

        return response()->json([
            'message' => 'Work started successfully',
            'work_order' => $workOrder
        ]);
    }

    /**
     * Complete work order (triggers maintenance report creation)
     */
    public function completeWork(string $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user->isMaintenance()) {
            return response()->json(['message' => 'Only maintenance staff can complete work'], 403);
        }

        $workOrder = WorkOrder::findOrFail($id);

        if ($workOrder->assigned_to !== $user->id) {
            return response()->json(['message' => 'You are not assigned to this work order'], 403);
        }

        if ($workOrder->status !== 'in_progress') {
            return response()->json(['message' => 'Work order is not in progress'], 400);
        }

        $workOrder->update([
            'status' => 'completed',
            'actual_completion_date' => now()->toDateString()
        ]);

        return response()->json([
            'message' => 'Work completed successfully. Please submit a maintenance report.',
            'work_order' => $workOrder,
            'next_step' => 'Create maintenance report at /api/maintenance-reports'
        ]);
    }

    /**
     * Get available maintenance staff for assignment
     */
    public function getMaintenanceStaff(): JsonResponse
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can view maintenance staff'], 403);
        }

        $maintenanceStaff = User::where('role', 'MAINTENANCE')
                              ->select('id', 'name', 'email')
                              ->get();

        return response()->json($maintenanceStaff);
    }

    /**
     * Update work order details (Admin only)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can update work orders'], 403);
        }

        $request->validate([
            'estimated_completion_date' => 'nullable|date',
            'assignment_notes' => 'nullable|string'
        ]);

        $workOrder = WorkOrder::findOrFail($id);
        $workOrder->update($request->only(['estimated_completion_date', 'assignment_notes']));

        return response()->json([
            'message' => 'Work order updated successfully',
            'work_order' => $workOrder
        ]);
    }

    /**
     * Delete work order (Admin only)
     */
    public function destroy(string $id): JsonResponse
    {
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can delete work orders'], 403);
        }

        $workOrder = WorkOrder::findOrFail($id);

        // Check if maintenance report exists
        if ($workOrder->maintenanceReport) {
            return response()->json(['message' => 'Cannot delete work order with maintenance report'], 400);
        }

        $workOrder->delete();

        return response()->json(['message' => 'Work order deleted successfully']);
    }
}
