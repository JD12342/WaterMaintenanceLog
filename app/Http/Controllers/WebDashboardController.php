<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use App\Models\ComplaintApproval;
use App\Models\MaintenanceReport;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WebDashboardController extends Controller
{
    // ─── PAGE RENDERING ──────────────────────────────────────────

    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $view = $request->query('view', 'dashboard');
        $role = $user->role->value;

        $dashboardData = $view === 'dashboard' ? $this->getDashboardStats($user) : null;
        $viewData = $view !== 'dashboard' ? $this->getViewData($role, $view, $user) : [];

        $page = match ($role) {
            'ADMIN'       => 'Admin/Dashboard',
            'ENGINEERING' => 'Engineering/Dashboard',
            'MAINTENANCE' => 'Maintenance/Dashboard',
            default       => 'Consumer/Dashboard',
        };

        return Inertia::render($page, [
            'auth'          => ['user' => $user],
            'dashboardData' => $dashboardData,
            'viewData'      => $viewData,
            'currentView'   => $view,
        ]);
    }

    // ─── DASHBOARD STATS (one raw SQL per role) ──────────────────

    private function getDashboardStats($user): array
    {
        $role = $user->role->value;

        $data = [];

        switch ($role) {
            case 'CONSUMER':
                $stats = DB::selectOne("
                    SELECT
                        COUNT(*)                                                    AS total_complaints,
                        COUNT(*) FILTER (WHERE status = 'pending')                  AS pending,
                        COUNT(*) FILTER (WHERE status = 'approved')                 AS approved,
                        COUNT(*) FILTER (WHERE status = 'submitted_to_engineering') AS under_review,
                        COUNT(*) FILTER (WHERE status IN ('assigned','in_progress')) AS in_progress,
                        COUNT(*) FILTER (WHERE id IN (
                            SELECT complaint_id FROM work_orders WHERE status = 'completed'
                        ))                                                          AS completed
                    FROM complaints
                    WHERE user_id = ?
                ", [$user->id]);

                $data['stats'] = [
                    'total_complaints' => (int) $stats->total_complaints,
                    'pending'          => (int) $stats->pending,
                    'approved'         => (int) $stats->approved,
                    'under_review'     => (int) $stats->under_review,
                    'in_progress'      => (int) $stats->in_progress,
                    'completed'        => (int) $stats->completed,
                ];
                $data['my_complaints'] = Complaint::with(['workOrder'])
                    ->where('user_id', $user->id)
                    ->orderBy('submitted_at', 'desc')
                    ->limit(5)
                    ->get();
                break;

            case 'ADMIN':
                $month = now()->month;
                $year  = now()->year;

                $stats = DB::selectOne("
                    SELECT
                        (SELECT COUNT(*) FROM complaints  WHERE status = 'pending')                                               AS pending_complaints,
                        (SELECT COUNT(*) FROM work_orders WHERE status = 'pending_assignment')                                    AS pending_assignments,
                        (SELECT COUNT(*) FROM work_orders WHERE status IN ('assigned','in_progress'))                             AS active_work_orders,
                        (SELECT COUNT(*) FROM work_orders WHERE status = 'completed'
                            AND EXTRACT(MONTH FROM actual_completion_date) = ? AND EXTRACT(YEAR FROM actual_completion_date) = ?) AS completed_this_month,
                        (SELECT COUNT(*) FROM users)                                                                              AS total_users
                ", [$month, $year]);

                $data['stats'] = [
                    'pending_complaints'   => (int) $stats->pending_complaints,
                    'pending_assignments'  => (int) $stats->pending_assignments,
                    'active_work_orders'   => (int) $stats->active_work_orders,
                    'completed_this_month' => (int) $stats->completed_this_month,
                    'total_users'          => (int) $stats->total_users,
                ];
                $data['recent_complaints'] = Complaint::with(['user'])
                    ->orderBy('submitted_at', 'desc')
                    ->limit(5)
                    ->get();
                $data['recent_work_orders'] = WorkOrder::with(['complaint.user', 'assignedToUser'])
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get();
                break;

            case 'ENGINEERING':
                $weekStart = now()->startOfWeek()->toDateTimeString();
                $weekEnd   = now()->endOfWeek()->toDateTimeString();

                $stats = DB::selectOne("
                    SELECT
                        (SELECT COUNT(*) FROM complaints WHERE status = 'submitted_to_engineering')              AS pending_reviews,
                        (SELECT COUNT(*) FROM complaints WHERE status = 'approved'
                            AND updated_at BETWEEN ? AND ?)                                                      AS approved_this_week,
                        (SELECT COUNT(*) FROM complaints WHERE status = 'declined'
                            AND updated_at BETWEEN ? AND ?)                                                      AS declined_this_week,
                        (SELECT COUNT(*) FROM complaint_approvals)                                               AS total_reviews
                ", [$weekStart, $weekEnd, $weekStart, $weekEnd]);

                $data['engineering_stats'] = [
                    'pending_reviews'    => (int) $stats->pending_reviews,
                    'approved_this_week' => (int) $stats->approved_this_week,
                    'declined_this_week' => (int) $stats->declined_this_week,
                    'total_reviews'      => (int) $stats->total_reviews,
                ];
                $data['pending_complaints'] = Complaint::where('status', 'submitted_to_engineering')
                    ->with(['user'])
                    ->orderBy('updated_at', 'asc')
                    ->limit(10)
                    ->get();
                $data['engineering_recent_decisions'] = ComplaintApproval::with(['complaint'])
                    ->orderBy('reviewed_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(fn ($a) => [
                        'id'          => $a->id,
                        'action'      => $a->action,
                        'reviewed_at' => $a->reviewed_at,
                        'complaint'   => $a->complaint ? ['title' => $a->complaint->title] : null,
                    ]);
                break;

            case 'MAINTENANCE':
                $month = now()->month;
                $year  = now()->year;

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

                $data['maintenance_stats'] = [
                    'assigned_tasks'         => (int) $stats->assigned_tasks,
                    'in_progress_tasks'      => (int) $stats->in_progress_tasks,
                    'completed_this_month'   => (int) $stats->completed_this_month,
                    'total_hours_this_month' => (float) $stats->total_hours_this_month,
                ];
                $data['my_work_orders'] = WorkOrder::with(['complaint.user'])
                    ->where('assigned_to', $user->id)
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->orderBy('estimated_completion_date', 'asc')
                    ->limit(10)
                    ->get();
                $data['completed_work_orders'] = WorkOrder::with(['complaint', 'maintenanceReport'])
                    ->where('assigned_to', $user->id)
                    ->where('status', 'completed')
                    ->orderBy('actual_completion_date', 'desc')
                    ->limit(5)
                    ->get();
                break;
        }

        return $data;
    }

    // ─── VIEW DATA LOADING ───────────────────────────────────────

    private function getViewData(string $role, string $view, $user): array
    {
        return match ($role) {
            'ADMIN'       => $this->adminViewData($view),
            'ENGINEERING' => $this->engineeringViewData($view),
            'MAINTENANCE' => $this->maintenanceViewData($view, $user),
            default       => $this->consumerViewData($view, $user),
        };
    }

    private function adminViewData(string $view): array
    {
        return match ($view) {
            'complaints' => [
                'complaints' => Complaint::with(['user', 'workOrder.assignedToUser'])
                    ->orderBy('submitted_at', 'desc')->get(),
                'maintenanceStaff' => User::where('role', 'MAINTENANCE')
                    ->select('id', 'name', 'email')->get(),
            ],
            'work-orders' => [
                'workOrders' => WorkOrder::with([
                    'complaint.user', 'assignedByUser', 'assignedToUser', 'maintenanceReport',
                ])->orderBy('created_at', 'desc')->get(),
            ],
            'users' => [
                'users' => User::select('id', 'name', 'email', 'role', 'created_at')
                    ->orderBy('created_at', 'desc')->get(),
            ],
            'reports' => [
                'reports' => MaintenanceReport::with([
                    'workOrder.complaint.user', 'workOrder.assignedToUser', 'reportedByUser',
                ])->orderBy('reported_at', 'desc')->get(),
            ],
            default => [],
        };
    }

    private function engineeringViewData(string $view): array
    {
        return match ($view) {
            'pending-approvals' => [
                'complaints' => Complaint::with(['user'])
                    ->where('status', 'submitted_to_engineering')
                    ->orderBy('updated_at', 'asc')->get(),
            ],
            'approved' => [
                'complaints' => Complaint::with(['user'])
                    ->where('status', 'approved')
                    ->orderBy('updated_at', 'desc')->get(),
            ],
            'declined' => [
                'complaints' => Complaint::with(['user'])
                    ->where('status', 'declined')
                    ->orderBy('updated_at', 'desc')->get(),
            ],
            'reports' => [
                'reports' => MaintenanceReport::with([
                    'workOrder.complaint.user', 'workOrder.assignedToUser', 'reportedByUser',
                ])->orderBy('reported_at', 'desc')->get(),
            ],
            default => [],
        };
    }

    private function maintenanceViewData(string $view, $user): array
    {
        return match ($view) {
            'assigned-tasks' => [
                'tasks' => WorkOrder::with(['complaint.user'])
                    ->where('assigned_to', $user->id)
                    ->whereIn('status', ['assigned', 'in_progress'])
                    ->orderBy('created_at', 'desc')->get(),
            ],
            'task-history' => [
                'reports' => MaintenanceReport::with([
                    'workOrder.complaint.user', 'workOrder.assignedToUser', 'reportedByUser',
                ])->where('reported_by', $user->id)
                    ->orderBy('reported_at', 'desc')->get(),
            ],
            default => [],
        };
    }

    private function consumerViewData(string $view, $user): array
    {
        return match ($view) {
            'complaints' => [
                'complaints' => Complaint::with(['workOrder'])
                    ->where('user_id', $user->id)
                    ->orderBy('submitted_at', 'desc')->get(),
            ],
            default => [],
        };
    }

    // ─── ACTIONS ─────────────────────────────────────────────────

    /** Admin: forward complaint to engineering */
    public function forwardToEngineering(Request $request, Complaint $complaint)
    {
        if (!in_array($complaint->status, ['pending', 'reviewed'])) {
            throw ValidationException::withMessages(['message' => 'Complaint must be pending or reviewed.']);
        }

        $complaint->update([
            'status'      => 'submitted_to_engineering',
            'admin_notes' => $request->input('admin_notes', $complaint->admin_notes),
        ]);

        return redirect('/dashboard?view=complaints');
    }

    /** Admin: create work order & assign to maintenance */
    public function createWorkOrder(Request $request)
    {
        $request->validate([
            'complaint_id' => 'required|exists:complaints,id',
            'assigned_to'  => 'required|exists:users,id',
        ]);

        $complaint = Complaint::findOrFail($request->complaint_id);

        if ($complaint->status !== 'approved') {
            throw ValidationException::withMessages(['message' => 'Only approved complaints can have work orders.']);
        }

        if ($complaint->workOrder) {
            throw ValidationException::withMessages(['message' => 'Work order already exists for this complaint.']);
        }

        $staff = User::findOrFail($request->assigned_to);
        if (!$staff->isMaintenance()) {
            throw ValidationException::withMessages(['message' => 'Can only assign to maintenance staff.']);
        }

        DB::beginTransaction();
        try {
            WorkOrder::create([
                'complaint_id' => $complaint->id,
                'assigned_by'  => Auth::id(),
                'assigned_to'  => $request->assigned_to,
                'status'       => 'assigned',
            ]);
            $complaint->update(['status' => 'assigned']);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages(['message' => 'Failed to create work order.']);
        }

        return redirect('/dashboard?view=complaints');
    }

    /** Admin: update user (name, email, password — no role editing) */
    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => "sometimes|email|unique:users,email,{$user->id}",
            'password' => 'sometimes|string|min:8',
        ]);

        $data = $request->only(['name', 'email']);
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect('/dashboard?view=users');
    }

    /** Admin: create maintenance staff user */
    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'MAINTENANCE',
        ]);

        return redirect('/dashboard?view=users');
    }

    /** Admin: delete user */
    public function deleteUser(User $user)
    {
        if ($user->id === Auth::id()) {
            throw ValidationException::withMessages(['message' => 'Cannot delete your own account.']);
        }

        $user->delete();

        return redirect('/dashboard?view=users');
    }

    /** Engineering: approve complaint */
    public function approveComplaint(Request $request, Complaint $complaint)
    {
        $request->validate([
            'reason'                 => 'required|string',
            'engineering_assessment' => 'nullable|string',
            'recommended_materials'  => 'nullable|string',
            'estimated_hours'        => 'nullable|numeric',
        ]);

        if ($complaint->status !== 'submitted_to_engineering') {
            throw ValidationException::withMessages(['message' => 'Complaint is not pending engineering review.']);
        }

        $complaint->update([
            'status'            => 'approved',
            'damage_assessment' => $request->input('engineering_assessment', $request->reason),
        ]);

        ComplaintApproval::create([
            'complaint_id'           => $complaint->id,
            'reviewed_by'            => Auth::id(),
            'action'                 => 'approve',
            'reason'                 => $request->reason,
            'engineering_assessment' => $request->engineering_assessment,
            'recommended_materials'  => $request->recommended_materials ? [$request->recommended_materials] : [],
            'estimated_hours'        => $request->estimated_hours,
            'reviewed_at'            => now(),
        ]);

        return redirect('/dashboard?view=pending-approvals');
    }

    /** Engineering: decline complaint */
    public function declineComplaint(Request $request, Complaint $complaint)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        if ($complaint->status !== 'submitted_to_engineering') {
            throw ValidationException::withMessages(['message' => 'Complaint is not pending engineering review.']);
        }

        $complaint->update([
            'status'            => 'declined',
            'damage_assessment' => $request->reason,
        ]);

        ComplaintApproval::create([
            'complaint_id' => $complaint->id,
            'reviewed_by'  => Auth::id(),
            'action'       => 'decline',
            'reason'       => $request->reason,
            'reviewed_at'  => now(),
        ]);

        return redirect('/dashboard?view=pending-approvals');
    }

    /** Maintenance: start work on order */
    public function startWork(WorkOrder $workOrder)
    {
        $user = Auth::user();

        if ($workOrder->assigned_to !== $user->id) {
            throw ValidationException::withMessages(['message' => 'You are not assigned to this work order.']);
        }

        if ($workOrder->status !== 'assigned') {
            throw ValidationException::withMessages(['message' => 'Work order is not ready to start.']);
        }

        $workOrder->update(['status' => 'in_progress']);
        $workOrder->complaint->update(['status' => 'in_progress']);

        return redirect('/dashboard?view=assigned-tasks');
    }

    /** Maintenance: complete work on order */
    public function completeWork(WorkOrder $workOrder)
    {
        $user = Auth::user();

        if ($workOrder->assigned_to !== $user->id) {
            throw ValidationException::withMessages(['message' => 'You are not assigned to this work order.']);
        }

        if ($workOrder->status !== 'in_progress') {
            throw ValidationException::withMessages(['message' => 'Work order is not in progress.']);
        }

        $workOrder->update([
            'status'                   => 'completed',
            'actual_completion_date'   => now()->toDateString(),
        ]);

        return redirect('/dashboard?view=assigned-tasks');
    }

    /** Maintenance: submit report */
    public function submitReport(Request $request)
    {
        $request->validate([
            'work_order_id'    => 'required|exists:work_orders,id',
            'work_description' => 'required|string',
            'materials_used'   => 'nullable',
            'hours_worked'     => 'required|numeric|min:0.1|max:99.99',
            'completion_notes' => 'nullable|string',
            'work_quality'     => 'required|in:excellent,good,satisfactory,fair,needs_followup',
        ]);

        $workOrder = WorkOrder::findOrFail($request->work_order_id);

        if ($workOrder->assigned_to !== Auth::id()) {
            throw ValidationException::withMessages(['message' => 'You are not assigned to this work order.']);
        }

        if ($workOrder->maintenanceReport) {
            throw ValidationException::withMessages(['message' => 'Report already exists for this work order.']);
        }

        // Normalise materials
        $raw = $request->materials_used;
        $materials = is_string($raw)
            ? collect(preg_split('/\r?\n/', $raw))->filter()->values()
                ->map(fn ($l) => ['name' => trim($l), 'quantity' => 1, 'unit' => 'unit'])->toArray()
            : ($raw ?? []);

        DB::beginTransaction();
        try {
            MaintenanceReport::create([
                'work_order_id'    => $workOrder->id,
                'reported_by'      => Auth::id(),
                'work_description' => $request->work_description,
                'materials_used'   => $materials,
                'hours_worked'     => $request->hours_worked,
                'completion_notes' => $request->completion_notes,
                'work_quality'     => $request->work_quality,
                'requires_followup' => false,
                'work_started_at'  => now()->subHours((float) $request->hours_worked),
                'work_completed_at' => now(),
                'reported_at'      => now(),
            ]);

            $workOrder->update(['status' => 'verified']);
            $workOrder->complaint->update(['status' => 'completed']);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages(['message' => 'Failed to submit report.']);
        }

        return redirect('/dashboard?view=assigned-tasks');
    }

    /** Consumer: submit complaint */
    public function submitComplaint(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'location'    => 'required|string|max:255',
            'priority'    => 'sometimes|in:low,normal,high,urgent',
        ]);

        Complaint::create([
            'user_id'      => Auth::id(),
            'title'        => $request->title,
            'description'  => $request->description,
            'location'     => $request->location,
            'priority'     => $request->priority ?? 'normal',
            'status'       => 'pending',
            'submitted_at' => now(),
        ]);

        return redirect('/dashboard?view=complaints');
    }

    /** Public: submit complaint (no auth required) */
    public function submitPublicComplaint(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|string|max:255',
            'phone'       => 'required|string|max:20',
            'location'    => 'required|string|max:500',
            'description' => 'required|string|max:2000',
            'priority'    => 'required|in:low,normal,high,urgent',
        ]);

        // Check if user already exists, if not create a consumer account
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $user = User::create([
                'name'              => $request->name,
                'email'             => $request->email,
                'email_verified_at' => null,
                'password'          => bcrypt('temp123'),
                'role'              => \App\Models\UserRole::CONSUMER,
            ]);
        }

        $complaint = Complaint::create([
            'user_id'      => $user->id,
            'title'        => 'Public Complaint - ' . substr($request->description, 0, 50),
            'description'  => $request->description,
            'location'     => $request->location,
            'priority'     => $request->priority,
            'status'       => 'pending',
            'submitted_at' => now(),
        ]);

        $ref = 'WC-' . date('Y') . '-' . str_pad($complaint->id, 4, '0', STR_PAD_LEFT);

        return redirect('/')->with('success', "Complaint submitted successfully! Reference: {$ref}");
    }
}
