import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, CreditCard } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
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

const navItems = [
    {
        title: 'My Bookings',
        href: '/client-portal/bookings',
        icon: CalendarDays,
    },
    { title: 'My Invoices', href: '/client-portal/invoices', icon: CreditCard },
];

export default function ClientPortalLayout({
    children,
}: {
    children: ReactNode;
}) {
    const { url } = usePage();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar collapsible="icon" variant="inset">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/client-portal/bookings" prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={url === item.href}
                                >
                                    <Link href={item.href} prefetch>
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarContent>

                <SidebarFooter>
                    <NavUser />
                </SidebarFooter>
            </Sidebar>

            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
            </main>
        </div>
    );
}
