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

test('a confirmed booking can be completed and cancelled', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $booking]), ['status' => 'completed'])
        ->assertRedirect(route('bookings.index', $user->currentTeam));

    expect($booking->refresh()->status)->toBe(Booking::STATUS_COMPLETED);

    $cancelledBooking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-02',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $cancelledBooking]), ['status' => 'cancelled'])
        ->assertRedirect(route('bookings.index', $user->currentTeam));

    expect($cancelledBooking->refresh()->status)->toBe(Booking::STATUS_CANCELLED);
});

test('completed bookings cannot change status', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
        'status' => Booking::STATUS_COMPLETED,
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $booking]), ['status' => 'cancelled'])
        ->assertForbidden();
});
