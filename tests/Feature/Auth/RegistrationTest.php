<?php

use App\Models\Team;
use App\Models\User;

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register as clients and are linked to a client record', function () {
    $team = Team::factory()->create(['name' => 'BuildWise Business']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test Client',
        'email' => 'client-new@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect('/client-portal/bookings');
    $this->assertAuthenticated();

    $user = User::where('email', 'client-new@example.com')->first();

    expect($user)->not->toBeNull();
    expect($user->client)->not->toBeNull();
    expect($user->client->team_id)->toBe($team->id);
    expect($user->client->name)->toBe('Test Client');
    expect($user->client->email)->toBe('client-new@example.com');
});

test('registration creates the primary business team when none exists', function () {
    $this->post(route('register.store'), [
        'name' => 'First Client',
        'email' => 'first@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    $user = User::where('email', 'first@example.com')->first();

    expect(Team::where('is_personal', false))->not->toBeEmpty();
    expect($user->client->team_id)->toBe(Team::primaryBusiness()->id);
});
