<?php

namespace App\Http\Controllers;

use App\Models\BillingTransaction;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\TeamInvitation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $email = strtolower($request->user()->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        $teamInvoices = BillingTransaction::query()
            ->whereHas('booking', fn ($query) => $query->whereBelongsTo($team))
            ->get(['id', 'total_amount', 'amount_paid', 'balance', 'payment_status', 'created_at']);

        $revenueTrend = collect(range(5, 0))->map(function (int $monthsAgo) use ($team, $teamInvoices): array {
            $date = Carbon::now()->subMonths($monthsAgo);
            $monthKey = $date->format('Y-m');

            $billed = (float) $teamInvoices
                ->filter(fn (BillingTransaction $inv) => $inv->created_at?->format('Y-m') === $monthKey)
                ->sum(fn (BillingTransaction $inv) => (float) $inv->total_amount);

            $collected = Payment::query()
                ->whereHas('billingTransaction.booking', fn ($query) => $query->whereBelongsTo($team))
                ->whereYear('payment_date', $date->year)
                ->whereMonth('payment_date', $date->month)
                ->sum('amount');

            return [
                'month' => $monthKey,
                'label' => $date->format('M Y'),
                'shortLabel' => $date->format('M'),
                'billed' => round($billed, 2),
                'collected' => round((float) $collected, 2),
            ];
        })->values()->all();

        $recentBookings = $team->bookings()
            ->with('client:id,name')
            ->latest('booking_date')
            ->latest('start_time')
            ->take(5)
            ->get(['id', 'client_id', 'booking_date', 'start_time', 'end_time', 'status', 'total_amount']);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'totalBookings' => $team->bookings()->count(),
                'upcomingBookings' => $team->bookings()
                    ->where('status', Booking::STATUS_CONFIRMED)
                    ->whereDate('booking_date', '>=', today())
                    ->count(),
                'revenueCollected' => number_format((float) $teamInvoices->sum(fn ($i) => (float) $i->amount_paid), 2, '.', ''),
                'outstandingBalance' => number_format((float) $teamInvoices->sum(fn ($i) => (float) $i->balance), 2, '.', ''),
                'inventoryAlerts' => $team->inventory()
                    ->whereIn('status', ['low_stock', 'out_of_stock'])
                    ->count(),
            ],
            'revenueTrend' => $revenueTrend,
            'paymentStatusSummary' => [
                'paidCount' => $teamInvoices->where('payment_status', 'paid')->count(),
                'partialCount' => $teamInvoices->where('payment_status', 'partial')->count(),
                'unpaidCount' => $teamInvoices->where('payment_status', 'unpaid')->count(),
                'paidAmount' => round((float) $teamInvoices->where('payment_status', 'paid')->sum('total_amount'), 2),
                'partialAmount' => round((float) $teamInvoices->where('payment_status', 'partial')->sum('total_amount'), 2),
                'unpaidAmount' => round((float) $teamInvoices->where('payment_status', 'unpaid')->sum('total_amount'), 2),
                'totalInvoiced' => round((float) $teamInvoices->sum('total_amount'), 2),
            ],
            'recentBookings' => $recentBookings,
        ]);
    }
}
