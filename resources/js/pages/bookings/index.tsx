import { Form, Head, router, usePage } from '@inertiajs/react';
import { CalendarPlus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import BookingController from '@/actions/App/Http/Controllers/Bookings/BookingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/bookings';
import type { Team } from '@/types';

type Client = { id: number; name: string };
type Service = { id: number; name: string; hourly_rate: string };
type Booking = {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount: string;
    client: Client;
    billing_transaction?: { invoice_number: string; payment_status: string } | null;
};

type Props = {
    bookings: Booking[];
    clients: Client[];
    services: Service[];
    search: string;
};

type ServiceRow = { serviceId: string; hours: string };

export default function BookingsIndex({ bookings, clients, services, search: initialSearch }: Props) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const [rows, setRows] = useState<ServiceRow[]>([{ serviceId: '', hours: '1' }]);
    const [search, setSearch] = useState(initialSearch);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(index.url(currentTeam.slug), { search: search || undefined }, { preserveState: true, replace: true });
    };

    const addRow = () => setRows([...rows, { serviceId: '', hours: '1' }]);
    const removeRow = (indexToRemove: number) => setRows(rows.filter((_, index) => index !== indexToRemove));

    return (
        <>
            <Head title="Bookings" />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Bookings"
                    description="Schedule clients, calculate charges, and track invoices"
                />
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div className="space-y-3">
                        <form onSubmit={submitSearch} className="flex gap-2">
                            <Input aria-label="Search bookings" placeholder="Search by client or status..." value={search} onChange={(event) => setSearch(event.target.value)} />
                            <Button type="submit" variant="outline">Search</Button>
                        </form>
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                                <div>
                                    <p className="font-medium">{booking.client.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {booking.booking_date} · {booking.start_time} - {booking.end_time}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">${Number(booking.total_amount).toFixed(2)}</p>
                                    <p className="text-sm capitalize text-muted-foreground">{booking.status}</p>
                                    {booking.billing_transaction ? (
                                        <p className="text-xs text-muted-foreground">
                                            {booking.billing_transaction.invoice_number} · {booking.billing_transaction.payment_status}
                                        </p>
                                    ) : null}
                                    {booking.status === 'confirmed' ? (
                                        <div className="mt-3 flex justify-end gap-2">
                                            <Form
                                                {...BookingController.update.form({
                                                    current_team: currentTeam.slug,
                                                    booking: booking.id,
                                                })}
                                                options={{ preserveScroll: true }}
                                            >
                                                <input type="hidden" name="status" value="completed" />
                                                <Button type="submit" size="sm" variant="outline">
                                                    Complete
                                                </Button>
                                            </Form>
                                            <Form
                                                {...BookingController.update.form({
                                                    current_team: currentTeam.slug,
                                                    booking: booking.id,
                                                })}
                                                options={{ preserveScroll: true }}
                                            >
                                                <input type="hidden" name="status" value="cancelled" />
                                                <Button type="submit" size="sm" variant="destructive">
                                                    Cancel
                                                </Button>
                                            </Form>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                        {bookings.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                                No bookings yet. Create the first appointment from the form.
                            </div>
                        ) : null}
                    </div>

                    <Form
                        {...BookingController.store.form(currentTeam.slug)}
                        options={{ preserveScroll: true }}
                        className="space-y-4 rounded-lg border p-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="flex items-center gap-2">
                                    <CalendarPlus className="size-5" />
                                    <h2 className="font-medium">New booking</h2>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="booking-client">Client</Label>
                                    <select id="booking-client" name="client_id" required className="border-input bg-background h-9 rounded-md border px-3 text-sm">
                                        <option value="">Select a client</option>
                                        {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                                    </select>
                                    <InputError message={errors.client_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="booking-date">Date</Label>
                                    <input id="booking-date" name="booking_date" type="date" required className="border-input bg-background h-9 rounded-md border px-3 text-sm" />
                                    <InputError message={errors.booking_date} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="booking-start">Start</Label>
                                        <input id="booking-start" name="start_time" type="time" required className="border-input bg-background h-9 rounded-md border px-3 text-sm" />
                                        <InputError message={errors.start_time} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="booking-end">End</Label>
                                        <input id="booking-end" name="end_time" type="time" required className="border-input bg-background h-9 rounded-md border px-3 text-sm" />
                                        <InputError message={errors.end_time} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Services</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={addRow}><Plus /> Add</Button>
                                    </div>
                                    {rows.map((row, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-[minmax(0,1fr)_5rem_auto] gap-2">
                                            <select name={`services[${rowIndex}][service_id]`} required value={row.serviceId} onChange={(event) => setRows(rows.map((item, index) => index === rowIndex ? { ...item, serviceId: event.target.value } : item))} className="border-input bg-background h-9 rounded-md border px-2 text-sm">
                                                <option value="">Service</option>
                                                {services.map((service) => <option key={service.id} value={service.id}>{service.name} (${Number(service.hourly_rate).toFixed(2)}/hr)</option>)}
                                            </select>
                                            <input name={`services[${rowIndex}][hours_rendered]`} type="number" min="0.25" step="0.25" required value={row.hours} onChange={(event) => setRows(rows.map((item, index) => index === rowIndex ? { ...item, hours: event.target.value } : item))} className="border-input bg-background h-9 rounded-md border px-2 text-sm" aria-label="Hours" />
                                            <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1} onClick={() => removeRow(rowIndex)} aria-label="Remove service"><Trash2 /></Button>
                                        </div>
                                    ))}
                                    <InputError message={errors.services} />
                                </div>
                                <Button disabled={processing} className="w-full">{processing ? 'Creating...' : 'Confirm booking'}</Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

BookingsIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [{ title: 'Bookings', href: props.currentTeam ? index(props.currentTeam.slug) : '/' }],
});
