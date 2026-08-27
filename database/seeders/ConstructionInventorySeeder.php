<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class ConstructionInventorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            $this->command->error('No user found. Run DatabaseSeeder first.');

            return;
        }

        $teamId = $user->current_team_id;
        $services = Service::where('team_id', $teamId)->get()->keyBy('name');

        $items = [
            // General Carpentry
            ['service' => 'General Carpentry', 'item' => 'Hammer (Claw)', 'qty' => 12, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'General Carpentry', 'item' => 'Handsaw (18")', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'General Carpentry', 'item' => 'Tape Measure (5m)', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'General Carpentry', 'item' => 'Chisel Set', 'qty' => 8, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'General Carpentry', 'item' => 'Carpenter Square', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],

            // Electrical Installation
            ['service' => 'Electrical Installation', 'item' => 'Wire Stripper', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Electrical Installation', 'item' => 'Multimeter (Digital)', 'qty' => 4, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Electrical Installation', 'item' => 'Conduit Bender', 'qty' => 3, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Electrical Installation', 'item' => 'Electrical Tape (rolls)', 'qty' => 50, 'condition' => 'good', 'status' => 'available'],

            // Plumbing
            ['service' => 'Plumbing', 'item' => 'Pipe Wrench (14")', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Plumbing', 'item' => 'Pipe Cutter', 'qty' => 4, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Plumbing', 'item' => 'Teflon Tape (rolls)', 'qty' => 30, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Plumbing', 'item' => 'PVC Cement (bottles)', 'qty' => 15, 'condition' => 'good', 'status' => 'available'],

            // Masonry & Concrete
            ['service' => 'Masonry & Concrete Work', 'item' => 'Trowel (Pointing)', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Masonry & Concrete Work', 'item' => 'Mixing Tub', 'qty' => 5, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'Masonry & Concrete Work', 'item' => 'Level (4ft)', 'qty' => 4, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Masonry & Concrete Work', 'item' => 'Concrete Float', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],

            // Painting
            ['service' => 'Painting (Interior)', 'item' => 'Paint Roller Set', 'qty' => 15, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Painting (Interior)', 'item' => 'Paint Brush Set (2", 3", 4")', 'qty' => 20, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Painting (Interior)', 'item' => 'Masking Tape (rolls)', 'qty' => 40, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Painting (Exterior)', 'item' => 'Spray Gun (Electric)', 'qty' => 3, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Painting (Exterior)', 'item' => 'Extension Pole (2m)', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],

            // Roofing
            ['service' => 'Roofing Installation', 'item' => 'Roofing Nails (kg)', 'qty' => 20, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Roofing Installation', 'item' => 'Caulking Gun', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Roofing Installation', 'item' => 'Tin Snips', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],

            // Tiling & Flooring
            ['service' => 'Tiling & Flooring', 'item' => 'Tile Cutter (Manual)', 'qty' => 3, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Tiling & Flooring', 'item' => 'Tile Spacers (bags)', 'qty' => 25, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Tiling & Flooring', 'item' => 'Rubber Mallet', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Tiling & Flooring', 'item' => 'Notched Trowel', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],

            // Steel Framing & Welding
            ['service' => 'Steel Framing', 'item' => 'Framing Square (Steel)', 'qty' => 4, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Steel Framing', 'item' => 'Bolts & Nuts Assorted (boxes)', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Welding Services', 'item' => 'Welding Rods (kg)', 'qty' => 30, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Welding Services', 'item' => 'Welding Mask (Auto-darkening)', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Welding Services', 'item' => 'Welding Gloves', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],

            // Scaffolding
            ['service' => 'Scaffolding Setup', 'item' => 'Scaffolding Frames (sets)', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Scaffolding Setup', 'item' => 'Scaffolding Planks', 'qty' => 20, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'Scaffolding Setup', 'item' => 'Scaffolding Clamps', 'qty' => 40, 'condition' => 'good', 'status' => 'available'],

            // Drywall & Insulation
            ['service' => 'Drywall Installation', 'item' => 'Drywall Screws (boxes)', 'qty' => 15, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Drywall Installation', 'item' => 'Joint Compound (bags)', 'qty' => 20, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Drywall Installation', 'item' => 'Drywall Knife Set', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Insulation Work', 'item' => 'Fiberglass Rolls', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Insulation Work', 'item' => 'Insulation Tape', 'qty' => 20, 'condition' => 'good', 'status' => 'available'],

            // Glass & Aluminum
            ['service' => 'Glass & Aluminum Works', 'item' => 'Glass Cutter', 'qty' => 4, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Glass & Aluminum Works', 'item' => 'Suction Cup Lifter', 'qty' => 3, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Glass & Aluminum Works', 'item' => 'Silicone Sealant (tubes)', 'qty' => 25, 'condition' => 'good', 'status' => 'available'],

            // Waterproofing
            ['service' => ' Waterproofing', 'item' => 'Waterproofing Membrane (rolls)', 'qty' => 12, 'condition' => 'good', 'status' => 'available'],
            ['service' => ' Waterproofing', 'item' => 'Primer (gallons)', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],

            // Excavation
            ['service' => 'Excavation & Grading', 'item' => 'Shovel (Round Point)', 'qty' => 10, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'Excavation & Grading', 'item' => 'Pickaxe', 'qty' => 6, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'Excavation & Grading', 'item' => 'Wheelbarrow', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],

            // Landscaping
            ['service' => 'Landscaping', 'item' => 'Pruning Shears', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Landscaping', 'item' => 'Garden Rake', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Landscaping', 'item' => 'Hose (10m)', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],

            // Demolition
            ['service' => 'Demolition', 'item' => 'Sledgehammer', 'qty' => 4, 'condition' => 'fair', 'status' => 'available'],
            ['service' => 'Demolition', 'item' => 'Crowbar', 'qty' => 6, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'Demolition', 'item' => 'Safety Goggles', 'qty' => 15, 'condition' => 'good', 'status' => 'available'],

            // Cleaning
            ['service' => 'House Cleaning (Post-Construction)', 'item' => 'Mop & Bucket Set', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'House Cleaning (Post-Construction)', 'item' => 'Broom Set', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
            ['service' => 'House Cleaning (Post-Construction)', 'item' => 'Cleaning Solution (gallons)', 'qty' => 12, 'condition' => 'good', 'status' => 'available'],

            // Shared / General
            ['service' => null, 'item' => 'Safety Helmet (Hard Hat)', 'qty' => 25, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'Safety Vest', 'qty' => 25, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'Work Gloves (pairs)', 'qty' => 30, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'First Aid Kit', 'qty' => 5, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'Portable Generator', 'qty' => 2, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'Extension Cord (50m)', 'qty' => 8, 'condition' => 'good', 'status' => 'available'],
            ['service' => null, 'item' => 'Work Light (LED)', 'qty' => 10, 'condition' => 'good', 'status' => 'available'],
        ];

        $count = 0;
        foreach ($items as $item) {
            $service = $item['service'] ? $services->get($item['service']) : null;
            $serviceId = $service?->id;

            Inventory::updateOrCreate(
                ['item_name' => $item['item'], 'team_id' => $teamId],
                [
                    'service_id' => $serviceId,
                    'quantity' => $item['qty'],
                    'condition' => $item['condition'],
                    'status' => $item['status'],
                ],
            );
            $count++;
        }

        $this->command->info($count.' inventory items seeded.');
    }
}
