<?php

use App\Models\BillingTransaction;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can view bookings index with schedule and details', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);
    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);

    $this->actingAs($user)
        ->get(route('bookings.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('bookings/index')
            ->has('bookings', 1)
            ->has('clients', 1)
            ->has('services', 1)
        );
});

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

test('a confirmed booking can be rescheduled and edited with recalculated total', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service1 = Service::factory()->create([
        'team_id' => $user->current_team_id,
        'hourly_rate' => 100,
    ]);
    $service2 = Service::factory()->create([
        'team_id' => $user->current_team_id,
        'hourly_rate' => 50,
    ]);

    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '11:00',
        'total_amount' => 200,
    ]);
    $booking->details()->create([
        'service_id' => $service1->id,
        'hours_rendered' => 2,
        'hourly_rate' => 100,
        'subtotal' => 200,
    ]);
    BillingTransaction::factory()->create([
        'booking_id' => $booking->id,
        'total_amount' => 200,
        'amount_paid' => 50,
        'balance' => 150,
        'payment_status' => 'partial',
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $booking]), [
            'client_id' => $client->id,
            'booking_date' => '2026-09-05',
            'start_time' => '13:00',
            'end_time' => '16:00',
            'services' => [
                ['service_id' => $service1->id, 'hours_rendered' => 2],
                ['service_id' => $service2->id, 'hours_rendered' => 1],
            ],
        ])
        ->assertRedirect(route('bookings.index', $user->currentTeam));

    $booking->refresh();
    expect($booking->booking_date->format('Y-m-d'))->toBe('2026-09-05');
    expect($booking->start_time)->toBe('13:00');
    expect($booking->end_time)->toBe('16:00');
    expect((float) $booking->total_amount)->toBe(250.0);
    expect($booking->details)->toHaveCount(2);
    expect((float) $booking->billingTransaction->total_amount)->toBe(250.0);
    expect((float) $booking->billingTransaction->balance)->toBe(200.0);
});

test('a booking update rejects overlapping schedules with another booking', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);

    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '14:00',
        'end_time' => '16:00',
        'status' => Booking::STATUS_CONFIRMED,
    ]);

    $bookingToUpdate = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '11:00',
        'status' => Booking::STATUS_CONFIRMED,
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $bookingToUpdate]), [
            'client_id' => $client->id,
            'booking_date' => '2026-09-01',
            'start_time' => '15:00',
            'end_time' => '17:00',
            'services' => [
                ['service_id' => $service->id, 'hours_rendered' => 2],
            ],
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
