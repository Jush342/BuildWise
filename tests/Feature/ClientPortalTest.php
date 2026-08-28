<?php

use App\Models\Client;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login', function () {
    $response = $this->get('/client-portal/bookings');
    $response->assertRedirect(route('login'));
});

test('authenticated user without linked client gets 403', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/client-portal/bookings');
    $response->assertStatus(403);
});

test('linked client can view bookings page', function () {
    $user = User::factory()->create();
    Client::factory()->create([
        'team_id' => $user->current_team_id,
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get('/client-portal/bookings');
    $response->assertOk();
});

test('linked client can view invoices page', function () {
    $user = User::factory()->create();
    Client::factory()->create([
        'team_id' => $user->current_team_id,
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get('/client-portal/invoices');
    $response->assertOk();
});

test('client bookings page renders correct component', function () {
    $user = User::factory()->create();
    Client::factory()->create([
        'team_id' => $user->current_team_id,
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get('/client-portal/bookings');
    $response->assertInertia(fn (Assert $page) => $page->component('client-portal/bookings'));
});

test('client invoices page renders correct component', function () {
    $user = User::factory()->create();
    Client::factory()->create([
        'team_id' => $user->current_team_id,
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->get('/client-portal/invoices');
    $response->assertInertia(fn (Assert $page) => $page->component('client-portal/invoices'));
});
