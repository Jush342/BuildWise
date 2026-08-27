<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConstructionServicesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            $this->command->error('No user found. Run DatabaseSeeder first.');

            return;
        }

        $teamId = $user->current_team_id;

        $services = [
            ['name' => 'General Carpentry', 'hourly_rate' => 550],
            ['name' => 'Electrical Installation', 'hourly_rate' => 650],
            ['name' => 'Plumbing', 'hourly_rate' => 600],
            ['name' => 'Masonry & Concrete Work', 'hourly_rate' => 500],
            ['name' => 'Painting (Interior)', 'hourly_rate' => 400],
            ['name' => 'Painting (Exterior)', 'hourly_rate' => 450],
            ['name' => 'Roofing Installation', 'hourly_rate' => 700],
            ['name' => 'Tiling & Flooring', 'hourly_rate' => 550],
            ['name' => 'Steel Framing', 'hourly_rate' => 650],
            ['name' => 'Welding Services', 'hourly_rate' => 700],
            ['name' => 'Excavation & Grading', 'hourly_rate' => 800],
            ['name' => 'Scaffolding Setup', 'hourly_rate' => 450],
            ['name' => 'Drywall Installation', 'hourly_rate' => 450],
            ['name' => 'Insulation Work', 'hourly_rate' => 500],
            ['name' => 'Ceiling & Partition', 'hourly_rate' => 500],
            ['name' => 'Glass & Aluminum Works', 'hourly_rate' => 600],
            ['name' => ' Waterproofing', 'hourly_rate' => 550],
            ['name' => 'Landscaping', 'hourly_rate' => 400],
            ['name' => 'Demolition', 'hourly_rate' => 600],
            ['name' => 'House Cleaning (Post-Construction)', 'hourly_rate' => 350],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => trim($service['name']), 'team_id' => $teamId],
                ['hourly_rate' => $service['hourly_rate'], 'status' => 'active'],
            );
        }

        $this->command->info(count($services).' construction services seeded.');
    }
}
