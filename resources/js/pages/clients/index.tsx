import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ClientController from '@/actions/App/Http/Controllers/Clients/ClientController';
import { destroy, index, store, update } from '@/routes/clients';
import type { Team } from '@/types';

type Client = {
    id: number;
    name: string;
    contact: string | null;
    email: string | null;
    address: string | null;
};

type Props = {
    clients: Client[];
};

export default function ClientsIndex({ clients }: Props) {
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;

    return (
        <>
            <Head title="Clients" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Clients"
                        description="Manage customers for your construction services"
                    />
                    <Button onClick={() => setEditingClient(null)}>
                        <Plus /> Add client
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="overflow-hidden rounded-lg border">
                        <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
                            <span>Name</span>
                            <span>Contact</span>
                            <span>Email</span>
                            <span className="sr-only">Actions</span>
                        </div>
                        {clients.map((client) => (
                            <div
                                key={client.id}
                                className="grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-4 border-b px-4 py-4 last:border-b-0"
                            >
                                <div>
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {client.address || 'No address'}
                                    </p>
                                </div>
                                <span className="text-sm">{client.contact || '-'}</span>
                                <span className="truncate text-sm">{client.email || '-'}</span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Edit ${client.name}`}
                                        onClick={() => setEditingClient(client)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Link
                                        href={destroy({ current_team: currentTeam.slug, client: client.id })}
                                        method="delete"
                                        as="button"
                                        aria-label={`Delete ${client.name}`}
                                        className="inline-flex size-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {clients.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No clients yet. Add your first construction client.
                            </p>
                        ) : null}
                    </div>

                    <ClientForm client={editingClient} />
                </div>
            </div>
        </>
    );
}

function ClientForm({ client }: { client: Client | null }) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const form = client
        ? ClientController.update.form({ current_team: currentTeam.slug, client: client.id })
        : ClientController.store.form(currentTeam.slug);

    return (
        <Form {...form} options={{ preserveScroll: true }} className="space-y-4 rounded-lg border p-5">
            {({ errors, processing }) => (
                <>
                    <h2 className="font-medium">{client ? 'Edit client' : 'New client'}</h2>
                    <div className="grid gap-2">
                        <Label htmlFor="client-name">Name</Label>
                        <Input id="client-name" name="name" defaultValue={client?.name ?? ''} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client-contact">Contact</Label>
                        <Input id="client-contact" name="contact" defaultValue={client?.contact ?? ''} />
                        <InputError message={errors.contact} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client-email">Email</Label>
                        <Input id="client-email" name="email" type="email" defaultValue={client?.email ?? ''} />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="client-address">Address</Label>
                        <textarea id="client-address" name="address" defaultValue={client?.address ?? ''} className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
                        <InputError message={errors.address} />
                    </div>
                    <Button disabled={processing} className="w-full">
                        {processing ? 'Saving...' : client ? 'Update client' : 'Save client'}
                    </Button>
                </>
            )}
        </Form>
    );
}

ClientsIndex.layout = {
    breadcrumbs: [{ title: 'Clients', href: '/' }],
};
