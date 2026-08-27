<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\SaveInventoryRequest;
use App\Models\Inventory;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Inventory::class);
        $search = trim((string) $request->query('search', ''));
        $inventory = $request->user()->currentTeam->inventory()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('item_name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhereHas('service', fn ($serviceQuery) => $serviceQuery->where('name', 'like', "%{$search}%"));
            }))
            ->with('service:id,name')
            ->orderBy('item_name')
            ->take(100)
            ->get();

        $movements = $request->user()->currentTeam->inventoryMovements()
            ->with(['inventory:id,item_name', 'user:id,name', 'booking:id,client_id', 'booking.client:id,name'])
            ->latest()
            ->take(25)
            ->get();

        return Inertia::render('inventory/index', [
            'inventory' => $inventory,
            'movements' => $movements,
            'services' => $request->user()->currentTeam->services()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'search' => $search,
        ]);
    }

    public function store(SaveInventoryRequest $request): RedirectResponse
    {
        Gate::authorize('create', Inventory::class);

        $inventory = $request->user()->currentTeam->inventory()->create($request->validated());

        if ($inventory->quantity > 0) {
            $inventory->movements()->create([
                'team_id' => $inventory->team_id,
                'user_id' => $request->user()->id,
                'type' => 'initial_stock',
                'quantity_change' => $inventory->quantity,
                'previous_quantity' => 0,
                'new_quantity' => $inventory->quantity,
                'reason' => 'Initial stock intake',
            ]);
        }

        return to_route('inventory.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function update(SaveInventoryRequest $request, Team $currentTeam, Inventory $inventory): RedirectResponse
    {
        Gate::authorize('update', $inventory);

        $previousQuantity = (int) $inventory->quantity;
        $inventory->update($request->validated());
        $newQuantity = (int) $inventory->quantity;

        if ($previousQuantity !== $newQuantity) {
            $inventory->movements()->create([
                'team_id' => $inventory->team_id,
                'user_id' => $request->user()->id,
                'type' => $newQuantity > $previousQuantity ? 'restock' : 'adjustment',
                'quantity_change' => $newQuantity - $previousQuantity,
                'previous_quantity' => $previousQuantity,
                'new_quantity' => $newQuantity,
                'reason' => 'Manual stock update',
            ]);
        }

        return to_route('inventory.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function destroy(Request $request, Team $currentTeam, Inventory $inventory): RedirectResponse
    {
        Gate::authorize('delete', $inventory);

        $inventory->delete();

        return to_route('inventory.index', ['current_team' => $request->user()->currentTeam]);
    }
}
