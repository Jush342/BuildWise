<?php

namespace Database\Factories;

use App\Models\BillingTransaction;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BillingTransaction>
 */
class BillingTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'booking_id' => Booking::factory(),
            'invoice_number' => 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
            'total_amount' => 100.00,
            'amount_paid' => 0.00,
            'balance' => 100.00,
            'payment_status' => 'unpaid',
        ];
    }
}
