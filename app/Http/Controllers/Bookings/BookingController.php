<?php

namespace App\Http\Controllers\Bookings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Bookings\SaveBookingRequest;
use App\Http\Requests\Bookings\UpdateBookingRequest;
use App\Models\Booking;
use App\Models\Team;
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
        $search = trim((string) $request->query('search', ''));
        $bookings = $request->user()->currentTeam->bookings()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->whereHas('client', fn ($clientQuery) => $clientQuery->where('name', 'like', "%{$search}%"))
                    ->orWhere('status', 'like', "%{$search}%");
            }))
            ->with(['client', 'details.service', 'billingTransaction'])
            ->latest('booking_date')
            ->latest('start_time')
            ->take(100)
            ->get();

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
            'clients' => $request->user()->currentTeam->clients()->orderBy('name')->get(['id', 'name']),
            'services' => $request->user()->currentTeam->services()->where('status', 'active')->orderBy('name')->get(['id', 'name', 'hourly_rate']),
            'search' => $search,
        ]);
    }

    public function store(SaveBookingRequest $request): RedirectResponse
    {
        Gate::authorize('create', Booking::class);

        DB::transaction(function () use ($request): void {
            $team = $request->user()->currentTeam;
            /** @var array<int, array{service_id: int, hours_rendered: int|float|string}> $serviceItems */
            $serviceItems = $request->validated('services');
            $services = $team->services()->whereIn('id', collect($serviceItems)->pluck('service_id'))->get()->keyBy('id');
            $details = collect($serviceItems)->map(function (array $item) use ($services): array {
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

    public function update(UpdateBookingRequest $request, Team $currentTeam, Booking $booking): RedirectResponse
    {
        Gate::authorize('update', $booking);

        DB::transaction(function () use ($request, $booking): void {
            if ($request->has('client_id') && $request->has('services')) {
                $team = $request->user()->currentTeam;
                /** @var array<int, array{service_id: int, hours_rendered: int|float|string}> $serviceItems */
                $serviceItems = $request->validated('services');
                $services = $team->services()->whereIn('id', collect($serviceItems)->pluck('service_id'))->get()->keyBy('id');
                $details = collect($serviceItems)->map(function (array $item) use ($services): array {
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

                $payload = [
                    'client_id' => $request->validated('client_id'),
                    'booking_date' => $request->validated('booking_date'),
                    'start_time' => $request->validated('start_time'),
                    'end_time' => $request->validated('end_time'),
                    'total_amount' => $total,
                ];

                if ($request->filled('status')) {
                    $payload['status'] = $request->validated('status');
                }

                $booking->update($payload);

                $booking->details()->delete();
                $booking->details()->createMany($details->all());

                if ($booking->billingTransaction) {
                    $amountPaid = (float) $booking->billingTransaction->amount_paid;
                    $balance = max(0.0, round($total - $amountPaid, 2));
                    $paymentStatus = $balance === 0.0 && $total > 0
                        ? 'paid'
                        : ($amountPaid > 0 ? 'partial' : 'unpaid');

                    $booking->billingTransaction->update([
                        'total_amount' => $total,
                        'balance' => $balance,
                        'payment_status' => $paymentStatus,
                    ]);
                }
            } elseif ($request->has('status')) {
                $booking->update(['status' => $request->validated('status')]);
            }

            if ($request->validated('status') === Booking::STATUS_COMPLETED) {
                $booking->loadMissing(['details', 'client']);
                $team = $request->user()->currentTeam;

                foreach ($booking->details as $detail) {
                    $inventoryItems = $team->inventory()->where('service_id', $detail->service_id)->get();
                    foreach ($inventoryItems as $item) {
                        $item->adjustStock(
                            quantityChange: -1,
                            type: 'booking_deduction',
                            reason: "Auto-deducted for completed Booking #{$booking->id} ({$booking->client->name})",
                            bookingId: $booking->id,
                            userId: $request->user()->id
                        );
                    }
                }
            }
        });

        return to_route('bookings.index', ['current_team' => $request->user()->currentTeam]);
    }
}
