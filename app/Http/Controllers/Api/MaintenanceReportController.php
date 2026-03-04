<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceReport;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class MaintenanceReportController extends Controller
{
    /**
     * Display a listing of maintenance reports based on user role
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = MaintenanceReport::with([
            'workOrder.complaint.user',
            'workOrder.assignedToUser',
            'reportedByUser'
        ]);

        // Filter based on user role
        switch ($user->role->value) {
            case 'ADMIN':
                // Admin sees all reports
                break;
            case 'ENGINEERING':
                // Engineering sees all reports for oversight
                break;
            case 'MAINTENANCE':
                // Maintenance sees only their own reports
                $query->where('reported_by', $user->id);
                break;
            case 'CONSUMER':
                // Consumers see reports related to their complaints
                $query->whereHas('workOrder.complaint', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
                break;
        }

        // Apply filters
        if ($request->has('work_quality')) {
            $query->where('work_quality', $request->work_quality);
        }

        if ($request->has('requires_followup')) {
            $query->where('requires_followup', $request->boolean('requires_followup'));
        }

        $reports = $query->orderBy('reported_at', 'desc')
                        ->paginate($request->input('per_page', 15));

        return response()->json($reports);
    }

    /**
     * Store a newly created maintenance report
     */
    public function store(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isMaintenance()) {
            return response()->json(['message' => 'Only maintenance staff can submit reports'], 403);
        }

        $request->validate([
            'work_order_id'   => 'required|exists:work_orders,id',
            'work_description'=> 'required|string',
            'materials_used'  => 'nullable',          // string or array both accepted
            'hours_worked'    => 'required|numeric|min:0.1|max:99.99',
            'completion_notes'=> 'nullable|string',
            'work_quality'    => 'required|in:excellent,good,satisfactory,fair,needs_followup',
            'requires_followup' => 'boolean',
            'followup_notes'  => 'required_if:requires_followup,true|nullable|string',
            'work_started_at' => 'nullable|date',
            'work_completed_at'=> 'nullable|date',
            'photos'          => 'sometimes|array|max:5',
            'photos.*'        => 'image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $workOrder = WorkOrder::findOrFail($request->work_order_id);

        // Check authorization
        if ($workOrder->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'You are not assigned to this work order'], 403);
        }

        // Check if work order is completed
        if ($workOrder->status !== 'completed') {
            return response()->json(['message' => 'Work order must be completed before submitting report'], 400);
        }

        // Check if report already exists
        if ($workOrder->maintenanceReport) {
            return response()->json(['message' => 'Maintenance report already exists for this work order'], 400);
        }

        // Normalise materials_used — accept plain string or array
        $materialsRaw = $request->materials_used;
        if (is_string($materialsRaw)) {
            $materials = collect(preg_split('/\r?\n/', $materialsRaw))
                ->filter()
                ->values()
                ->map(fn($line) => ['name' => trim($line), 'quantity' => 1, 'unit' => 'unit'])
                ->toArray();
        } else {
            $materials = $materialsRaw ?? [];
        }

        // Default timestamps if not provided
        $startedAt   = $request->work_started_at   ?? now()->subHours((float) $request->hours_worked);
        $completedAt = $request->work_completed_at ?? now();

        DB::beginTransaction();
        try {
            // Handle photo uploads
            $photosPaths = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('maintenance-reports', 'public');
                    $photosPaths[] = $path;
                }
            }

            // Create maintenance report
            $report = MaintenanceReport::create([
                'work_order_id'    => $workOrder->id,
                'reported_by'      => Auth::id(),
                'work_description' => $request->work_description,
                'materials_used'   => $materials,
                'hours_worked'     => $request->hours_worked,
                'completion_notes' => $request->completion_notes,
                'photos'           => $photosPaths,
                'work_quality'     => $request->work_quality,
                'requires_followup'=> $request->boolean('requires_followup'),
                'followup_notes'   => $request->followup_notes,
                'work_started_at'  => $startedAt,
                'work_completed_at'=> $completedAt,
                'reported_at'      => now()
            ]);

            // Update work order status
            $workOrder->update(['status' => 'verified']);

            // Update complaint status to completed
            $workOrder->complaint->update(['status' => 'completed']);

            DB::commit();

            $report->load([
                'workOrder.complaint.user',
                'workOrder.assignedToUser',
                'reportedByUser'
            ]);

            return response()->json([
                'message' => 'Maintenance report submitted successfully',
                'report' => $report
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            // Clean up uploaded photos if transaction fails
            if (!empty($photosPaths)) {
                foreach ($photosPaths as $path) {
                    Storage::disk('public')->delete($path);
                }
            }

            return response()->json(['message' => 'Failed to submit maintenance report'], 500);
        }
    }

    /**
     * Display the specified maintenance report
     */
    public function show(string $id): JsonResponse
    {
        $report = MaintenanceReport::with([
            'workOrder.complaint.user',
            'workOrder.assignedByUser',
            'workOrder.assignedToUser',
            'workOrder.engineeringApprovedByUser',
            'reportedByUser'
        ])->findOrFail($id);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check authorization
        if ($user->isConsumer() && $report->workOrder->complaint->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->isMaintenance() && $report->reported_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($report);
    }

    /**
     * Update the specified maintenance report
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $report = MaintenanceReport::findOrFail($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Check authorization - only reporter or admin can update
        if (!$user->isAdmin() && $report->reported_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'completion_notes' => 'sometimes|nullable|string',
            'work_quality' => 'sometimes|in:excellent,good,satisfactory,needs_followup',
            'requires_followup' => 'sometimes|boolean',
            'followup_notes' => 'sometimes|nullable|string',
        ]);

        $report->update($request->only([
            'completion_notes',
            'work_quality', 
            'requires_followup',
            'followup_notes'
        ]));

        return response()->json([
            'message' => 'Maintenance report updated successfully',
            'report' => $report
        ]);
    }

    /**
     * Get reports statistics for dashboard
     */
    public function getStats(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->isConsumer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $baseQuery = MaintenanceReport::query();

        // Filter by role
        if ($user->isMaintenance()) {
            $baseQuery->where('reported_by', $user->id);
        }

        $stats = [
            'total_reports' => (clone $baseQuery)->count(),
            'this_month' => (clone $baseQuery)->whereMonth('reported_at', now()->month)->count(),
            'quality_breakdown' => [
                'excellent' => (clone $baseQuery)->where('work_quality', 'excellent')->count(),
                'good' => (clone $baseQuery)->where('work_quality', 'good')->count(),
                'satisfactory' => (clone $baseQuery)->where('work_quality', 'satisfactory')->count(),
                'needs_followup' => (clone $baseQuery)->where('work_quality', 'needs_followup')->count(),
            ],
            'requires_followup' => (clone $baseQuery)->where('requires_followup', true)->count(),
            'average_hours' => (clone $baseQuery)->avg('hours_worked'),
        ];

        return response()->json($stats);
    }

    /**
     * Get completed work orders ready for reporting (Maintenance staff only)
     */
    public function getCompletedWorkOrders(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isMaintenance()) {
            return response()->json(['message' => 'Only maintenance staff can access this'], 403);
        }

        // Get completed work orders assigned to current user that don't have reports yet
        $workOrders = WorkOrder::with(['complaint.user'])
            ->where('assigned_to', Auth::id())
            ->where('status', 'completed')
            ->whereDoesntHave('maintenanceReport')
            ->orderBy('actual_completion_date', 'desc')
            ->get();

        return response()->json($workOrders);
    }

    /**
     * Remove the specified maintenance report (Admin only)
     */
    public function destroy(string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Only admins can delete maintenance reports'], 403);
        }

        $report = MaintenanceReport::findOrFail($id);

        // Delete associated photos
        if ($report->photos) {
            foreach ($report->photos as $photoPath) {
                Storage::disk('public')->delete($photoPath);
            }
        }

        // Reset work order status
        $report->workOrder->update(['status' => 'completed']);

        $report->delete();

        return response()->json(['message' => 'Maintenance report deleted successfully']);
    }
}
