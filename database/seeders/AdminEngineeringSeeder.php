<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminEngineeringSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin Account
        User::firstOrCreate(
            ['email' => 'admin@watermaintenance.local'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Admin123!'),
                'role' => 'ADMIN',
            ]
        );

        // Create Engineering Account
        User::firstOrCreate(
            ['email' => 'engineering@watermaintenance.local'],
            [
                'name' => 'Engineering Department',
                'password' => Hash::make('Engineering123!'),
                'role' => 'ENGINEERING',
            ]
        );

        $this->command->info('✓ Admin and Engineering accounts created successfully!');
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
