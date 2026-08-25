<?php

namespace App\Models;

use Database\Factories\BillingTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['booking_id', 'invoice_number', 'total_amount', 'amount_paid', 'balance', 'payment_status'])]
class BillingTransaction extends Model
{
    /** @use HasFactory<BillingTransactionFactory> */
    use HasFactory;

    protected $attributes = ['amount_paid' => 0, 'payment_status' => 'unpaid'];

    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    protected function casts(): array
    {
        return ['total_amount' => 'decimal:2', 'amount_paid' => 'decimal:2', 'balance' => 'decimal:2'];
    }
}
