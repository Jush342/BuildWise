<?php

use App\Models\Client;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the clients page can be rendered', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('clients.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('clients/index')
            ->has('clients'));
});

test('clients can be searched within the current team', function () {
    $user = User::factory()->create();
    Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Northstar Builders']);
    Client::factory()->create(['team_id' => $user->current_team_id, 'name' => 'Southside Plumbing']);

    $this->actingAs($user)
        ->get(route('clients.index', [$user->currentTeam, 'search' => 'Northstar']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('search', 'Northstar')
            ->has('clients', 1)
            ->where('clients.0.name', 'Northstar Builders'));
});

test('clients can be created and are assigned to the current team', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('clients.store', $user->currentTeam), [
            'name' => 'Acme Construction',
            'contact' => '555-0100',
            'email' => 'client@example.com',
            'address' => '100 Main Street',
        ])
        ->assertRedirect(route('clients.index', $user->currentTeam));

    $this->assertDatabaseHas('clients', [
        'team_id' => $user->current_team_id,
        'name' => 'Acme Construction',
    ]);
});

test('client names are required', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('clients.store', $user->currentTeam), [])
        ->assertSessionHasErrors('name');
});

test('clients from another team cannot be updated', function () {
    $user = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $client = Client::factory()->create(['team_id' => $otherTeam->id]);

    $this->actingAs($user)
        ->patch(route('clients.update', [$user->currentTeam, $client]), [
            'name' => 'Changed',
        ])
        ->assertForbidden();
});
