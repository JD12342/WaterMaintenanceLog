<?php

namespace Database\Seeders;

use App\Models\Complaint;
use App\Models\ComplaintApproval;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminEngineeringSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $removedAdminCount = 0;
        $removedEngineeringCount = 0;

        DB::transaction(function () use (&$removedAdminCount, &$removedEngineeringCount) {
            // Ensure canonical admin account exists.
            $admin = User::firstOrCreate(
                ['email' => 'admin@watermaintenance.local'],
                [
                    'name' => 'System Administrator',
                    'password' => Hash::make('Admin123!'),
                    'role' => 'ADMIN',
                ]
            );
            $admin->update([
                'name' => 'System Administrator',
                'role' => 'ADMIN',
            ]);

            // Ensure canonical engineering account exists.
            $engineering = User::firstOrCreate(
                ['email' => 'engineering@watermaintenance.local'],
                [
                    'name' => 'Engineering Department',
                    'password' => Hash::make('Engineering123!'),
                    'role' => 'ENGINEERING',
                ]
            );
            $engineering->update([
                'name' => 'Engineering Department',
                'role' => 'ENGINEERING',
            ]);

            // Keep only one admin account and safely reassign references.
            $extraAdminIds = User::where('role', 'ADMIN')
                ->where('id', '!=', $admin->id)
                ->pluck('id');

            if ($extraAdminIds->isNotEmpty()) {
                WorkOrder::whereIn('assigned_by', $extraAdminIds)->update(['assigned_by' => $admin->id]);
                Complaint::whereIn('user_id', $extraAdminIds)->update(['user_id' => $admin->id]);
                $removedAdminCount = User::whereIn('id', $extraAdminIds)->delete();
            }

            // Keep only one engineering account and safely reassign references.
            $extraEngineeringIds = User::where('role', 'ENGINEERING')
                ->where('id', '!=', $engineering->id)
                ->pluck('id');

            if ($extraEngineeringIds->isNotEmpty()) {
                WorkOrder::whereIn('engineering_approved_by', $extraEngineeringIds)
                    ->update(['engineering_approved_by' => $engineering->id]);
                ComplaintApproval::whereIn('reviewed_by', $extraEngineeringIds)
                    ->update(['reviewed_by' => $engineering->id]);
                Complaint::whereIn('user_id', $extraEngineeringIds)->update(['user_id' => $engineering->id]);
                $removedEngineeringCount = User::whereIn('id', $extraEngineeringIds)->delete();
            }
        });

        $this->command->info('✓ Admin and Engineering accounts normalized successfully!');
        $this->command->info("Removed extra admin accounts: {$removedAdminCount}");
        $this->command->info("Removed extra engineering accounts: {$removedEngineeringCount}");
        $this->command->newLine();
        $this->command->info('Login Credentials:');
        $this->command->info('==================');
        $this->command->info('Admin:');
        $this->command->info('  Email: admin@watermaintenance.local');
        $this->command->info('  Password: Admin123!');
        $this->command->newLine();
        $this->command->info('Engineering:');
        $this->command->info('  Email: engineering@watermaintenance.local');
        $this->command->info('  Password: Engineering123!');
        $this->command->newLine();
        $this->command->warn('⚠️  IMPORTANT: Change these passwords immediately after first login!');
    }
}
