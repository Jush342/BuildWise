import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ServiceController from '@/actions/App/Http/Controllers/Services/ServiceController';
import { destroy } from '@/routes/services';
import type { Team } from '@/types';

type Service = {
    id: number;
    name: string;
    hourly_rate: string;
    status: 'active' | 'inactive';
};

type Props = {
    services: Service[];
};

export default function ServicesIndex({ services }: Props) {
    const [editingService, setEditingService] = useState<Service | null>(null);
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;

    return (
        <>
            <Head title="Services" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Services & rates"
                        description="Set the services and hourly rates used by bookings"
                    />
                    <Button onClick={() => setEditingService(null)}>
                        <Plus /> Add service
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="overflow-hidden rounded-lg border">
                        <div className="grid grid-cols-[1fr_8rem_7rem_auto] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
                            <span>Service</span>
                            <span>Hourly rate</span>
                            <span>Status</span>
                            <span className="sr-only">Actions</span>
                        </div>
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="grid grid-cols-[1fr_8rem_7rem_auto] items-center gap-4 border-b px-4 py-4 last:border-b-0"
                            >
                                <span className="font-medium">{service.name}</span>
                                <span>${Number(service.hourly_rate).toFixed(2)}</span>
                                <span className="text-sm capitalize text-muted-foreground">
                                    {service.status}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Edit ${service.name}`}
                                        onClick={() => setEditingService(service)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Link
                                        href={destroy({ current_team: currentTeam.slug, service: service.id })}
                                        method="delete"
                                        as="button"
                                        aria-label={`Delete ${service.name}`}
                                        className="inline-flex size-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {services.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No services yet. Add the work your company provides.
                            </p>
                        ) : null}
                    </div>

                    <ServiceForm service={editingService} />
                </div>
            </div>
        </>
    );
}

function ServiceForm({ service }: { service: Service | null }) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const form = service
        ? ServiceController.update.form({ current_team: currentTeam.slug, service: service.id })
        : ServiceController.store.form(currentTeam.slug);

    return (
        <Form {...form} options={{ preserveScroll: true }} className="space-y-4 rounded-lg border p-5">
            {({ errors, processing }) => (
                <>
                    <h2 className="font-medium">{service ? 'Edit service' : 'New service'}</h2>
                    <div className="grid gap-2">
                        <Label htmlFor="service-name">Service name</Label>
                        <Input id="service-name" name="name" defaultValue={service?.name ?? ''} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="service-rate">Hourly rate</Label>
                        <Input id="service-rate" name="hourly_rate" type="number" min="0" step="0.01" defaultValue={service?.hourly_rate ?? ''} required />
                        <InputError message={errors.hourly_rate} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="service-status">Status</Label>
                        <select id="service-status" name="status" defaultValue={service?.status ?? 'active'} className="border-input bg-background h-9 rounded-md border px-3 text-sm">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>
                    <Button disabled={processing} className="w-full">
                        {processing ? 'Saving...' : service ? 'Update service' : 'Save service'}
                    </Button>
                </>
            )}
        </Form>
    );
}

ServicesIndex.layout = {
    breadcrumbs: [{ title: 'Services & rates', href: '/' }],
};
