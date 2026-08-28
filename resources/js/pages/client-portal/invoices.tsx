import { Head, usePage } from '@inertiajs/react';
import { CreditCard, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import ClientPortalLayout from '@/layouts/client-portal-layout';

type Invoice = {
    id: number;
    invoice_number: string;
    total_amount: string;
    amount_paid: string;
    balance: string;
    payment_status: string;
    booking_id: number;
};

function PaymentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'paid':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 capitalize dark:text-emerald-400"
                >
                    <CheckCircle2 className="size-3" />
                    Paid
                </Badge>
            );
        case 'partially_paid':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 capitalize dark:text-amber-400"
                >
                    <Clock className="size-3" />
                    Partial
                </Badge>
            );
        case 'unpaid':
            return (
                <Badge
                    variant="outline"
                    className="gap-1 border-red-500/30 bg-red-500/10 text-red-700 capitalize dark:text-red-400"
                >
                    <AlertCircle className="size-3" />
                    Unpaid
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

function ClientInvoices() {
    const { invoices } = usePage<{ invoices: Invoice[] }>().props;

    const totalOwed = invoices.reduce(
        (sum, inv) => sum + parseFloat(inv.balance || '0'),
        0,
    );
    const totalPaid = invoices.reduce(
        (sum, inv) => sum + parseFloat(inv.amount_paid || '0'),
        0,
    );

    return (
        <ClientPortalLayout>
            <Head title="My Invoices" />

            <Heading
                variant="small"
                title="My Invoices"
                description="Track your payments and outstanding balances"
            />

            {/* Summary cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total Invoices
                    </p>
                    <p className="mt-1 text-2xl font-bold">{invoices.length}</p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">
                        Total Paid
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ₱{totalPaid.toFixed(2)}
                    </p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">
                        Outstanding
                    </p>
                    <p
                        className={`mt-1 text-2xl font-bold ${totalOwed > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
                    >
                        ₱{totalOwed.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Invoice list */}
            {invoices.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed p-12 text-center">
                    <CreditCard className="mx-auto size-10 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                        No invoices yet. Invoices are generated when bookings
                        are created.
                    </p>
                </div>
            ) : (
                <div className="mt-6 overflow-hidden rounded-xl border">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 bg-muted/40 px-5 py-3 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_10rem_8rem_8rem]">
                        <span>Invoice</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Paid</span>
                        <span className="text-right">Status</span>
                    </div>
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-t px-5 py-4 sm:grid-cols-[1fr_10rem_8rem_8rem]"
                        >
                            <div>
                                <p className="font-medium">
                                    {invoice.invoice_number}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Booking #{invoice.booking_id}
                                </p>
                            </div>
                            <p className="text-right font-semibold">
                                ₱{Number(invoice.total_amount).toFixed(2)}
                            </p>
                            <p className="text-right text-sm text-muted-foreground">
                                ₱{Number(invoice.amount_paid).toFixed(2)}
                            </p>
                            <div className="flex justify-end">
                                <PaymentStatusBadge
                                    status={invoice.payment_status}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ClientPortalLayout>
    );
}

ClientInvoices.layout = {
    breadcrumbs: [{ title: 'My Invoices', href: '/client-portal/invoices' }],
};

export default ClientInvoices;
