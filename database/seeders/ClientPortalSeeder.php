<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Client;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientPortalSeeder extends Seeder
{
    public function run(): void
    {
        $team = Team::firstOrCreate(['name' => 'Client Portal Team']);

        $user = User::create([
            'name' => 'Client User',
            'email' => 'client@example.com',
            'password' => Hash::make('password'),
            'current_team_id' => $team->id,
        ]);

        $user->teams()->attach($team, ['role' => 'member']);

        $teamId = $team->id;
        $services = Service::where('team_id', $teamId)->take(3)->get();

        $client = Client::create([
            'team_id' => $teamId,
            'user_id' => $user->id,
            'name' => 'Client User',
            'contact' => '09171234567',
            'email' => 'client@example.com',
            'address' => '123 Test Street, Metro Manila',
        ]);

        // Create 3 bookings with billing transactions
        $statuses = ['completed', 'confirmed', 'cancelled'];
        $dates = [
            now()->subDays(14)->toDateString(),
            now()->subDays(3)->toDateString(),
            now()->addDays(5)->toDateString(),
        ];

        foreach ($statuses as $i => $status) {
            $total = 0;
            $booking = Booking::create([
                'team_id' => $teamId,
                'client_id' => $client->id,
                'booking_date' => $dates[$i],
                'start_time' => '08:00',
                'end_time' => '17:00',
                'status' => $status,
                'total_amount' => 0,
            ]);

            foreach ($services as $service) {
                $hours = rand(4, 8);
                $subtotal = $service->hourly_rate * $hours;
                $total += $subtotal;

                BookingDetail::create([
                    'booking_id' => $booking->id,
                    'service_id' => $service->id,
                    'hours_rendered' => $hours,
                    'hourly_rate' => $service->hourly_rate,
                    'subtotal' => $subtotal,
                ]);
            }

            $booking->update(['total_amount' => $total]);

            $paid = $status === 'completed' ? $total : ($status === 'confirmed' ? $total * 0.5 : 0);

            $booking->billingTransaction()->create([
                'invoice_number' => 'INV-'.now()->subDays(14 - $i * 5)->format('Ymd').'-'.strtoupper(substr(uniqid(), -6)),
                'total_amount' => $total,
                'amount_paid' => $paid,
                'balance' => $total - $paid,
                'payment_status' => $paid >= $total ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid'),
            ]);
        }

        $this->command->info('Client portal seeder created:');
        $this->command->info('  Email: client@example.com');
        $this->command->info('  Password: password');
    }
}
