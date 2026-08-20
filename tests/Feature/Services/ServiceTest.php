<?php

use App\Models\Service;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the services page can be rendered', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('services.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('services/index')
            ->has('services'));
});

test('services can be created with a rate', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('services.store', $user->currentTeam), [
            'name' => 'Site inspection',
            'hourly_rate' => 125.50,
            'status' => 'active',
        ])
        ->assertRedirect(route('services.index', $user->currentTeam));

    $this->assertDatabaseHas('services', [
        'team_id' => $user->current_team_id,
        'name' => 'Site inspection',
        'hourly_rate' => 125.50,
    ]);
});

test('service rates cannot be negative', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('services.store', $user->currentTeam), [
            'name' => 'Invalid service',
            'hourly_rate' => -1,
            'status' => 'active',
        ])
        ->assertSessionHasErrors('hourly_rate');
});

test('services from another team cannot be deleted', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $service = Service::factory()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($user)
        ->delete(route('services.destroy', [$user->currentTeam, $service]))
        ->assertForbidden();
});
