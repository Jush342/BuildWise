import { Form, Head, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    List,
    Pencil,
    Plus,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import BookingController from '@/actions/App/Http/Controllers/Bookings/BookingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/bookings';
import type { Team } from '@/types';

type Client = { id: number; name: string };
type Service = { id: number; name: string; hourly_rate: string };
type BookingDetail = {
    id: number;
    booking_id: number;
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
    status: 'confirmed' | 'completed' | 'cancelled' | string;
    total_amount: string;
    client_id: number;
    client: Client;
    details?: BookingDetail[];
    billing_transaction?: {
        invoice_number: string;
        payment_status: string;
    } | null;
};

type Props = {
    bookings: Booking[];
    clients: Client[];
    services: Service[];
    search: string;
};

function toDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getMonday(d: Date): Date {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);

    return new Date(date.getFullYear(), date.getMonth(), diff);
}

function addDays(d: Date, days: number): Date {
    const res = new Date(d);
    res.setDate(res.getDate() + days);

    return res;
}

export default function BookingsIndex({
    bookings,
    clients,
    services,
    search: initialSearch,
}: Props) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() =>
        getMonday(new Date()),
    );
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [prefilledDate, setPrefilledDate] = useState<string>('');
    const [formOpen, setFormOpen] = useState(false);
    const [search, setSearch] = useState(initialSearch);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            index.url(currentTeam.slug),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    const nextWeek = () => setCurrentWeekMonday(addDays(currentWeekMonday, 7));
    const prevWeek = () => setCurrentWeekMonday(addDays(currentWeekMonday, -7));
    const goToToday = () => setCurrentWeekMonday(getMonday(new Date()));

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) =>
            addDays(currentWeekMonday, i),
        );
    }, [currentWeekMonday]);

    const weekRangeLabel = useMemo(() => {
        const start = weekDays[0];
        const end = weekDays[6];
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };
        const startStr = start.toLocaleDateString(undefined, options);
        const endStr = end.toLocaleDateString(undefined, {
            ...options,
            year: 'numeric',
        });

        return `${startStr} – ${endStr}`;
    }, [weekDays]);

    const todayStr = toDateString(new Date());

    const handleSelectSlot = (dateStr: string) => {
        setEditingBooking(null);
        setPrefilledDate(dateStr);
        setFormOpen(true);
    };

    const handleEditBooking = (booking: Booking) => {
        setEditingBooking(booking);
        setPrefilledDate('');
        setFormOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingBooking(null);
        setPrefilledDate('');
        setFormOpen(false);
    };

    const handleAddBooking = () => {
        setEditingBooking(null);
        setPrefilledDate('');
        setFormOpen(true);
    };

    return (
        <>
            <Head title="Bookings & Calendar" />
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Bookings & Schedule"
                        description="Schedule appointments, detect conflicts, manage multi-service line items, and track invoices"
                    />
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
                            <Button
                                size="sm"
                                variant={
                                    viewMode === 'calendar'
                                        ? 'default'
                                        : 'ghost'
                                }
                                className="h-8 gap-1.5 px-3 text-xs font-medium"
                                onClick={() => setViewMode('calendar')}
                            >
                                <Calendar className="size-3.5" />
                                Weekly Calendar
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    viewMode === 'list' ? 'default' : 'ghost'
                                }
                                className="h-8 gap-1.5 px-3 text-xs font-medium"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="size-3.5" />
                                List View
                            </Button>
                        </div>
                        <Button onClick={handleAddBooking}>
                            <Plus /> Add booking
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Search Bar */}
                    <form onSubmit={submitSearch} className="flex gap-2">
                        <Input
                            aria-label="Search bookings"
                            placeholder="Search by client or status..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="min-w-0 flex-1"
                        />
                        <Button type="submit" variant="outline">
                            Search
                        </Button>
                    </form>

                    {/* Weekly Calendar View */}
                    {viewMode === 'calendar' ? (
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            {/* Calendar Navigation Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        onClick={prevWeek}
                                        aria-label="Previous week"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs font-medium"
                                        onClick={goToToday}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="size-8"
                                        onClick={nextWeek}
                                        aria-label="Next week"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                    <span className="ml-2 text-sm font-semibold sm:text-base">
                                        {weekRangeLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <span className="size-2.5 rounded-full bg-blue-500" />
                                        Confirmed
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="size-2.5 rounded-full bg-emerald-500" />
                                        Completed
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="size-2.5 rounded-full bg-zinc-400" />
                                        Cancelled
                                    </span>
                                </div>
                            </div>

                            {/* 7-Day Columns Grid */}
                            <div className="grid min-h-[500px] grid-cols-1 divide-y md:grid-cols-7 md:divide-x md:divide-y-0">
                                {weekDays.map((day) => {
                                    const dayStr = toDateString(day);
                                    const isToday = dayStr === todayStr;
                                    const dayBookings = bookings
                                        .filter(
                                            (b) =>
                                                b.booking_date.slice(0, 10) ===
                                                dayStr,
                                        )
                                        .sort((a, b) =>
                                            a.start_time.localeCompare(
                                                b.start_time,
                                            ),
                                        );

                                    return (
                                        <div
                                            key={dayStr}
                                            className={`flex flex-col p-2.5 ${
                                                isToday
                                                    ? 'bg-primary/5 dark:bg-primary/10'
                                                    : ''
                                            }`}
                                        >
                                            {/* Day Header */}
                                            <div className="mb-2.5 flex items-center justify-between border-b pb-2">
                                                <div>
                                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        {day.toLocaleDateString(
                                                            undefined,
                                                            {
                                                                weekday:
                                                                    'short',
                                                            },
                                                        )}
                                                    </p>
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            isToday
                                                                ? 'text-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        {day.getDate()}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 text-muted-foreground hover:text-foreground"
                                                    title={`Add booking on ${dayStr}`}
                                                    onClick={() =>
                                                        handleSelectSlot(dayStr)
                                                    }
                                                >
                                                    <Plus className="size-3.5" />
                                                </Button>
                                            </div>

                                            {/* Day Bookings List */}
                                            <div className="flex-1 space-y-2">
                                                {dayBookings.map((b) => (
                                                    <BookingCard
                                                        key={b.id}
                                                        booking={b}
                                                        currentTeamSlug={
                                                            currentTeam.slug
                                                        }
                                                        isEditing={
                                                            editingBooking?.id ===
                                                            b.id
                                                        }
                                                        onEdit={() =>
                                                            handleEditBooking(b)
                                                        }
                                                    />
                                                ))}
                                                {dayBookings.length === 0 ? (
                                                    <div
                                                        onClick={() =>
                                                            handleSelectSlot(
                                                                dayStr,
                                                            )
                                                        }
                                                        className="flex h-24 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted/50 p-2 text-center text-xs text-muted-foreground/60 transition-colors hover:border-primary/40 hover:bg-muted/20 hover:text-foreground"
                                                    >
                                                        + Add booking
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-3">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-lg border bg-card p-4"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-semibold">
                                                    {booking.client.name}
                                                </p>
                                                <StatusBadge
                                                    status={booking.status}
                                                />
                                            </div>
                                            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <CalendarDays className="size-3.5" />
                                                {booking.booking_date.slice(
                                                    0,
                                                    10,
                                                )}
                                                <span className="mx-1">·</span>
                                                <Clock className="size-3.5" />
                                                {booking.start_time.slice(
                                                    0,
                                                    5,
                                                )}{' '}
                                                - {booking.end_time.slice(0, 5)}
                                            </p>
                                            {booking.details &&
                                            booking.details.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {booking.details.map(
                                                        (d) => (
                                                            <span
                                                                key={d.id}
                                                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                                                            >
                                                                {d.service
                                                                    ?.name ??
                                                                    'Service'}
                                                                :{' '}
                                                                {
                                                                    d.hours_rendered
                                                                }
                                                                h @ ₱
                                                                {Number(
                                                                    d.hourly_rate,
                                                                ).toFixed(2)}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="space-y-1 text-right">
                                            <p className="text-lg font-bold">
                                                ₱
                                                {Number(
                                                    booking.total_amount,
                                                ).toFixed(2)}
                                            </p>
                                            {booking.billing_transaction ? (
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        booking
                                                            .billing_transaction
                                                            .invoice_number
                                                    }{' '}
                                                    ·{' '}
                                                    <span className="font-medium capitalize">
                                                        {
                                                            booking
                                                                .billing_transaction
                                                                .payment_status
                                                        }
                                                    </span>
                                                </p>
                                            ) : null}

                                            <div className="mt-3 flex flex-wrap justify-end gap-2">
                                                {booking.status ===
                                                'confirmed' ? (
                                                    <>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleEditBooking(
                                                                    booking,
                                                                )
                                                            }
                                                            className="gap-1 text-xs"
                                                        >
                                                            <Pencil className="size-3" />
                                                            Edit
                                                        </Button>

                                                        <StatusForm
                                                            currentTeamSlug={
                                                                currentTeam.slug
                                                            }
                                                            bookingId={
                                                                booking.id
                                                            }
                                                            status="completed"
                                                            buttonText="Complete"
                                                            variant="outline"
                                                        />
                                                        <StatusForm
                                                            currentTeamSlug={
                                                                currentTeam.slug
                                                            }
                                                            bookingId={
                                                                booking.id
                                                            }
                                                            status="cancelled"
                                                            buttonText="Cancel"
                                                            variant="destructive"
                                                        />
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Status locked (
                                                        {booking.status})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {bookings.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                                    No bookings match your search. Create an
                                    appointment from the form.
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Form Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBooking
                                ? 'Edit & Reschedule'
                                : 'New Booking'}
                        </DialogTitle>
                    </DialogHeader>
                    <BookingForm
                        key={
                            editingBooking
                                ? `edit-${editingBooking.id}`
                                : `create-${prefilledDate}`
                        }
                        editingBooking={editingBooking}
                        prefilledDate={prefilledDate}
                        clients={clients}
                        services={services}
                        onCancelEdit={handleCancelEdit}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'confirmed':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 text-blue-700 capitalize dark:text-blue-400"
                >
                    Confirmed
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 capitalize dark:text-emerald-400"
                >
                    Completed
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-700 capitalize dark:text-red-400"
                >
                    Cancelled
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function BookingCard({
    booking,
    currentTeamSlug,
    isEditing,
    onEdit,
}: {
    booking: Booking;
    currentTeamSlug: string;
    isEditing: boolean;
    onEdit: () => void;
}) {
    const isConfirmed = booking.status === 'confirmed';

    return (
        <div
            className={`group relative rounded-lg border p-2.5 text-xs shadow-xs transition-all ${
                isEditing
                    ? 'border-primary bg-primary/10 ring-2 ring-primary'
                    : isConfirmed
                      ? 'border-blue-500/30 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
                      : booking.status === 'completed'
                        ? 'border-emerald-500/30 bg-emerald-50/40 hover:border-emerald-500 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30'
                        : 'border-zinc-200 bg-zinc-50 opacity-70 hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-900/50'
            }`}
        >
            <div className="flex items-start justify-between gap-1.5">
                <p className="truncate font-semibold text-foreground">
                    {booking.client.name}
                </p>
                <span className="shrink-0 font-bold text-foreground">
                    ₱{Number(booking.total_amount).toFixed(0)}
                </span>
            </div>

            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3 shrink-0" />
                {booking.start_time.slice(0, 5)} -{' '}
                {booking.end_time.slice(0, 5)}
            </p>

            {booking.details && booking.details.length > 0 ? (
                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                    {booking.details
                        .map((d) => d.service?.name ?? 'Service')
                        .join(', ')}
                </p>
            ) : null}

            <div className="mt-2 flex items-center justify-between border-t border-muted/60 pt-1">
                <span className="text-[10px] font-medium text-muted-foreground capitalize">
                    {booking.status}
                </span>

                {isConfirmed ? (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground hover:text-primary"
                            title="Edit / Reschedule"
                            onClick={onEdit}
                        >
                            <Pencil className="size-3" />
                        </Button>
                        <StatusForm
                            currentTeamSlug={currentTeamSlug}
                            bookingId={booking.id}
                            status="completed"
                            buttonText=""
                            icon={
                                <CheckCircle2 className="size-3 text-emerald-600" />
                            }
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:bg-emerald-500/10"
                            title="Mark completed"
                        />
                        <StatusForm
                            currentTeamSlug={currentTeamSlug}
                            bookingId={booking.id}
                            status="cancelled"
                            buttonText=""
                            icon={
                                <XCircle className="size-3 text-destructive" />
                            }
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:bg-destructive/10"
                            title="Cancel booking"
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function StatusForm({
    currentTeamSlug,
    bookingId,
    status,
    buttonText,
    icon,
    variant = 'outline',
    size = 'sm',
    className = '',
    title = '',
}: {
    currentTeamSlug: string;
    bookingId: number;
    status: 'completed' | 'cancelled';
    buttonText?: string;
    icon?: React.ReactNode;
    variant?: 'outline' | 'destructive' | 'ghost';
    size?: 'sm' | 'icon';
    className?: string;
    title?: string;
}) {
    return (
        <Form
            {...BookingController.update.form({
                current_team: currentTeamSlug,
                booking: bookingId,
            })}
            options={{ preserveScroll: true }}
        >
            <input type="hidden" name="status" value={status} />
            <Button
                type="submit"
                size={size}
                variant={variant}
                className={className}
                title={title || buttonText}
            >
                {icon}
                {buttonText ? buttonText : null}
            </Button>
        </Form>
    );
}

function BookingForm({
    editingBooking,
    prefilledDate,
    clients,
    services,
    onCancelEdit,
}: {
    editingBooking: Booking | null;
    prefilledDate: string;
    clients: Client[];
    services: Service[];
    onCancelEdit: () => void;
}) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;

    const initialServiceIds: string[] = useMemo(() => {
        if (editingBooking?.details && editingBooking.details.length > 0) {
            return editingBooking.details.map((d) => String(d.service_id));
        }

        return [''];
    }, [editingBooking]);

    const [selectedServices, setSelectedServices] =
        useState<string[]>(initialServiceIds);
    const [startTime, setStartTime] = useState(
        editingBooking ? editingBooking.start_time.slice(0, 5) : '09:00',
    );
    const [endTime, setEndTime] = useState(
        editingBooking ? editingBooking.end_time.slice(0, 5) : '12:00',
    );

    const formConfig = editingBooking
        ? BookingController.update.form({
              current_team: currentTeam.slug,
              booking: editingBooking.id,
          })
        : BookingController.store.form(currentTeam.slug);

    const addService = () => setSelectedServices([...selectedServices, '']);
    const removeService = (index: number) =>
        setSelectedServices(selectedServices.filter((_, i) => i !== index));

    const updateService = (index: number, value: string) =>
        setSelectedServices(
            selectedServices.map((s, i) => (i === index ? value : s)),
        );

    // Auto-calculate duration from start/end time
    const durationHours = useMemo(() => {
        if (!startTime || !endTime) {
            return 0;
        }

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const totalMinutes = endH * 60 + endM - (startH * 60 + startM);

        return totalMinutes > 0 ? totalMinutes / 60 : 0;
    }, [startTime, endTime]);

    const durationLabel = useMemo(() => {
        if (durationHours <= 0) {
            return '';
        }

        const h = Math.floor(durationHours);
        const m = Math.round((durationHours - h) * 60);

        if (h > 0 && m > 0) {
            return `${h}h ${m}m`;
        }

        if (h > 0) {
            return `${h}h`;
        }

        return `${m}m`;
    }, [durationHours]);

    // Calculate total: duration × sum of selected service rates
    const liveTotal = useMemo(() => {
        if (durationHours <= 0) {
            return 0;
        }

        let rateSum = 0;

        for (const serviceId of selectedServices) {
            const s = services.find((srv) => String(srv.id) === serviceId);

            if (s) {
                rateSum += parseFloat(s.hourly_rate);
            }
        }

        return rateSum * durationHours;
    }, [selectedServices, services, durationHours]);

    const defaultDate = editingBooking
        ? editingBooking.booking_date.slice(0, 10)
        : prefilledDate || '';

    return (
        <Form
            {...formConfig}
            options={{ preserveScroll: true }}
            className="space-y-4"
            onSuccess={() => onCancelEdit()}
        >
            {({ errors, processing }) => (
                <>
                    {editingBooking ? (
                        <p className="text-xs text-muted-foreground">
                            Rescheduling will adjust the calendar schedule and
                            recalculate invoice balances.
                        </p>
                    ) : null}

                    <div className="grid gap-2">
                        <Label htmlFor="booking-client">Client</Label>
                        <select
                            id="booking-client"
                            name="client_id"
                            required
                            defaultValue={editingBooking?.client_id ?? ''}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">Select a client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.client_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="booking-date">Date</Label>
                        <input
                            id="booking-date"
                            name="booking_date"
                            type="date"
                            required
                            defaultValue={defaultDate}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        />
                        <InputError message={errors.booking_date} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="booking-start">Start Time</Label>
                            <input
                                id="booking-start"
                                name="start_time"
                                type="time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            />
                            <InputError message={errors.start_time} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="booking-end">End Time</Label>
                            <input
                                id="booking-end"
                                name="end_time"
                                type="time"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            />
                            <InputError message={errors.end_time} />
                        </div>
                    </div>

                    {/* Duration indicator */}
                    {durationHours > 0 && (
                        <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                            <Clock className="size-3.5" />
                            Duration: {durationLabel}
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Services</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addService}
                                className="h-7 text-xs"
                            >
                                <Plus className="size-3" /> Add service
                            </Button>
                        </div>
                        {selectedServices.map((serviceId, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="hidden"
                                    name={`services[${rowIndex}][hours_rendered]`}
                                    value={
                                        durationHours > 0
                                            ? String(durationHours)
                                            : ''
                                    }
                                />
                                <select
                                    name={`services[${rowIndex}][service_id]`}
                                    required
                                    value={serviceId}
                                    onChange={(e) =>
                                        updateService(rowIndex, e.target.value)
                                    }
                                    className="h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                                >
                                    <option value="">Select service</option>
                                    {services.map((service) => (
                                        <option
                                            key={service.id}
                                            value={service.id}
                                        >
                                            {service.name} (₱
                                            {Number(
                                                service.hourly_rate,
                                            ).toFixed(2)}
                                            /hr)
                                        </option>
                                    ))}
                                </select>
                                {serviceId && durationHours > 0 ? (
                                    <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                                        ₱
                                        {(
                                            parseFloat(
                                                services.find(
                                                    (s) =>
                                                        String(s.id) ===
                                                        serviceId,
                                                )?.hourly_rate ?? '0',
                                            ) * durationHours
                                        ).toFixed(2)}
                                    </span>
                                ) : null}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={selectedServices.length === 1}
                                    onClick={() => removeService(rowIndex)}
                                    aria-label="Remove service"
                                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                        <InputError message={errors.services} />
                    </div>

                    {/* Total Card */}
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-muted-foreground">
                                {durationHours > 0
                                    ? `${durationLabel} × ${selectedServices.filter(Boolean).length} service(s)`
                                    : 'Calculated Total'}
                            </span>
                            <span className="text-base font-bold text-foreground">
                                ₱{liveTotal.toFixed(2)}
                            </span>
                        </div>
                        {durationHours > 0 &&
                        selectedServices.filter(Boolean).length > 1 ? (
                            <div className="space-y-1 text-xs text-muted-foreground">
                                {selectedServices.filter(Boolean).map((sid) => {
                                    const s = services.find(
                                        (srv) => String(srv.id) === sid,
                                    );

                                    if (!s) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={sid}
                                            className="flex justify-between"
                                        >
                                            <span>
                                                {s.name} × {durationLabel}
                                            </span>
                                            <span>
                                                ₱
                                                {(
                                                    parseFloat(s.hourly_rate) *
                                                    durationHours
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onCancelEdit}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing} className="flex-1">
                            {processing
                                ? editingBooking
                                    ? 'Updating...'
                                    : 'Creating...'
                                : editingBooking
                                  ? 'Update & Reschedule'
                                  : 'Confirm Booking'}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

BookingsIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Bookings & Schedule',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});
