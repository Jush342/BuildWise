<?php

namespace App\Models;

use Database\Factories\BookingDetailFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['booking_id', 'service_id', 'hours_rendered', 'hourly_rate', 'subtotal'])]
class BookingDetail extends Model
{
    /** @use HasFactory<BookingDetailFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    protected function casts(): array
    {
        return ['hours_rendered' => 'decimal:2', 'hourly_rate' => 'decimal:2', 'subtotal' => 'decimal:2'];
    }
}
