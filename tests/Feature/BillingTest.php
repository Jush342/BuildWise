<?php

use App\Models\BillingTransaction;
use App\Models\Booking;
use App\Models\Client;
use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the billing page lists team invoices', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    $billingTransaction = BillingTransaction::factory()->create([
        'booking_id' => $booking->id,
        'invoice_number' => 'INV-20260901-TEST0001',
        'total_amount' => 100,
        'balance' => 100,
    ]);

    $this->actingAs($user)
        ->get(route('billing.index', $user->currentTeam))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('billing/index')
            ->has('billingTransactions', 1)
            ->where('billingTransactions.0.id', $billingTransaction->id));
});

test('a payment updates the invoice balance atomically', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    $billingTransaction = BillingTransaction::factory()->create([
        'booking_id' => $booking->id,
        'invoice_number' => 'INV-20260901-TEST0002',
        'total_amount' => 100,
        'balance' => 100,
    ]);

    $this->actingAs($user)
        ->post(route('payments.store', [$user->currentTeam, $billingTransaction]), [
            'payment_date' => '2026-09-01',
            'amount' => 40,
            'method' => 'cash',
        ])
        ->assertRedirect(route('billing.index', $user->currentTeam));

    expect($billingTransaction->refresh()->amount_paid)->toBe('40.00')
        ->and($billingTransaction->balance)->toBe('60.00')
        ->and($billingTransaction->payment_status)->toBe('partial');
    expect(Payment::query()->whereBelongsTo($billingTransaction)->count())->toBe(1);
});

test('a payment cannot exceed the invoice balance', function () {
    $user = User::factory()->create();
    $client = Client::factory()->create(['team_id' => $user->current_team_id]);
    $booking = Booking::factory()->create([
        'team_id' => $user->current_team_id,
        'client_id' => $client->id,
        'booking_date' => '2026-09-01',
        'start_time' => '09:00',
        'end_time' => '12:00',
    ]);
    $billingTransaction = BillingTransaction::factory()->create([
        'booking_id' => $booking->id,
        'invoice_number' => 'INV-20260901-TEST0003',
        'total_amount' => 100,
        'balance' => 100,
    ]);

    $this->actingAs($user)
        ->post(route('payments.store', [$user->currentTeam, $billingTransaction]), [
            'payment_date' => '2026-09-01',
            'amount' => 101,
            'method' => 'cash',
        ])
        ->assertSessionHasErrors('amount');
});
