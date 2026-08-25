import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ChartNoAxesCombined,
    ShieldCheck,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="BuildWise" />
            <main className="min-h-screen bg-background text-foreground">
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
                    <AppLogo />
                    <Link
                        href={auth.user ? dashboardUrl : login()}
                        className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                        {auth.user ? 'Open dashboard' : 'Log in'}
                        <ArrowRight className="size-4" />
                    </Link>
                </header>

                <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-28">
                    <div className="space-y-8">
                        <div className="space-y-5">
                            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                                Construction services management
                            </p>
                            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                                Run every project with confidence.
                            </h1>
                            <p className="max-w-2xl text-lg text-muted-foreground">
                                BuildWise keeps clients, services, bookings,
                                billing, payments, and inventory in one clear
                                workspace.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={auth.user ? dashboardUrl : login()}
                                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                            >
                                {auth.user ? 'Go to dashboard' : 'Get started'}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        <FeatureCard
                            icon={CalendarDays}
                            title="Schedule clearly"
                            description="Manage bookings and client appointments without the spreadsheet chaos."
                        />
                        <FeatureCard
                            icon={ChartNoAxesCombined}
                            title="Track performance"
                            description="See revenue, balances, upcoming work, and inventory alerts at a glance."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="Work securely"
                            description="Keep each team’s clients, operations, and financial data separated."
                        />
                    </div>
                </section>
            </main>
        </>
    );
}

function FeatureCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <Icon className="mb-4 size-6 text-primary" />
            <h2 className="font-medium">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
