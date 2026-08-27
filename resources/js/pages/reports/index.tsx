import { Head, router, usePage } from '@inertiajs/react';
import {
    ArrowDownToLine,
    Calendar,
    Banknote,
    CreditCard,
    Filter,
    Layers,
    Receipt,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { exportMethod, index } from '@/routes/reports';
import type { Team } from '@/types';

type ServicePerformance = {
    service_id: number;
    service_name: string;
    count: number;
    total_hours: number;
    total_revenue: number;
};

type TransactionItem = {
    id: number;
    date: string;
    invoice_number: string;
    client_name: string;
    services: string;
    status: string;
    payment_status: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
};

type Props = {
    summary: {
        totalInvoiced: number;
        totalCollected: number;
        totalOutstanding: number;
        bookings: {
            total: number;
            confirmed: number;
            completed: number;
            cancelled: number;
        };
    };
    servicePerformance: ServicePerformance[];
    transactions: TransactionItem[];
    filters: {
        range: string;
        startDate: string | null;
        endDate: string | null;
        clientId: number | null;
    };
    clients: { id: number; name: string }[];
};

export default function ReportsIndex({
    summary,
    servicePerformance,
    transactions,
    filters,
    clients,
}: Props) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const [selectedRange, setSelectedRange] = useState(
        filters.range || 'this_month',
    );
    const [startDate, setStartDate] = useState(filters.startDate || '');
    const [endDate, setEndDate] = useState(filters.endDate || '');
    const [selectedClientId, setSelectedClientId] = useState<string>(
        filters.clientId?.toString() || '',
    );

    const applyFilter = (
        range: string,
        start?: string,
        end?: string,
        clientId?: string,
    ) => {
        setSelectedRange(range);

        if (clientId !== undefined) {
            setSelectedClientId(clientId);
        }

        router.get(
            index.url(currentTeam.slug),
            {
                range,
                start_date:
                    start !== undefined ? start : startDate || undefined,
                end_date: end !== undefined ? end : endDate || undefined,
                client_id:
                    (clientId !== undefined ? clientId : selectedClientId) ||
                    undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleCustomFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        applyFilter('custom', startDate, endDate);
    };

    const exportUrl = exportMethod.url(currentTeam.slug, {
        query: {
            range: selectedRange,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
            client_id: selectedClientId || undefined,
        },
    });

    return (
        <>
            <Head title="Reports & Financial History" />
            <div className="space-y-6">
                {/* Header & Export CTA */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        variant="small"
                        title="Reports & Analytics"
                        description="Financial summaries, service performance, transaction history, and CSV data export"
                    />
                    <Button asChild variant="outline" className="gap-2">
                        <a href={exportUrl} download>
                            <ArrowDownToLine className="size-4" /> Export CSV
                            Report
                        </a>
                    </Button>
                </div>

                {/* Filter Controls Bar */}
                <div className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="mr-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                <Filter className="size-3.5" /> Date Range:
                            </span>
                            {[
                                { id: 'today', label: 'Today' },
                                { id: 'this_month', label: 'This Month' },
                                { id: 'last_month', label: 'Last Month' },
                                { id: 'last_30_days', label: 'Last 30 Days' },
                                { id: 'this_year', label: 'This Year' },
                                { id: 'all', label: 'All Time' },
                            ].map((preset) => (
                                <Button
                                    key={preset.id}
                                    type="button"
                                    size="sm"
                                    variant={
                                        selectedRange === preset.id
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className="h-8 px-2.5 text-xs font-medium"
                                    onClick={() => applyFilter(preset.id)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Client Filter */}
                            <select
                                value={selectedClientId}
                                onChange={(e) =>
                                    applyFilter(
                                        selectedRange,
                                        undefined,
                                        undefined,
                                        e.target.value,
                                    )
                                }
                                className="h-8 rounded-md border bg-background px-2 text-xs focus:ring-1 focus:ring-ring focus:outline-none"
                            >
                                <option value="">All Clients</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>

                            {/* Custom Date Picker Range */}
                            <form
                                onSubmit={handleCustomFilterSubmit}
                                className="flex flex-wrap items-center gap-2"
                            >
                                <Input
                                    type="date"
                                    aria-label="Start date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="h-8 w-36 text-xs"
                                />
                                <span className="text-xs text-muted-foreground">
                                    to
                                </span>
                                <Input
                                    type="date"
                                    aria-label="End date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-8 w-36 text-xs"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                >
                                    Apply
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-medium">
                                Total Invoiced
                            </span>
                            <Receipt className="size-4" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            ₱{summary.totalInvoiced.toFixed(2)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            All bills generated in period
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                            <span className="text-xs font-medium">
                                Revenue Collected
                            </span>
                            <Banknote className="size-4" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₱{summary.totalCollected.toFixed(2)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Received client payments
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                            <span className="text-xs font-medium">
                                Outstanding Balance
                            </span>
                            <CreditCard className="size-4" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            ₱{summary.totalOutstanding.toFixed(2)}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Pending receivables
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-xs">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span className="text-xs font-medium">
                                Appointments Booked
                            </span>
                            <Calendar className="size-4" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-foreground">
                            {summary.bookings.total}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                {summary.bookings.confirmed} conf
                            </span>
                            ·
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                {summary.bookings.completed} done
                            </span>
                            ·
                            <span className="font-medium text-red-500">
                                {summary.bookings.cancelled} canc
                            </span>
                        </div>
                    </div>
                </div>

                {/* Service Performance Table */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                    <div className="flex items-center justify-between border-b bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                            <Wrench className="size-4 text-primary" />
                            <h3 className="text-sm font-semibold">
                                Service Performance & Revenue Breakdown
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {servicePerformance.length} services rendered
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
                                <tr>
                                    <th className="p-3 pl-4">Service</th>
                                    <th className="p-3">Jobs Booked</th>
                                    <th className="p-3">
                                        Total Hours Rendered
                                    </th>
                                    <th className="p-3 pr-4 text-right">
                                        Total Revenue
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {servicePerformance.map((srv) => (
                                    <tr
                                        key={srv.service_id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 pl-4 font-semibold text-foreground">
                                            {srv.service_name}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {srv.count} job
                                            {srv.count === 1 ? '' : 's'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {srv.total_hours} hrs
                                        </td>
                                        <td className="p-3 pr-4 text-right font-bold text-foreground">
                                            ₱{srv.total_revenue.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {servicePerformance.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            No services rendered during this
                                            date range.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comprehensive Transaction History Ledger */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                    <div className="flex items-center justify-between border-b bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                            <Layers className="size-4 text-primary" />
                            <h3 className="text-sm font-semibold">
                                Transaction & Invoice Ledger
                            </h3>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {transactions.length} record
                            {transactions.length === 1 ? '' : 's'}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b bg-muted/40 font-medium text-muted-foreground">
                                <tr>
                                    <th className="p-3 pl-4">Date</th>
                                    <th className="p-3">Invoice #</th>
                                    <th className="p-3">Client</th>
                                    <th className="p-3">Services</th>
                                    <th className="p-3">Job Status</th>
                                    <th className="p-3">Payment</th>
                                    <th className="p-3 text-right">Invoiced</th>
                                    <th className="p-3 text-right">Paid</th>
                                    <th className="p-3 pr-4 text-right">
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {transactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="p-3 pl-4 whitespace-nowrap text-muted-foreground">
                                            {tx.date}
                                        </td>
                                        <td className="p-3 font-mono font-medium text-foreground">
                                            {tx.invoice_number}
                                        </td>
                                        <td className="p-3 font-semibold text-foreground">
                                            {tx.client_name}
                                        </td>
                                        <td
                                            className="max-w-xs truncate p-3 text-muted-foreground"
                                            title={tx.services}
                                        >
                                            {tx.services || '—'}
                                        </td>
                                        <td className="p-3">
                                            <JobStatusBadge
                                                status={tx.status}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <PaymentStatusBadge
                                                status={tx.payment_status}
                                            />
                                        </td>
                                        <td className="p-3 text-right font-medium">
                                            ₱{tx.total_amount.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                            ₱{tx.amount_paid.toFixed(2)}
                                        </td>
                                        <td className="p-3 pr-4 text-right font-bold text-foreground">
                                            ₱{tx.balance.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="p-8 text-center text-muted-foreground"
                                        >
                                            No transactions found for the
                                            selected period.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

function JobStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'confirmed':
            return (
                <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 py-0 text-[10px] text-blue-700 capitalize dark:text-blue-400"
                >
                    Confirmed
                </Badge>
            );
        case 'completed':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 py-0 text-[10px] text-emerald-700 capitalize dark:text-emerald-400"
                >
                    Completed
                </Badge>
            );
        case 'cancelled':
            return (
                <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 py-0 text-[10px] text-red-700 capitalize dark:text-red-400"
                >
                    Cancelled
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="py-0 text-[10px]">
                    {status}
                </Badge>
            );
    }
}

function PaymentStatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'paid':
            return (
                <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 py-0 text-[10px] text-emerald-700 capitalize dark:text-emerald-400"
                >
                    Paid
                </Badge>
            );
        case 'partial':
            return (
                <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 py-0 text-[10px] text-amber-700 capitalize dark:text-amber-400"
                >
                    Partial
                </Badge>
            );
        case 'unpaid':
            return (
                <Badge
                    variant="outline"
                    className="border-zinc-400 bg-zinc-100 py-0 text-[10px] text-muted-foreground capitalize dark:bg-zinc-800"
                >
                    Unpaid
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="py-0 text-[10px]">
                    {status}
                </Badge>
            );
    }
}

ReportsIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Reports & History',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});
