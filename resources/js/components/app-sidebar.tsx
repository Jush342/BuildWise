import { Link, usePage } from '@inertiajs/react';
import {
    BarChart2,
    CalendarDays,
    CreditCard,
    LayoutGrid,
    Package,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as billingIndex } from '@/routes/billing';
import { index as bookingsIndex } from '@/routes/bookings';
import { index as clientsIndex } from '@/routes/clients';
import { index as inventoryIndex } from '@/routes/inventory';
import { index as reportsIndex } from '@/routes/reports';
import { index as servicesIndex } from '@/routes/services';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();
    const dashboardUrl = page.props.currentTeam
        ? dashboard(page.props.currentTeam.slug)
        : '/';
    const clientsUrl = page.props.currentTeam
        ? clientsIndex(page.props.currentTeam.slug)
        : '/';
    const servicesUrl = page.props.currentTeam
        ? servicesIndex(page.props.currentTeam.slug)
        : '/';
    const bookingsUrl = page.props.currentTeam
        ? bookingsIndex(page.props.currentTeam.slug)
        : '/';
    const billingUrl = page.props.currentTeam
        ? billingIndex(page.props.currentTeam.slug)
        : '/';
    const inventoryUrl = page.props.currentTeam
        ? inventoryIndex(page.props.currentTeam.slug)
        : '/';
    const reportsUrl = page.props.currentTeam
        ? reportsIndex(page.props.currentTeam.slug)
        : '/';

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
        },
        {
            title: 'Clients',
            href: clientsUrl,
            icon: Users,
        },
        {
            title: 'Services & rates',
            href: servicesUrl,
            icon: Wrench,
        },
        {
            title: 'Bookings',
            href: bookingsUrl,
            icon: CalendarDays,
        },
        {
            title: 'Billing',
            href: billingUrl,
            icon: CreditCard,
        },
        {
            title: 'Inventory',
            href: inventoryUrl,
            icon: Package,
        },
        {
            title: 'Reports',
            href: reportsUrl,
            icon: BarChart2,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
