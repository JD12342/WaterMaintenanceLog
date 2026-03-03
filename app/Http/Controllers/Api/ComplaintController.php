<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ComplaintController extends Controller
{
    /**
     * Display a listing of complaints based on user role
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $query = Complaint::with(['user', 'workOrder.assignedToUser']);

        // Filter based on user role
        switch ($user->role->value) {
            case 'CONSUMER':
                $query->where('user_id', $user->id);
                break;
            case 'ADMIN':
                // Admin can see all complaints
                break;
            case 'ENGINEERING':
                // Engineering sees complaints submitted for review
                $query->whereIn('status', ['submitted_to_engineering', 'approved', 'declined']);
                break;
            case 'MAINTENANCE':
                // Maintenance sees complaints with approved work orders assigned to them
                $query->whereHas('workOrder', function ($q) use ($user) {
                    $q->where('assigned_to', $user->id);
                });
                break;
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        $complaints = $query->orderBy('submitted_at', 'desc')
                          ->paginate($request->input('per_page', 15));

        return response()->json($complaints);
    }

    /**
     * Store a newly created complaint (End users submit complaints)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'priority' => 'sometimes|in:low,normal,high,urgent'
        ]);

        $complaint = Complaint::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'priority' => $request->priority ?? 'normal',
            'status' => 'pending',
            'submitted_at' => now()
        ]);

        $complaint->load(['user']);

        return response()->json([
            'message' => 'Complaint submitted successfully',
            'complaint' => $complaint
        ], 201);
    }

    /**
     * Display the specified complaint
     */
    public function show(string $id): JsonResponse
    {
        $complaint = Complaint::with([
            'user', 
            'workOrder.assignedByUser', 
            'workOrder.assignedToUser',
            'workOrder.engineeringApprovedByUser',
            'workOrder.maintenanceReport.reportedByUser'
        ])->findOrFail($id);

        // Check authorization
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->isConsumer() && $complaint->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($complaint);
    }

    /**
     * Update complaint status and notes (Admin/Engineering)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $complaint = Complaint::findOrFail($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'status' => 'sometimes|in:pending,reviewed,submitted_to_engineering,approved,declined,assigned,in_progress,completed,closed',
            'admin_notes' => 'nullable|string',
            'damage_assessment' => 'nullable|string'
        ]);

        // Authorization checks based on role and action
        if ($user->isConsumer()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update fields based on role
        if ($user->isAdmin()) {
            $complaint->fill($request->only(['status', 'admin_notes']));
            
            if ($request->status === 'reviewed') {
                $complaint->status = 'reviewed';
            }
        }

        if ($user->isEngineering()) {
            $complaint->fill($request->only(['status', 'damage_assessment']));
            
            if (in_array($request->status, ['approved', 'declined'])) {
                $complaint->status = $request->status;
            }
        }

        $complaint->save();

        return response()->json([
            'message' => 'Complaint updated successfully',
            'complaint' => $complaint->load(['user', 'workOrder'])
        ]);
    }

    /**
     * Admin submits complaint to engineering for review
     */
    public function submitToEngineering(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Only admins can submit to engineering'], 403);
        }

        $complaint = Complaint::findOrFail($id);

        if ($complaint->status !== 'reviewed') {
            return response()->json(['message' => 'Complaint must be reviewed first'], 400);
        }

        $complaint->update([
            'status' => 'submitted_to_engineering',
            'admin_notes' => $request->input('admin_notes', $complaint->admin_notes)
        ]);

        return response()->json([
            'message' => 'Complaint submitted to engineering for review',
            'complaint' => $complaint
        ]);
    }

    /**
     * Engineering approves complaint
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isEngineering()) {
            return response()->json(['message' => 'Only engineering can approve complaints'], 403);
        }

        $request->validate([
            'damage_assessment' => 'required|string'
        ]);

        $complaint = Complaint::findOrFail($id);

        if ($complaint->status !== 'submitted_to_engineering') {
            return response()->json(['message' => 'Complaint is not pending engineering review'], 400);
        }

        $complaint->update([
            'status' => 'approved',
            'damage_assessment' => $request->damage_assessment
        ]);

        return response()->json([
            'message' => 'Complaint approved by engineering',
            'complaint' => $complaint
        ]);
    }

    /**
     * Engineering declines complaint
     */
    public function decline(Request $request, string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isEngineering()) {
            return response()->json(['message' => 'Only engineering can decline complaints'], 403);
        }

        $request->validate([
            'damage_assessment' => 'required|string'
        ]);

        $complaint = Complaint::findOrFail($id);

        if ($complaint->status !== 'submitted_to_engineering') {
            return response()->json(['message' => 'Complaint is not pending engineering review'], 400);
        }

        $complaint->update([
            'status' => 'declined',
            'damage_assessment' => $request->damage_assessment
        ]);

        return response()->json([
            'message' => 'Complaint declined by engineering',
            'complaint' => $complaint
        ]);
    }

    /**
     * Remove the specified complaint (Admin only)
     */
    public function destroy(string $id): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'Only admins can delete complaints'], 403);
        }

        $complaint = Complaint::findOrFail($id);
        
        // Check if complaint has associated work orders
        if ($complaint->workOrder) {
            return response()->json(['message' => 'Cannot delete complaint with associated work order'], 400);
        }

        $complaint->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }
}
