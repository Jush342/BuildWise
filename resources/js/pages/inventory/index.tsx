import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InventoryController from '@/actions/App/Http/Controllers/Inventory/InventoryController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy, index } from '@/routes/inventory';
import type { Team } from '@/types';

type Service = { id: number; name: string };
type InventoryItem = {
    id: number;
    service_id: number | null;
    item_name: string;
    quantity: number;
    condition: 'good' | 'fair' | 'poor';
    status: 'available' | 'low_stock' | 'out_of_stock';
    service?: Service | null;
};

type Props = {
    inventory: InventoryItem[];
    services: Service[];
    search: string;
};

export default function InventoryIndex({
    inventory,
    services,
    search: initialSearch,
}: Props) {
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [search, setSearch] = useState(initialSearch);
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            index.url(currentTeam.slug),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Inventory" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Inventory"
                        description="Track equipment, materials, and stock availability"
                    />
                    <Button onClick={() => setEditingItem(null)}>
                        <Plus /> Add item
                    </Button>
                </div>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="overflow-hidden rounded-lg border">
                        <form
                            onSubmit={submitSearch}
                            className="flex gap-2 border-b p-4"
                        >
                            <Input
                                aria-label="Search inventory"
                                placeholder="Search item, service, or status..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                            <Button type="submit" variant="outline">
                                Search
                            </Button>
                        </form>
                        <div className="grid grid-cols-[minmax(0,1fr)_7rem_7rem_8rem_auto] gap-4 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
                            <span>Item</span>
                            <span>Quantity</span>
                            <span>Condition</span>
                            <span>Status</span>
                            <span className="sr-only">Actions</span>
                        </div>
                        {inventory.map((item) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[minmax(0,1fr)_7rem_7rem_8rem_auto] items-center gap-4 border-b px-4 py-4 last:border-b-0"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.item_name}
                                    </p>
                                    {item.service ? (
                                        <p className="text-xs text-muted-foreground">
                                            {item.service.name}
                                        </p>
                                    ) : null}
                                </div>
                                <span>{item.quantity}</span>
                                <span className="text-sm text-muted-foreground capitalize">
                                    {item.condition}
                                </span>
                                <span className="text-sm text-muted-foreground capitalize">
                                    {item.status.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Edit ${item.item_name}`}
                                        onClick={() => setEditingItem(item)}
                                    >
                                        <Pencil />
                                    </Button>
                                    <Link
                                        href={destroy({
                                            current_team: currentTeam.slug,
                                            inventory: item.id,
                                        })}
                                        method="delete"
                                        as="button"
                                        aria-label={`Delete ${item.item_name}`}
                                        className="inline-flex size-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {inventory.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                No inventory items yet. Add equipment or
                                materials to get started.
                            </p>
                        ) : null}
                    </div>
                    <InventoryForm item={editingItem} services={services} />
                </div>
            </div>
        </>
    );
}

function InventoryForm({
    item,
    services,
}: {
    item: InventoryItem | null;
    services: Service[];
}) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const form = item
        ? InventoryController.update.form({
              current_team: currentTeam.slug,
              inventory: item.id,
          })
        : InventoryController.store.form(currentTeam.slug);

    return (
        <Form
            {...form}
            options={{ preserveScroll: true }}
            className="space-y-4 rounded-lg border p-5"
        >
            {({ errors, processing }) => (
                <>
                    <h2 className="font-medium">
                        {item ? 'Edit inventory item' : 'New inventory item'}
                    </h2>
                    <div className="grid gap-2">
                        <Label htmlFor="inventory-item-name">Item name</Label>
                        <Input
                            id="inventory-item-name"
                            name="item_name"
                            defaultValue={item?.item_name ?? ''}
                            required
                        />
                        <InputError message={errors.item_name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inventory-service">
                            Related service
                        </Label>
                        <select
                            id="inventory-service"
                            name="service_id"
                            defaultValue={item?.service_id ?? ''}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">No related service</option>
                            {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.service_id} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inventory-quantity">Quantity</Label>
                        <Input
                            id="inventory-quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            defaultValue={item?.quantity ?? 0}
                            required
                        />
                        <InputError message={errors.quantity} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inventory-condition">Condition</Label>
                        <select
                            id="inventory-condition"
                            name="condition"
                            defaultValue={item?.condition ?? 'good'}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                        </select>
                        <InputError message={errors.condition} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="inventory-status">Status</Label>
                        <select
                            id="inventory-status"
                            name="status"
                            defaultValue={item?.status ?? 'available'}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="available">Available</option>
                            <option value="low_stock">Low stock</option>
                            <option value="out_of_stock">Out of stock</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>
                    <Button disabled={processing} className="w-full">
                        {processing
                            ? 'Saving...'
                            : item
                              ? 'Update item'
                              : 'Save item'}
                    </Button>
                </>
            )}
        </Form>
    );
}

InventoryIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Inventory',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});
