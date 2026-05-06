<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    protected $model = WorkOrder::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        $complaint = Complaint::factory()->approved()->create();
        
        return [
            'work_order_number' => 'WO-' . date('Y') . '-' . Str::padLeft(Str::random(4, '0123456789'), 4, '0'),
            'complaint_id' => $complaint->id,
            'assigned_by' => User::factory()->create(['role' => 'ADMIN'])->id,
            'assigned_to' => User::factory()->create(['role' => 'MAINTENANCE'])->id,
            'engineering_approved_by' => null,
            'engineering_approved_at' => null,
            'engineering_notes' => null,
            'status' => 'pending_assignment',
            'estimated_completion_date' => now()->addDays(7)->toDateString(),
            'actual_completion_date' => null,
            'assignment_notes' => null,
        ];
    }

    /**
     * Indicate that the work order is assigned.
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'assigned',
        ]);
    }

    /**
     * Indicate that the work order is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
        ]);
    }

    /**
     * Indicate that the work order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'actual_completion_date' => now()->toDateString(),
        ]);
    }
}
