<?php

use App\Models\Inventory;
use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the inventory page can be rendered', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('inventory.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('inventory/index')
            ->has('inventory')
            ->has('services'));
});

test('inventory items can be created and updated', function () {
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
