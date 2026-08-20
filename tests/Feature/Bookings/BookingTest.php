<?php

use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;

test('a booking calculates details and creates an invoice', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service = Service::factory()->create([
        'team_id' => $user->current_team_id,
        'hourly_rate' => 150,
    ]);

    $this->actingAs($user)
        ->post(route('bookings.store', $user->currentTeam), [
            'client_id' => $client->id,
            'booking_date' => '2026-09-01',
            'start_time' => '09:00',
            'end_time' => '12:00',
            'services' => [
                ['service_id' => $service->id, 'hours_rendered' => 3],
            ],
        ])
        ->assertRedirect(route('bookings.index', $user->currentTeam));

    $booking = Booking::query()->latest('id')->firstOrFail();

    expect((float) $booking->total_amount)->toBe(450.0);
    expect($booking->details)->toHaveCount(1);
    expect($booking->billingTransaction->balance)->toBe('450.00');
});

test('overlapping bookings are rejected', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);

    $this->actingAs($user)->post(route('bookings.store', $user->currentTeam), [
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
        'services' => [['service_id' => $service->id, 'hours_rendered' => 3]],
    ])->assertRedirect();

    $this->actingAs($user)
        ->post(route('bookings.store', $user->currentTeam), [
            'client_id' => $client->id,
            'booking_date' => '2026-09-01',
            'start_time' => '11:00',
            'end_time' => '13:00',
            'services' => [['service_id' => $service->id, 'hours_rendered' => 2]],
        ])
        ->assertSessionHasErrors('start_time');
});
