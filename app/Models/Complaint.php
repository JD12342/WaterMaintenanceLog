<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'location',
        'priority',
        'status',
        'damage_assessment',
        'admin_notes',
        'submitted_at'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the user who submitted the complaint
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the work order for this complaint
     */
    public function workOrder(): HasOne
    {
        return $this->hasOne(WorkOrder::class);
    }

    /**
     * Check if complaint is pending engineering review
     */
    public function isPendingEngineering(): bool
    {
        return in_array($this->status, ['pending', 'reviewed', 'submitted_to_engineering']);
    }

    /**
     * Check if complaint is approved and ready for assignment
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if complaint is completed
     */
    public function isCompleted(): bool
    {
        return in_array($this->status, ['completed', 'closed']);
    }

    /**
     * Status badge CSS classes for UI
     */
    public function getStatusBadgeClass(): string
    {
        return match($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'reviewed' => 'bg-blue-100 text-blue-800',
            'submitted_to_engineering' => 'bg-purple-100 text-purple-800',
            'approved' => 'bg-green-100 text-green-800',
            'declined' => 'bg-red-100 text-red-800',
            'assigned' => 'bg-indigo-100 text-indigo-800',
            'in_progress' => 'bg-orange-100 text-orange-800',
            'completed' => 'bg-green-100 text-green-800',
            'closed' => 'bg-gray-100 text-gray-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }
}
