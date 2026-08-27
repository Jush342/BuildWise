<?php

namespace App\Models;

use Database\Factories\InventoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['team_id', 'service_id', 'item_name', 'quantity', 'condition', 'status'])]
class Inventory extends Model
{
    /** @use HasFactory<InventoryFactory> */
    use HasFactory;

    protected $attributes = ['quantity' => 0, 'condition' => 'good', 'status' => 'available'];

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsTo<Service, $this>
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * @return HasMany<InventoryMovement, $this>
     */
    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class)->latest();
    }

    public function adjustStock(
        int $quantityChange,
        string $type = 'adjustment',
        ?string $reason = null,
        ?int $bookingId = null,
        ?int $userId = null
    ): InventoryMovement {
        $previousQuantity = (int) $this->quantity;
        $newQuantity = max(0, $previousQuantity + $quantityChange);

        $status = $newQuantity === 0
            ? 'out_of_stock'
            : ($newQuantity <= 3 ? 'low_stock' : 'available');

        $this->update([
            'quantity' => $newQuantity,
            'status' => $status,
        ]);

        return $this->movements()->create([
            'team_id' => $this->team_id,
            'booking_id' => $bookingId,
            'user_id' => $userId,
            'type' => $type,
            'quantity_change' => $newQuantity - $previousQuantity,
            'previous_quantity' => $previousQuantity,
            'new_quantity' => $newQuantity,
            'reason' => $reason,
        ]);
    }

    protected function casts(): array
    {
        return ['quantity' => 'integer'];
    }
}
