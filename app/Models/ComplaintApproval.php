<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ComplaintApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'reviewed_by',
        'action',
        'reason',
        'engineering_assessment',
        'recommended_materials',
        'estimated_hours',
        'reviewed_at'
    ];

    protected $casts = [
        'recommended_materials' => 'array',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the complaint this approval belongs to
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * Get the engineer who reviewed this complaint
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if the approval is approved
     */
    public function isApproved(): bool
    {
        return $this->action === 'approve';
    }

    /**
     * Check if the approval is declined
     */
    public function isDeclined(): bool
    {
        return $this->action === 'decline';
    }
}
