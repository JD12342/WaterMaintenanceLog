<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Complaint;
use App\Models\WorkOrder;
use App\Models\MaintenanceReport;
use App\Models\ComplaintApproval;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create all maintenance staff accounts
        $maintenance_staff = [
            ['name' => 'Tom Anderson', 'email' => 'tom.anderson@watermaintenance.local'],
            ['name' => 'Alex Martinez', 'email' => 'alex.martinez@watermaintenance.local'],
            ['name' => 'Chris Lee', 'email' => 'chris.lee@watermaintenance.local'],
            ['name' => 'Jake Miller', 'email' => 'jake.miller@watermaintenance.local'],
            ['name' => 'Ryan Garcia', 'email' => 'ryan.garcia@watermaintenance.local'],
            ['name' => 'Anthony Thompson', 'email' => 'anthon@gmail.com'],
        ];

        $maintenance_users = [];
        foreach ($maintenance_staff as $staff) {
            $user = User::firstOrCreate(
                ['email' => $staff['email']],
                [
                    'name' => $staff['name'],
                    'password' => Hash::make('Maintenance123!'),
                    'role' => 'MAINTENANCE',
                    'email_verified_at' => now(),
                ]
            );
            $maintenance_users[] = $user;
        }

        // Create all consumer accounts
        $consumers = [
            ['name' => 'Sarah Johnson', 'email' => 'sarah.johnson@watermaintenance.local'],
            ['name' => 'Mike Wilson', 'email' => 'mike.wilson@watermaintenance.local'],
            ['name' => 'Lisa Garcia', 'email' => 'lisa.garcia@watermaintenance.local'],
        ];

        $consumer_users = [];
        foreach ($consumers as $consumer) {
            $user = User::firstOrCreate(
                ['email' => $consumer['email']],
                [
                    'name' => $consumer['name'],
                    'password' => Hash::make('Consumer123!'),
                    'role' => 'CONSUMER',
                    'email_verified_at' => now(),
                ]
            );
            $consumer_users[] = $user;
        }

        // Get admin and engineering users
        $admin = User::where('email', 'admin@watermaintenance.local')->first();
        $engineering = User::where('email', 'engineering@watermaintenance.local')->first();

        if ($admin && $engineering) {
            // Create sample complaints
            $complaint_titles = [
                'Water leak in kitchen',
                'Low water pressure',
                'Broken pipe in basement',
                'Water discoloration issue',
                'Dripping faucet - persistent',
                'Water meter not reading',
                'Burst pipe outside',
                'Clogged drain system',
                'Water heater malfunction',
                'Main supply valve stuck',
            ];

            $complaint_descriptions = [
                'There is a steady water leak coming from under the kitchen sink that has been ongoing for three days.',
                'The water pressure in the second floor bathrooms is significantly lower than normal, making showers difficult.',
                'Found active water dripping from pipes in the basement storage area, approximately 10 liters per hour.',
                'The water coming out of faucets appears brownish/cloudy, affecting all outlets in the house.',
                'The kitchen faucet has been dripping for two weeks despite tightening the handle.',
                'The water meter reading seems stuck and is not advancing even with active water use.',
                'The main water pipe outside the house has burst, creating a large wet area in the yard.',
                'The master bathroom drain is completely clogged and water is backing up.',
                'The water heater is not heating water to desired temperature and making strange noises.',
                'The main water shut-off valve is stuck and cannot be turned even with significant effort.',
            ];

            $locations = [
                '123 Main Street',
                '456 Oak Avenue',
                '789 Pine Road',
                '321 Elm Street',
                '654 Maple Drive',
                '987 Cedar Lane',
                '147 Birch Court',
                '258 Spruce Way',
                '369 Willow Path',
                '741 Ash Boulevard',
            ];

            for ($i = 0; $i < 10; $i++) {
                $complaint = Complaint::create([
                    'user_id' => $consumer_users[array_rand($consumer_users)]->id,
                    'title' => $complaint_titles[$i],
                    'description' => $complaint_descriptions[$i],
                    'location' => $locations[$i],
                    'priority' => fake()->randomElement(['low', 'normal', 'high', 'urgent']),
                    'status' => 'pending',
                    'submitted_at' => now()->subDays(rand(1, 30)),
                ]);

                // Create some approved complaints with work orders
                if ($i < 7) {
                    // Forward to engineering
                    $complaint->update([
                        'status' => 'submitted_to_engineering',
                        'admin_notes' => fake()->sentence(),
                    ]);

                    // Approve complaint
                    $complaint->update(['status' => 'approved']);
                    
                    ComplaintApproval::create([
                        'complaint_id' => $complaint->id,
                        'reviewed_by' => $engineering->id,
                        'action' => 'approve',
                        'reason' => fake()->sentence(),
                        'reviewed_at' => now(),
                    ]);

                    // Create work order
                    $work_order = WorkOrder::create([
                        'work_order_number' => 'WO-' . date('Y') . '-' . str_pad($complaint->id, 4, '0', STR_PAD_LEFT),
                        'complaint_id' => $complaint->id,
                        'assigned_by' => $admin->id,
                        'assigned_to' => $maintenance_users[array_rand($maintenance_users)]->id,
                        'engineering_approved_by' => $engineering->id,
                        'engineering_approved_at' => now(),
                        'engineering_notes' => fake()->paragraph(),
                        'status' => fake()->randomElement(['assigned', 'in_progress', 'completed']),
                        'estimated_completion_date' => now()->addDays(rand(1, 7)),
                        'actual_completion_date' => fake()->boolean(50) ? now() : null,
                        'assignment_notes' => fake()->sentence(),
                    ]);

                    // If work order is in progress or completed, create maintenance report
                    if ($work_order->status !== 'assigned') {
                        MaintenanceReport::create([
                            'work_order_id' => $work_order->id,
                            'reported_by' => $work_order->assigned_to,
                            'work_description' => fake()->paragraph(),
                            'materials_used' => 'PVC pipe, copper fittings, sealant tape',
                            'hours_worked' => fake()->randomFloat(1, 1, 8),
                            'completion_notes' => fake()->sentence(),
                            'work_quality' => fake()->randomElement(['excellent', 'good', 'satisfactory']),
                            'requires_followup' => fake()->boolean(20),
                            'work_started_at' => $work_order->created_at,
                            'work_completed_at' => now(),
                            'reported_at' => now(),
                        ]);

                        // Update complaint status
                        $complaint->update(['status' => 'completed']);
                    }
                }
            }

            $this->command->info('✓ All sample data created successfully!');
            $this->command->info('');
            $this->command->info('Created:');
            $this->command->info('  • ' . count($maintenance_users) . ' maintenance staff accounts');
            $this->command->info('  • ' . count($consumer_users) . ' consumer accounts');
            $this->command->info('  • 10 sample complaints');
            $this->command->info('  • 7 work orders with reports');
        }
    }
}

