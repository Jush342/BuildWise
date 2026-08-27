<?php

use App\Models\BillingTransaction;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Service;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('reports index renders with summary and transactions', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);

    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'total_amount' => 500,
        'booking_date' => now(),
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    BillingTransaction::factory()->create([
        'booking_id' => $booking->id,
        'total_amount' => 500,
        'amount_paid' => 200,
        'balance' => 300,
        'payment_status' => 'partial',
    ]);

    $this->actingAs($user)
        ->get(route('reports.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->has('summary')
            ->has('transactions', 1)
            ->has('clients', 1)
        );
});

test('reports index filters by client_id', function () {
    $user = User::factory()->create();
    $clientA = Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Client A']);
    $clientB = Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Client B']);
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);

    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $clientA->id,
        'total_amount' => 100,
        'booking_date' => now(),
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $clientB->id,
        'total_amount' => 200,
        'booking_date' => now(),
        'start_time' => '13:00',
        'end_time' => '16:00',
    ]);

    $this->actingAs($user)
        ->get(route('reports.index', ['current_team' => $user->currentTeam, 'client_id' => $clientA->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->has('transactions', 1)
            ->where('filters.clientId', $clientA->id)
        );
});

test('reports export filters by client_id', function () {
    $user = User::factory()->create();
    $clientA = Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Client A']);
    $clientB = Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Client B']);

    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $clientA->id,
        'total_amount' => 100,
        'booking_date' => now(),
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $clientB->id,
        'total_amount' => 200,
        'booking_date' => now(),
        'start_time' => '13:00',
        'end_time' => '16:00',
    ]);

    $response = $this->actingAs($user)
        ->get(route('reports.export', ['current_team' => $user->currentTeam, 'client_id' => $clientA->id]));

    $response->assertOk();
    $content = $response->streamedContent();
    expect($content)->toContain('Client A');
    expect($content)->not->toContain('Client B');
});
