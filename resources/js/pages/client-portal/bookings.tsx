import { Head, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type Service = { id: number; name: string; hourly_rate: string };
type BookingDetail = {
    id: number;
    service_id: number;
    hours_rendered: string;
    hourly_rate: string;
    subtotal: string;
    service?: Service;
};
type Booking = {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount: string;
    details?: BookingDetail[];
    billing_transaction?: {
        invoice_number: string;
        payment_status: string;
    } | null;
};

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'confirmed':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-700 capitalize dark:text-blue-400"
                >
                    <CheckCircle2 className="size-3" />
                    Confirmed
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 capitalize dark:text-emerald-400"
                >
                    <CheckCircle2 className="size-3" />
                    Completed
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-red-500/30 bg-red-500/10 text-red-700 capitalize dark:text-red-400"
                >
                    <XCircle className="size-3" />
                    Cancelled
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function ClientBookings() {
    const { bookings } = usePage<{ bookings: Booking[] }>().props;

    return (
        <ClientPortalLayout>
            <Head title="My Bookings" />

            <Heading
                variant="small"
                title="My Bookings"
                description="View all your scheduled and completed construction services"
            />

            {bookings.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
                    <CalendarDays className="mx-auto size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                        No bookings yet. Your contractor will schedule services
                        here.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="rounded-xl border bg-card p-5 shadow-xs transition hover:shadow-md"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={booking.status} />
                                        <span className="text-xs text-muted-foreground">
                                            #{booking.id}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarDays className="size-3.5" />
                                        <span>
                                            {new Date(
                                                booking.booking_date,
                                            ).toLocaleDateString('en-PH', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        <span className="text-muted-foreground/40">
                                            |
                                        </span>
                                        <Clock className="size-3.5" />
                                        <span>
                                            {booking.start_time.slice(0, 5)} –{' '}
                                            {booking.end_time.slice(0, 5)}
                                        </span>
                                    </div>

                                    {booking.details &&
                                    booking.details.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {booking.details.map((d) => (
                                                <span
                                                    key={d.id}
                                                    className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs"
                                                >
                                                    {d.service?.name ??
                                                        'Service'}
                                                    <span className="ml-1.5 text-muted-foreground">
                                                        {d.hours_rendered}h × ₱
                                                        {Number(
                                                            d.hourly_rate,
                                                        ).toFixed(0)}
                                                        /hr
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="text-right">
                                    <p className="text-xl font-bold">
                                        ₱
                                        {Number(booking.total_amount).toFixed(
                                            2,
                                        )}
                                    </p>
                                    {booking.billing_transaction ? (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {
                                                booking.billing_transaction
                                                    .invoice_number
                                            }
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ClientPortalLayout>
    );
}

ClientBookings.layout = {
    breadcrumbs: [{ title: 'My Bookings', href: '/client-portal/bookings' }],
};

export default ClientBookings;
