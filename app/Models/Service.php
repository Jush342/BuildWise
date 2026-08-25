<?php

namespace App\Models;

use Database\Factories\ServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['team_id', 'name', 'hourly_rate', 'status'])]
class Service extends Model
{
    /** @use HasFactory<ServiceFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    protected function casts(): array
    {
        return [
            'hourly_rate' => 'decimal:2',
        ];
    }

    /**
     * @return HasMany<BookingDetail, $this>
     */
    public function bookingDetails(): HasMany
    {
        return $this->hasMany(BookingDetail::class);
    }

    /**
     * @return HasMany<Inventory, $this>
     */
    public function inventory(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}
