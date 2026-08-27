<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Booking::class);
        $search = trim((string) $request->query('search', ''));

        $billingTransactions = BillingTransaction::query()
            ->with(['booking.client', 'payments'])
            ->whereHas('booking', fn ($query) => $query->whereBelongsTo($request->user()->currentTeam))
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('payment_status', 'like', "%{$search}%")
                    ->orWhereHas('booking.client', fn ($clientQuery) => $clientQuery->where('name', 'like', "%{$search}%"));
            }))
            ->latest()
            ->take(100)
            ->get();

        return Inertia::render('billing/index', [
            'billingTransactions' => $billingTransactions,
            'search' => $search,
        ]);
    }
}
