<?php

namespace App\Http\Controllers;

use App\Models\BillingTransaction;
use App\Models\Booking;
use App\Models\TeamInvitation;
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

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'totalBookings' => $team->bookings()->count(),
                'upcomingBookings' => $team->bookings()
                    ->where('status', Booking::STATUS_CONFIRMED)
                    ->whereDate('booking_date', '>=', today())
                    ->count(),
                'revenueCollected' => number_format((float) BillingTransaction::query()
                    ->whereHas('booking', fn ($query) => $query->whereBelongsTo($team))
                    ->sum('amount_paid'), 2, '.', ''),
                'outstandingBalance' => number_format((float) BillingTransaction::query()
                    ->whereHas('booking', fn ($query) => $query->whereBelongsTo($team))
                    ->sum('balance'), 2, '.', ''),
                'inventoryAlerts' => $team->inventory()
                    ->whereIn('status', ['low_stock', 'out_of_stock'])
                    ->count(),
            ],
        ]);
    }
}
