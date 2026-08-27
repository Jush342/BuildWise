<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingDetail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam;
        $range = $request->query('range', 'this_month');
        [$startDate, $endDate] = $this->resolveDateRange($range, $request->query('start_date'), $request->query('end_date'));

        $clientId = $request->query('client_id');
        $clients = $team->clients()->orderBy('name')->get(['id', 'name']);

        $bookingsQuery = $team->bookings()
            ->when($startDate, fn ($query) => $query->whereDate('booking_date', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('booking_date', '<=', $endDate))
            ->when($clientId, fn ($query) => $query->where('client_id', $clientId));

        $bookings = (clone $bookingsQuery)
            ->with(['client:id,name', 'billingTransaction.payments', 'details.service:id,name'])
            ->latest('booking_date')
            ->get();

        $totalInvoiced = (float) $bookings->sum('total_amount');
        $totalCollected = (float) $bookings->sum(fn (Booking $booking) => (float) data_get($booking->billingTransaction, 'amount_paid', 0));
        $totalOutstanding = max(0.0, round($totalInvoiced - $totalCollected, 2));

        $bookingCounts = [
            'total' => $bookings->count(),
            'confirmed' => $bookings->where('status', Booking::STATUS_CONFIRMED)->count(),
            'completed' => $bookings->where('status', Booking::STATUS_COMPLETED)->count(),
            'cancelled' => $bookings->where('status', Booking::STATUS_CANCELLED)->count(),
        ];

        $servicePerformance = $this->buildServicePerformance($bookings);

        // Transaction ledger items
        $transactions = $bookings->map(function (Booking $booking): array {
            return [
                'id' => $booking->id,
                'date' => $booking->booking_date->format('Y-m-d'),
                'invoice_number' => data_get($booking->billingTransaction, 'invoice_number', "INV-{$booking->id}"),
                'client_name' => $booking->client->name,
                'services' => $booking->details->map(fn (BookingDetail $detail) => $detail->service->name)->filter()->implode(', '),
                'status' => $booking->status,
                'payment_status' => data_get($booking->billingTransaction, 'payment_status', 'unpaid'),
                'total_amount' => (float) $booking->total_amount,
                'amount_paid' => (float) data_get($booking->billingTransaction, 'amount_paid', 0),
                'balance' => (float) data_get($booking->billingTransaction, 'balance', $booking->total_amount),
            ];
        });

        return Inertia::render('reports/index', [
            'summary' => [
                'totalInvoiced' => $totalInvoiced,
                'totalCollected' => $totalCollected,
                'totalOutstanding' => $totalOutstanding,
                'bookings' => $bookingCounts,
            ],
            'servicePerformance' => $servicePerformance,
            'transactions' => $transactions,
            'filters' => [
                'range' => $range,
                'startDate' => $startDate ? $startDate->format('Y-m-d') : null,
                'endDate' => $endDate ? $endDate->format('Y-m-d') : null,
                'clientId' => $clientId ? (int) $clientId : null,
            ],
            'clients' => $clients,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $team = $request->user()->currentTeam;
        $range = $request->query('range', 'this_month');
        [$startDate, $endDate] = $this->resolveDateRange($range, $request->query('start_date'), $request->query('end_date'));

        $clientId = $request->query('client_id');

        $bookings = $team->bookings()
            ->when($startDate, fn ($query) => $query->whereDate('booking_date', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('booking_date', '<=', $endDate))
            ->when($clientId, fn ($query) => $query->where('client_id', $clientId))
            ->with(['client:id,name', 'billingTransaction', 'details.service:id,name'])
            ->latest('booking_date')
            ->get();

        $filename = 'buildwise-report-'.$team->slug.'-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($bookings): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            fputcsv($handle, [
                'Booking Date',
                'Invoice #',
                'Client Name',
                'Services Rendered',
                'Job Status',
                'Payment Status',
                'Total Invoiced (PHP)',
                'Amount Paid (PHP)',
                'Balance (PHP)',
            ]);

            foreach ($bookings as $booking) {
                fputcsv($handle, [
                    $booking->booking_date->format('Y-m-d'),
                    data_get($booking->billingTransaction, 'invoice_number', "INV-{$booking->id}"),
                    $booking->client->name,
                    $booking->details->map(fn (BookingDetail $detail) => $detail->service->name)->filter()->implode(', '),
                    $booking->status,
                    data_get($booking->billingTransaction, 'payment_status', 'unpaid'),
                    number_format((float) $booking->total_amount, 2, '.', ''),
                    number_format((float) data_get($booking->billingTransaction, 'amount_paid', 0), 2, '.', ''),
                    number_format((float) data_get($booking->billingTransaction, 'balance', $booking->total_amount), 2, '.', ''),
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    private function resolveDateRange(string $range, ?string $customStart, ?string $customEnd): array
    {
        return match ($range) {
            'today' => [Carbon::now()->startOfDay(), Carbon::now()->endOfDay()],
            'this_month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'last_month' => [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()],
            'last_30_days' => [Carbon::now()->subDays(30)->startOfDay(), Carbon::now()->endOfDay()],
            'this_year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'all' => [null, null],
            'custom' => [
                $customStart ? Carbon::parse($customStart)->startOfDay() : null,
                $customEnd ? Carbon::parse($customEnd)->endOfDay() : null,
            ],
            default => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
        };
    }

    /**
     * @param  Collection<int, Booking>  $bookings
     * @return array<int, array{service_id: int, service_name: string, count: int, total_hours: float, total_revenue: float}>
     */
    private function buildServicePerformance(Collection $bookings): array
    {
        $performance = [];

        foreach ($bookings as $booking) {
            foreach ($booking->details as $detail) {
                $serviceId = $detail->service_id;

                if (! isset($performance[$serviceId])) {
                    $performance[$serviceId] = [
                        'service_id' => $serviceId,
                        'service_name' => $detail->service->name ?? 'Unknown Service',
                        'count' => 0,
                        'total_hours' => 0.0,
                        'total_revenue' => 0.0,
                    ];
                }

                $performance[$serviceId]['count']++;
                $performance[$serviceId]['total_hours'] += (float) $detail->hours_rendered;
                $performance[$serviceId]['total_revenue'] += (float) $detail->subtotal;
            }
        }

        $performance = array_values($performance);
        usort($performance, fn (array $left, array $right): int => $right['total_revenue'] <=> $left['total_revenue']);

        return $performance;
    }
}
