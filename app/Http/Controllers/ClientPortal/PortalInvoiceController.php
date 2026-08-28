<?php

namespace App\Http\Controllers\ClientPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalInvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $client = $request->attributes->get('currentClient');

        $invoices = $client->bookings()
            ->with('billingTransaction')
            ->whereHas('billingTransaction')
            ->orderByDesc('booking_date')
            ->get()
            ->pluck('billingTransaction')
            ->filter()
            ->values();

        return Inertia::render('client-portal/invoices', [
            'invoices' => $invoices,
        ]);
    }
}
