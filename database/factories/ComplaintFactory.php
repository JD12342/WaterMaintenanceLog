<?php

namespace Database\Factories;

use App\Models\Complaint;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Complaint>
 */
class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'location' => fake()->address(),
            'priority' => fake()->randomElement(['low', 'normal', 'high', 'urgent']),
            'status' => 'pending',
            'damage_assessment' => null,
            'admin_notes' => null,
            'submitted_at' => now(),
        ];
    }

    /**
     * Indicate that the complaint is submitted to engineering.
     */
    public function submittedToEngineering(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'submitted_to_engineering',
            'priority' => fake()->randomElement(['low', 'normal', 'high', 'urgent']),
        ]);
    }

    /**
     * Indicate that the complaint is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    /**
     * Indicate that the complaint is declined.
     */
    public function declined(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'declined',
        ]);
    }
}
