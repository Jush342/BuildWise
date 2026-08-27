import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    BarChart3,
    Banknote,
    CalendarDays,
    Clock,
    CreditCard,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as billingIndex } from '@/routes/billing';
import { index as bookingsIndex } from '@/routes/bookings';
import { index as inventoryIndex } from '@/routes/inventory';
import type { DashboardInvitation, Team } from '@/types';

type RevenueMonth = {
    month: string;
    label: string;
    shortLabel: string;
    billed: number;
    collected: number;
};

type PaymentStatusSummary = {
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    paidAmount: number;
    partialAmount: number;
    unpaidAmount: number;
    totalInvoiced: number;
};

type RecentBooking = {
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount: string;
    client?: {
        id: number;
        name: string;
    };
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats: {
        totalBookings: number;
        upcomingBookings: number;
        revenueCollected: string;
        outstandingBalance: string;
        inventoryAlerts: number;
    };
    revenueTrend?: RevenueMonth[];
    paymentStatusSummary?: PaymentStatusSummary;
    recentBookings?: RecentBooking[];
};

export default function Dashboard({
    pendingInvitations = [],
    stats,
    revenueTrend = [],
    paymentStatusSummary = {
        paidCount: 0,
        partialCount: 0,
        unpaidCount: 0,
        paidAmount: 0,
        partialAmount: 0,
        unpaidAmount: 0,
        totalInvoiced: 0,
    },
    recentBookings = [],
}: Props) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(
        null,
    );

    // Calculate maximum value for chart scaling
    const maxVal = Math.max(
        ...revenueTrend.map((m) => Math.max(m.billed, m.collected)),
        100,
    );

    const totalInvoiced = paymentStatusSummary.totalInvoiced || 0.01;
    const paidPercent = Math.round(
        (paymentStatusSummary.paidAmount / totalInvoiced) * 100,
    );
    const partialPercent = Math.round(
        (paymentStatusSummary.partialAmount / totalInvoiced) * 100,
    );
    const unpaidPercent = Math.max(0, 100 - paidPercent - partialPercent);

    const activeMonth =
        activeMonthIndex !== null && revenueTrend[activeMonthIndex]
            ? revenueTrend[activeMonthIndex]
            : (revenueTrend[revenueTrend.length - 1] ?? null);

    return (
        <>
            <Head title="Dashboard & Analytics" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Metric Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Total bookings"
                        value={stats.totalBookings}
                        icon={CalendarDays}
                        subtext="All scheduled jobs"
                    />
                    <MetricCard
                        label="Upcoming bookings"
                        value={stats.upcomingBookings}
                        icon={Clock}
                        subtext="Confirmed appointments"
                    />
                    <MetricCard
                        label="Collected revenue"
                        value={`₱${Number(stats.revenueCollected).toFixed(2)}`}
                        icon={Banknote}
                        subtext="Payments received"
                        highlight="text-emerald-600 dark:text-emerald-400"
                    />
                    <MetricCard
                        label="Outstanding balance"
                        value={`₱${Number(stats.outstandingBalance).toFixed(2)}`}
                        icon={CreditCard}
                        subtext="Unpaid invoice balances"
                        highlight={
                            Number(stats.outstandingBalance) > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : ''
                        }
                    />
                </div>

                {/* Revenue Charts & Financial Analytics */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* 6-Month Revenue Trend Chart */}
                    <div className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm lg:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="size-5 text-primary" />
                                <div>
                                    <h3 className="text-base font-semibold">
                                        Revenue Trend
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Monthly Billed vs Collected Revenue
                                        (Past 6 Months)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="size-3 rounded-xs bg-indigo-500" />
                                    Billed
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                    <span className="size-3 rounded-xs bg-emerald-500" />
                                    Collected
                                </span>
                            </div>
                        </div>

                        {/* Active / Highlighted Month Info */}
                        {activeMonth ? (
                            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                                <span className="font-medium text-foreground">
                                    {activeMonth.label} Details:
                                </span>
                                <div className="flex items-center gap-4">
                                    <span>
                                        Billed:{' '}
                                        <strong className="text-foreground">
                                            ₱{activeMonth.billed.toFixed(2)}
                                        </strong>
                                    </span>
                                    <span>
                                        Collected:{' '}
                                        <strong className="text-emerald-600 dark:text-emerald-400">
                                            ₱{activeMonth.collected.toFixed(2)}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        ) : null}

                        {/* Bar Chart Visualization */}
                        <div className="pt-4">
                            <div className="grid h-48 grid-cols-6 items-end gap-2 border-b pb-2 sm:gap-4">
                                {revenueTrend.map((item, idx) => {
                                    const billedHeight = Math.max(
                                        4,
                                        Math.round(
                                            (item.billed / maxVal) * 160,
                                        ),
                                    );
                                    const collectedHeight = Math.max(
                                        4,
                                        Math.round(
                                            (item.collected / maxVal) * 160,
                                        ),
                                    );

                                    const isHovered =
                                        activeMonthIndex === idx ||
                                        (activeMonthIndex === null &&
                                            idx === revenueTrend.length - 1);

                                    return (
                                        <div
                                            key={item.month}
                                            className="group flex cursor-pointer flex-col items-center gap-1"
                                            onMouseEnter={() =>
                                                setActiveMonthIndex(idx)
                                            }
                                        >
                                            <div className="flex h-40 w-full items-end justify-center gap-1 sm:gap-2">
                                                {/* Billed Bar */}
                                                <div
                                                    style={{
                                                        height: `${billedHeight}px`,
                                                    }}
                                                    className={`w-3 rounded-t-sm transition-all duration-200 sm:w-5 ${
                                                        isHovered
                                                            ? 'bg-indigo-600 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700'
                                                            : 'bg-indigo-400/80 hover:bg-indigo-500'
                                                    }`}
                                                    title={`${item.label} Billed: ₱${item.billed.toFixed(2)}`}
                                                />
                                                {/* Collected Bar */}
                                                <div
                                                    style={{
                                                        height: `${collectedHeight}px`,
                                                    }}
                                                    className={`w-3 rounded-t-sm transition-all duration-200 sm:w-5 ${
                                                        isHovered
                                                            ? 'bg-emerald-600 shadow-md ring-2 ring-emerald-300 dark:ring-emerald-700'
                                                            : 'bg-emerald-400/80 hover:bg-emerald-500'
                                                    }`}
                                                    title={`${item.label} Collected: ₱${item.collected.toFixed(2)}`}
                                                />
                                            </div>
                                            <span
                                                className={`mt-1 text-[11px] font-medium transition-colors ${
                                                    isHovered
                                                        ? 'font-bold text-primary'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {item.shortLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>₱0</span>
                                <span>₱{(maxVal / 2).toFixed(0)}</span>
                                <span>₱{maxVal.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status & Invoicing Distribution */}
                    <div className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="size-5 text-primary" />
                                <h3 className="text-base font-semibold">
                                    Invoicing Breakdown
                                </h3>
                            </div>
                            <Link
                                href={billingIndex(currentTeam.slug)}
                                className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                            >
                                Billing <ArrowUpRight className="size-3" />
                            </Link>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Total Invoiced
                            </p>
                            <p className="text-2xl font-bold">
                                ₱
                                {Number(
                                    paymentStatusSummary.totalInvoiced,
                                ).toFixed(2)}
                            </p>
                        </div>

                        {/* Multi-segment Progress Bar */}
                        <div className="space-y-1.5">
                            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    style={{ width: `${paidPercent}%` }}
                                    className="bg-emerald-500 transition-all"
                                    title={`Paid: ${paidPercent}%`}
                                />
                                <div
                                    style={{ width: `${partialPercent}%` }}
                                    className="bg-amber-500 transition-all"
                                    title={`Partial: ${partialPercent}%`}
                                />
                                <div
                                    style={{ width: `${unpaidPercent}%` }}
                                    className="bg-zinc-400 transition-all dark:bg-zinc-600"
                                    title={`Unpaid: ${unpaidPercent}%`}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{paidPercent}% Paid</span>
                                <span>{partialPercent}% Partial</span>
                                <span>{unpaidPercent}% Unpaid</span>
                            </div>
                        </div>

                        {/* Status List Breakdown */}
                        <div className="space-y-2.5 border-t pt-2 text-xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-emerald-500" />
                                    <span>
                                        Paid ({paymentStatusSummary.paidCount})
                                    </span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    ₱
                                    {paymentStatusSummary.paidAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-amber-500" />
                                    <span>
                                        Partial (
                                        {paymentStatusSummary.partialCount})
                                    </span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    ₱
                                    {paymentStatusSummary.partialAmount.toFixed(
                                        2,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="size-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                    <span>
                                        Unpaid (
                                        {paymentStatusSummary.unpaidCount})
                                    </span>
                                </div>
                                <span className="font-semibold text-foreground">
                                    ₱
                                    {paymentStatusSummary.unpaidAmount.toFixed(
                                        2,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Recent Bookings & Inventory Alert */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Appointments */}
                    <div className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="size-5 text-primary" />
                                <h3 className="text-base font-semibold">
                                    Recent Appointments
                                </h3>
                            </div>
                            <Link
                                href={bookingsIndex(currentTeam.slug)}
                                className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                            >
                                View all schedule{' '}
                                <ArrowUpRight className="size-3" />
                            </Link>
                        </div>

                        <div className="divide-y">
                            {recentBookings.map((b) => (
                                <div
                                    key={b.id}
                                    className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {b.client?.name ?? 'Client'}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                                            <CalendarDays className="size-3" />
                                            {b.booking_date.slice(0, 10)} ·{' '}
                                            {b.start_time.slice(0, 5)} -{' '}
                                            {b.end_time.slice(0, 5)}
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="font-bold">
                                            ₱{Number(b.total_amount).toFixed(2)}
                                        </p>
                                        <StatusBadge status={b.status} />
                                    </div>
                                </div>
                            ))}

                            {recentBookings.length === 0 ? (
                                <p className="py-6 text-center text-xs text-muted-foreground">
                                    No recent bookings. Go to Bookings to
                                    schedule appointments.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Inventory Alerts Card */}
                    <div className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    className={`size-5 ${
                                        stats.inventoryAlerts > 0
                                            ? 'text-amber-500'
                                            : 'text-emerald-500'
                                    }`}
                                />
                                <h3 className="text-base font-semibold">
                                    Inventory Status
                                </h3>
                            </div>
                            <Link
                                href={inventoryIndex(currentTeam.slug)}
                                className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
                            >
                                Inventory <ArrowUpRight className="size-3" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                {stats.inventoryAlerts === 0
                                    ? 'All materials & stock are healthy.'
                                    : `${stats.inventoryAlerts} inventory item${
                                          stats.inventoryAlerts === 1 ? '' : 's'
                                      } require attention.`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {stats.inventoryAlerts === 0
                                    ? 'Equipment and tools are available with sufficient quantities for scheduled operations.'
                                    : 'Some tools or materials are low in stock or completely out of stock. Check inventory management.'}
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                            >
                                <Link href={inventoryIndex(currentTeam.slug)}>
                                    Manage Equipment & Stock
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
    subtext,
    highlight = '',
}: {
    label: string;
    value: number | string;
    icon: LucideIcon;
    subtext?: string;
    highlight?: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <p className={`mt-3 text-2xl font-bold ${highlight}`}>{value}</p>
            {subtext ? (
                <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
            ) : null}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
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
            return <Badge variant="outline">{status}</Badge>;
    }
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
