<?php

namespace App\Http\Controllers\Bookings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bookings\SaveBookingRequest;
use App\Models\Booking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Booking::class);

        return Inertia::render('bookings/index', [
            'bookings' => $request->user()->currentTeam->bookings()
                ->with(['client', 'details.service', 'billingTransaction'])
                ->latest('booking_date')
                ->latest('start_time')
                ->get(),
            'clients' => $request->user()->currentTeam->clients()->orderBy('name')->get(['id', 'name']),
            'services' => $request->user()->currentTeam->services()->where('status', 'active')->orderBy('name')->get(['id', 'name', 'hourly_rate']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaveBookingRequest $request): RedirectResponse
    {
        Gate::authorize('create', Booking::class);

        DB::transaction(function () use ($request): void {
            $team = $request->user()->currentTeam;
            $services = $team->services()->whereIn('id', collect($request->validated('services'))->pluck('service_id'))->get()->keyBy('id');
            $details = collect($request->validated('services'))->map(function (array $item) use ($services): array {
                $service = $services->get($item['service_id']);
                $hours = (float) $item['hours_rendered'];
                $rate = (float) $service->hourly_rate;

                return [
                    'service_id' => $service->id,
                    'hours_rendered' => $hours,
                    'hourly_rate' => $rate,
                    'subtotal' => round($hours * $rate, 2),
                ];
            });
            $total = $details->sum('subtotal');
            $booking = $team->bookings()->create([
                'client_id' => $request->validated('client_id'),
                'booking_date' => $request->validated('booking_date'),
                'start_time' => $request->validated('start_time'),
                'end_time' => $request->validated('end_time'),
                'total_amount' => $total,
            ]);
            $booking->details()->createMany($details->all());
            $booking->billingTransaction()->create([
                'invoice_number' => 'INV-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
                'total_amount' => $total,
                'balance' => $total,
            ]);
        });

        return to_route('bookings.index', ['current_team' => $request->user()->currentTeam]);
    }
}
