<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed the application's admin account.
     *
     * The admin owns a single business team and is NOT linked to a Client
     * record, so they are routed to the admin portal after authentication.
     */
    public function run(): void
    {
        $team = Team::firstOrCreate(['name' => 'BuildWise Business']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ],
        );

        $team->members()->syncWithoutDetaching([
            $admin->id => ['role' => TeamRole::Owner],
        ]);

        $admin->switchTeam($team);

        $this->command->info('Admin seeder created:');
        $this->command->info('  Email: admin@example.com');
        $this->command->info('  Password: password');
    }
}
