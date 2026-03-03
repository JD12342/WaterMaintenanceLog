<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MaintenanceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'reported_by',
        'work_description',
        'materials_used',
        'hours_worked',
        'completion_notes',
        'photos',
        'work_quality',
        'requires_followup',
        'followup_notes',
        'work_started_at',
        'work_completed_at',
        'reported_at'
    ];

    protected $casts = [
        'materials_used' => 'array',
        'photos' => 'array',
        'hours_worked' => 'decimal:2',
        'requires_followup' => 'boolean',
        'work_started_at' => 'datetime',
        'work_completed_at' => 'datetime',
        'reported_at' => 'datetime',
    ];

    /**
     * Get the work order this report belongs to
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Get the maintenance staff who created this report
     */
    public function reportedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get total cost of materials used
     */
    public function getTotalMaterialCost(): float
    {
        if (!$this->materials_used) {
            return 0;
        }

        $total = 0;
        foreach ($this->materials_used as $material) {
            $total += ($material['quantity'] ?? 0) * ($material['unit_cost'] ?? 0);
        }

        return $total;
    }

    /**
     * Get formatted materials list for display
     */
    public function getFormattedMaterialsList(): string
    {
        if (!$this->materials_used) {
            return 'No materials specified';
        }

        $list = [];
        foreach ($this->materials_used as $material) {
            $name = $material['name'] ?? 'Unknown item';
            $quantity = $material['quantity'] ?? 0;
            $unit = $material['unit'] ?? 'pcs';
            $list[] = "{$quantity} {$unit} of {$name}";
        }

        return implode(', ', $list);
    }

    /**
     * Calculate work duration in hours
     */
    public function getWorkDurationHours(): float
    {
        if (!$this->work_started_at || !$this->work_completed_at) {
            return 0;
        }

        return $this->work_started_at->diffInHours($this->work_completed_at);
    }

    /**
     * Quality badge CSS classes for UI
     */
    public function getQualityBadgeClass(): string
    {
        return match($this->work_quality) {
            'excellent' => 'bg-green-100 text-green-800',
            'good' => 'bg-blue-100 text-blue-800',
            'satisfactory' => 'bg-yellow-100 text-yellow-800',
            'needs_followup' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}
