import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    History,
    Package,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InventoryController from '@/actions/App/Http/Controllers/Inventory/InventoryController';
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

type InventoryMovement = {
    id: number;
    inventory_id: number;
    booking_id: number | null;
    user_id: number | null;
    type: string;
    quantity_change: number;
    previous_quantity: number;
    new_quantity: number;
    reason: string | null;
    created_at: string;
    inventory?: { id: number; item_name: string };
    user?: { id: number; name: string };
    booking?: { id: number; client?: { id: number; name: string } };
};

type Props = {
    inventory: InventoryItem[];
    movements?: InventoryMovement[];
    services: Service[];
    search: string;
};

export default function InventoryIndex({
    inventory,
    movements = [],
    services,
    search: initialSearch,
}: Props) {
    const [viewTab, setViewTab] = useState<'stock' | 'history'>('stock');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formOpen, setFormOpen] = useState(false);
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Inventory & Stock Movements"
                        description="Track equipment, stock availability, automatic booking deductions, and audit movements"
                    />
                    <div className="flex items-center gap-2">
                        <div className="inline-flex rounded-lg border bg-muted/30 p-1">
                            <Button
                                size="sm"
                                variant={
                                    viewTab === 'stock' ? 'default' : 'ghost'
                                }
                                className="h-8 gap-1.5 px-3 text-xs font-medium"
                                onClick={() => setViewTab('stock')}
                            >
                                <Package className="size-3.5" />
                                Equipment & Stock
                            </Button>
                            <Button
                                size="sm"
                                variant={
                                    viewTab === 'history' ? 'default' : 'ghost'
                                }
                                className="h-8 gap-1.5 px-3 text-xs font-medium"
                                onClick={() => setViewTab('history')}
                            >
                                <History className="size-3.5" />
                                Movement Ledger ({movements.length})
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => {
                                setEditingItem(null);
                                setFormOpen(true);
                            }}
                        >
                            <Plus className="size-3.5" /> Add item
                        </Button>
                    </div>
                </div>

                <div>
                    {viewTab === 'stock' ? (
                        <div className="overflow-hidden rounded-lg border bg-card">
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
                                    className="min-w-0 flex-1"
                                />
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                            </form>
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_7rem_auto] gap-3 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
                                        <span>Item</span>
                                        <span>Qty</span>
                                        <span>Condition</span>
                                        <span>Status</span>
                                        <span className="sr-only">Actions</span>
                                    </div>
                                    {inventory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_7rem_auto] items-center gap-3 border-b px-4 py-4 last:border-b-0"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.item_name}
                                                </p>
                                                {item.service ? (
                                                    <p className="text-xs text-muted-foreground">
                                                        Linked service:{' '}
                                                        {item.service.name}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span className="font-semibold">
                                                {item.quantity}
                                            </span>
                                            <span className="text-sm text-muted-foreground capitalize">
                                                {item.condition}
                                            </span>
                                            <span>
                                                <StatusBadge
                                                    status={item.status}
                                                />
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Edit ${item.item_name}`}
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setFormOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Link
                                                    href={destroy({
                                                        current_team:
                                                            currentTeam.slug,
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
                                </div>
                            </div>
                            {inventory.length === 0 ? (
                                <p className="p-8 text-center text-sm text-muted-foreground">
                                    No inventory items found. Add equipment or
                                    materials to get started.
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        /* Stock Movement Ledger Table */
                        <div className="overflow-hidden rounded-lg border bg-card">
                            <div className="border-b bg-muted/20 p-4">
                                <h3 className="text-sm font-semibold">
                                    Recent Inventory Movement History
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Audit trail of manual intakes, restocks, and
                                    automatic booking deductions
                                </p>
                            </div>
                            <div className="divide-y text-xs">
                                {movements.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex flex-wrap items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/30"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {m.inventory?.item_name ??
                                                        'Inventory Item'}
                                                </span>
                                                <MovementBadge type={m.type} />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">
                                                {m.reason ||
                                                    'Inventory balance adjustment'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/80">
                                                {new Date(
                                                    m.created_at,
                                                ).toLocaleString()}{' '}
                                                {m.user
                                                    ? `· by ${m.user.name}`
                                                    : ''}
                                            </p>
                                        </div>

                                        <div className="space-y-1 text-right">
                                            <span
                                                className={`inline-flex items-center gap-0.5 text-sm font-bold ${
                                                    m.quantity_change > 0
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : m.quantity_change < 0
                                                          ? 'text-red-600 dark:text-red-400'
                                                          : 'text-muted-foreground'
                                                }`}
                                            >
                                                {m.quantity_change > 0 ? (
                                                    <ArrowUpRight className="size-3.5" />
                                                ) : (
                                                    <ArrowDownRight className="size-3.5" />
                                                )}
                                                {m.quantity_change > 0
                                                    ? `+${m.quantity_change}`
                                                    : m.quantity_change}
                                            </span>
                                            <p className="text-[11px] text-muted-foreground">
                                                Bal: {m.previous_quantity} →{' '}
                                                <strong className="text-foreground">
                                                    {m.new_quantity}
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {movements.length === 0 ? (
                                    <p className="p-8 text-center text-sm text-muted-foreground">
                                        No inventory movements recorded yet.
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>

                <Dialog open={formOpen} onOpenChange={setFormOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem
                                    ? 'Edit inventory item'
                                    : 'New inventory item'}
                            </DialogTitle>
                        </DialogHeader>
                        <InventoryForm
                            item={editingItem}
                            services={services}
                            onClose={() => setFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'available':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-700 capitalize dark:text-emerald-400"
                >
                    Available
                </Badge>
            );
        case 'low_stock':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-700 capitalize dark:text-amber-400"
                >
                    Low Stock
                </Badge>
            );
        case 'out_of_stock':
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-xs text-red-700 capitalize dark:text-red-400"
                >
                    Out of Stock
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function MovementBadge({ type }: { type: string }) {
    switch (type) {
        case 'booking_deduction':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 py-0 text-[10px] text-blue-700 dark:text-blue-400"
                >
                    Booking Auto-Deduct
                </Badge>
            );
        case 'restock':
        case 'initial_stock':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 py-0 text-[10px] text-emerald-700 dark:text-emerald-400"
                >
                    Restock
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="py-0 text-[10px]">
                    Adjustment
                </Badge>
            );
    }
}

function InventoryForm({
    item,
    services,
    onClose,
}: {
    item: InventoryItem | null;
    services: Service[];
    onClose: () => void;
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
            className="space-y-4"
            onSuccess={() => onClose()}
        >
            {({ errors, processing }) => (
                <>
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
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing} className="flex-1">
                            {processing
                                ? 'Saving...'
                                : item
                                  ? 'Update item'
                                  : 'Save item'}
                        </Button>
                    </div>
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
