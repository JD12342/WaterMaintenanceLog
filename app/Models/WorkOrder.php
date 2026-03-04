<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @property int $id
 * @property string $work_order_number
 * @property int $complaint_id
 * @property int $assigned_by
 * @property int|null $assigned_to
 * @property int|null $engineering_approved_by
 * @property \Illuminate\Support\Carbon|null $engineering_approved_at
 * @property string|null $engineering_notes
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $estimated_completion_date
 * @property \Illuminate\Support\Carbon|null $actual_completion_date
 * @property string|null $assignment_notes
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 * @property-read Complaint $complaint
 * @property-read User $assignedByUser
 * @property-read User|null $assignedToUser
 * @property-read User|null $engineeringApprovedByUser
 * @property-read MaintenanceReport|null $maintenanceReport
 */
class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_number',
        'complaint_id',
        'assigned_by',
        'assigned_to',
        'engineering_approved_by',
        'engineering_approved_at',
        'engineering_notes',
        'status',
        'estimated_completion_date',
        'actual_completion_date',
        'assignment_notes'
    ];

    protected $casts = [
        'engineering_approved_at' => 'datetime',
        'estimated_completion_date' => 'date',
        'actual_completion_date' => 'date',
    ];

    /**
     * Boot method to auto-generate work order number
     */
    protected static function booted()
    {
        static::creating(function ($workOrder) {
            if (!$workOrder->work_order_number) {
                $currentYear = date('Y');
                $lastWorkOrder = static::whereYear('created_at', $currentYear)
                    ->orderBy('id', 'desc')
                    ->first();
                    
                $nextNumber = $lastWorkOrder ? 
                    intval(substr($lastWorkOrder->work_order_number, -3)) + 1 : 1;
                    
                $workOrder->work_order_number = 'WO-' . $currentYear . '-' . 
                    str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the complaint this work order belongs to
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the admin who assigned this work order
     */
    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the maintenance staff assigned to this work order
     */
    public function assignedToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the engineer who approved this work order
     */
    public function engineeringApprovedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'engineering_approved_by');
    }

    /**
     * Get the maintenance report for this work order
     */
    public function maintenanceReport(): HasOne
    {
        return $this->hasOne(MaintenanceReport::class);
    }

    /**
     * Check if work order is ready for assignment
     */
    public function isPendingAssignment(): bool
    {
        return $this->status === 'pending_assignment';
    }

    /**
     * Check if work order is in progress
     */
    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    /**
     * Check if work order is completed
     */
    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'verified']);
    }

    /**
     * Status badge CSS classes for UI
     */
    public function getStatusBadgeClass(): string
    {
        return match($this->status) {
            'pending_assignment' => 'bg-yellow-100 text-yellow-800',
            'assigned' => 'bg-blue-100 text-blue-800',
            'in_progress' => 'bg-orange-100 text-orange-800',
            'completed' => 'bg-green-100 text-green-800',
            'verified' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}
