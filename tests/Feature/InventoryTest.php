<?php

use App\Models\Booking;
use App\Models\Client;
use App\Models\Inventory;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the inventory page can be rendered with movements', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('inventory.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/index')
            ->has('inventory')
            ->has('movements')
            ->has('services'));
});

test('inventory items can be created and updated with movement history', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);

    $this->actingAs($user)
        ->post(route('inventory.store', $user->currentTeam), [
            'service_id' => $service->id,
            'item_name' => 'Safety helmets',
            'quantity' => 25,
            'condition' => 'good',
            'status' => 'available',
        ])
        ->assertRedirect(route('inventory.index', $user->currentTeam));

    $inventory = Inventory::query()->latest('id')->firstOrFail();
    expect($inventory->item_name)->toBe('Safety helmets');
    expect($inventory->movements)->toHaveCount(1);
    expect($inventory->movements->first()->type)->toBe('initial_stock');
    expect($inventory->movements->first()->quantity_change)->toBe(25);

    $this->actingAs($user)
        ->put(route('inventory.update', [$user->currentTeam, $inventory]), [
            'service_id' => '',
            'item_name' => 'Used safety helmets',
            'quantity' => 10,
            'condition' => 'fair',
            'status' => 'low_stock',
        ])
        ->assertRedirect(route('inventory.index', $user->currentTeam));

    expect($inventory->refresh()->quantity)->toBe(10)
        ->and($inventory->status)->toBe('low_stock');
    expect($inventory->movements)->toHaveCount(2);
    expect($inventory->movements->first()->quantity_change)->toBe(-15);
});

test('completing a booking auto-deducts linked inventory items and records movement', function () {
    $user = User::factory()->create();
    $service = Service::factory()->create(['team_id' => $user->current_team_id]);
    $inventory = Inventory::factory()->create([
        'team_id' => $user->current_team_id,
        'service_id' => $service->id,
        'item_name' => 'Drill bits',
        'quantity' => 5,
        'status' => 'available',
    ]);

    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
        'status' => Booking::STATUS_CONFIRMED,
    ]);
    $booking->details()->create([
        'service_id' => $service->id,
        'hours_rendered' => 2,
        'hourly_rate' => 100,
        'subtotal' => 200,
    ]);

    $this->actingAs($user)
        ->put(route('bookings.update', [$user->currentTeam, $booking]), [
            'status' => 'completed',
        ])
        ->assertRedirect(route('bookings.index', $user->currentTeam));

    expect($inventory->refresh()->quantity)->toBe(4);
    expect($inventory->movements)->toHaveCount(1);
    expect($inventory->movements->first()->type)->toBe('booking_deduction');
    expect($inventory->movements->first()->quantity_change)->toBe(-1);
    expect($inventory->movements->first()->booking_id)->toBe($booking->id);
});

test('inventory items from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $inventory = Inventory::factory()->create([
        'team_id' => $otherTeam->id,
        'item_name' => 'Private equipment',
        'quantity' => 1,
        'condition' => 'good',
        'status' => 'available',
    ]);

    $this->actingAs($user)
        ->delete(route('inventory.destroy', [$user->currentTeam, $inventory]))
        ->assertForbidden();
});
