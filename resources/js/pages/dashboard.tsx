import { Head } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, CircleDollarSign, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { dashboard } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats: {
        totalBookings: number;
        upcomingBookings: number;
        revenueCollected: string;
        outstandingBalance: string;
        inventoryAlerts: number;
    };
};

export default function Dashboard({ pendingInvitations = [], stats }: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Total bookings" value={stats.totalBookings} icon={CalendarDays} />
                    <MetricCard label="Upcoming bookings" value={stats.upcomingBookings} icon={CalendarDays} />
                    <MetricCard label="Collected revenue" value={`$${Number(stats.revenueCollected).toFixed(2)}`} icon={CircleDollarSign} />
                    <MetricCard label="Outstanding balance" value={`$${Number(stats.outstandingBalance).toFixed(2)}`} icon={CreditCard} />
                </div>
                <div className="rounded-xl border p-5">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="size-5 text-amber-500" />
                        <div>
                            <p className="font-medium">Inventory alerts</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.inventoryAlerts === 0 ? 'All inventory is available.' : `${stats.inventoryAlerts} item${stats.inventoryAlerts === 1 ? '' : 's'} need attention.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
    return (
        <div className="rounded-xl border p-5">
            <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
        </div>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboard(props.currentTeam.slug) : '/',
        },
    ],
});
