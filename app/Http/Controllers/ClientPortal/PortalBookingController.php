<?php

namespace App\Http\Controllers\ClientPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $client = $request->attributes->get('currentClient');

        $bookings = $client->bookings()
            ->with(['details.service', 'billingTransaction'])
            ->orderByDesc('booking_date')
            ->orderByDesc('start_time')
            ->get();

        return Inertia::render('client-portal/bookings', [
            'bookings' => $bookings,
        ]);
    }
}
