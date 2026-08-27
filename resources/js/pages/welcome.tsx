import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    ChartNoAxesCombined,
    ChevronRight,
    ShieldCheck,
    Wrench,
    Zap,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="BuildWise" />
            <link
                href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"
                rel="stylesheet"
            />
            <style>{`
                .font-display { font-family: 'Outfit', sans-serif; }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                @keyframes grid-move {
                    from { transform: translateY(0); }
                    to { transform: translateY(40px); }
                }
                .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .animate-fade-in { animation: fade-in 0.6s ease both; }
                .animate-slide-right { animation: slide-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
                .grid-bg {
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    animation: grid-move 8s linear infinite;
                }
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                .gradient-text {
                    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .hero-glow {
                    background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
                }
            `}</style>
            <main className="min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
                {/* Ambient background */}
                <div className="grid-bg pointer-events-none fixed inset-0" />
                <div className="hero-glow pointer-events-none fixed top-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2" />

                <div className="relative">
                    {/* Nav */}
                    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                                <Wrench className="size-4 text-amber-400" />
                            </div>
                            <span className="font-display text-lg font-semibold tracking-tight">
                                BuildWise
                            </span>
                        </div>
                        <Link
                            href={auth.user ? dashboardUrl : login()}
                            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-white"
                        >
                            {auth.user ? 'Dashboard' : 'Sign in'}
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </header>

                    {/* Hero */}
                    <section className="mx-auto max-w-7xl px-6 pt-20 pb-32 lg:px-8 lg:pt-32 lg:pb-40">
                        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                            <div className="space-y-10">
                                <div
                                    className="space-y-6"
                                    style={{ animationDelay: '0.1s' }}
                                >
                                    <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-medium text-amber-400">
                                        <Zap className="size-3" />
                                        Construction Services Management
                                    </div>
                                    <h1
                                        className="animate-fade-up font-display text-5xl leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl"
                                        style={{ animationDelay: '0.2s' }}
                                    >
                                        Run every project{' '}
                                        <span className="gradient-text">
                                            with confidence.
                                        </span>
                                    </h1>
                                    <p
                                        className="animate-fade-up max-w-xl text-lg leading-relaxed text-white/50"
                                        style={{ animationDelay: '0.3s' }}
                                    >
                                        Clients, services, bookings, billing,
                                        payments, and inventory — one clear
                                        workspace for your construction
                                        business.
                                    </p>
                                </div>

                                <div
                                    className="animate-fade-up flex flex-wrap gap-4"
                                    style={{ animationDelay: '0.4s' }}
                                >
                                    <Link
                                        href={
                                            auth.user ? dashboardUrl : login()
                                        }
                                        className="group inline-flex items-center gap-2.5 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                                    >
                                        {auth.user
                                            ? 'Go to dashboard'
                                            : 'Get started free'}
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:text-white"
                                    >
                                        See features
                                    </Link>
                                </div>

                                {/* Social proof */}
                                <div
                                    className="animate-fade-up flex items-center gap-6 text-sm text-white/30"
                                    style={{ animationDelay: '0.5s' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {[0.2, 0.4, 0.6].map(
                                                (opacity, i) => (
                                                    <div
                                                        key={i}
                                                        className="size-7 rounded-full border-2 border-[#0a0a0a] bg-white/10"
                                                        style={{ opacity }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                        <span>Trusted by teams</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <span>Philippine Peso (₱)</span>
                                </div>
                            </div>

                            {/* Feature cards - right side */}
                            <div className="relative space-y-4">
                                {/* Decorative glow */}
                                <div className="animate-pulse-glow absolute -top-20 -right-20 size-60 rounded-full bg-amber-500/5 blur-3xl" />

                                {[
                                    {
                                        icon: CalendarDays,
                                        title: 'Smart Scheduling',
                                        desc: 'Conflict-free booking with automatic hourly calculation and multi-service support.',
                                        delay: '0.3s',
                                    },
                                    {
                                        icon: ChartNoAxesCombined,
                                        title: 'Revenue Intelligence',
                                        desc: 'Real-time dashboards, revenue charts, payment tracking, and financial reports.',
                                        delay: '0.45s',
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: 'Team Security',
                                        desc: 'Isolated workspaces per team. Clients, billing, and inventory stay separated.',
                                        delay: '0.6s',
                                    },
                                ].map(({ icon: Icon, title, desc, delay }) => (
                                    <div
                                        key={title}
                                        className="animate-slide-right glass group relative rounded-2xl p-6 transition-all hover:border-amber-500/20 hover:bg-white/[0.04]"
                                        style={{ animationDelay: delay }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20 transition-colors group-hover:bg-amber-500/15">
                                                <Icon className="size-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-semibold text-white">
                                                    {title}
                                                </h3>
                                                <p className="mt-1.5 text-sm leading-relaxed text-white/40">
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Stats bar */}
                    <section className="border-t border-white/5 bg-white/[0.01]">
                        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px lg:grid-cols-4">
                            {[
                                { value: '20+', label: 'Services supported' },
                                { value: '₱0', label: 'Setup cost' },
                                { value: '24/7', label: 'Access anywhere' },
                                { value: '<1s', label: 'Page loads' },
                            ].map(({ value, label }) => (
                                <div
                                    key={label}
                                    className="px-8 py-10 text-center"
                                >
                                    <p className="font-display gradient-text text-3xl font-bold">
                                        {value}
                                    </p>
                                    <p className="mt-2 text-sm text-white/30">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Features grid */}
                    <section
                        id="features"
                        className="mx-auto max-w-7xl px-6 py-32 lg:px-8"
                    >
                        <div className="mb-16 max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
                                Everything you need
                            </p>
                            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                                Built for construction teams
                            </h2>
                            <p className="mt-4 text-lg text-white/40">
                                From client intake to final payment — every tool
                                your team needs, nothing it doesn&apos;t.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: '📋',
                                    title: 'Client Management',
                                    desc: 'Full CRM with search, contact details, and booking history.',
                                },
                                {
                                    icon: '⚙️',
                                    title: 'Service & Rate Control',
                                    desc: 'Define services with hourly rates. Activate or deactivate as needed.',
                                },
                                {
                                    icon: '📅',
                                    title: 'Booking Engine',
                                    desc: 'Create, reschedule, complete, or cancel — with conflict detection.',
                                },
                                {
                                    icon: '💰',
                                    title: 'Auto Billing',
                                    desc: 'Invoices generated automatically. Partial payments tracked.',
                                },
                                {
                                    icon: '📦',
                                    title: 'Inventory Tracking',
                                    desc: 'Stock levels, conditions, auto-deduction on completed jobs.',
                                },
                                {
                                    icon: '📊',
                                    title: 'Financial Reports',
                                    desc: 'Revenue trends, service performance, CSV export, date filtering.',
                                },
                            ].map(({ icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="glass rounded-2xl p-6 transition-all hover:border-white/10 hover:bg-white/[0.03]"
                                >
                                    <span className="text-2xl">{icon}</span>
                                    <h3 className="font-display mt-4 font-semibold text-white">
                                        {title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-white/40">
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="border-t border-white/5">
                        <div className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-8">
                            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                                Ready to build smarter?
                            </h2>
                            <p className="mx-auto mt-6 max-w-lg text-lg text-white/40">
                                Join construction teams managing clients,
                                bookings, and billing in one place.
                            </p>
                            <Link
                                href={auth.user ? dashboardUrl : login()}
                                className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-amber-500 px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-[0_0_60px_rgba(245,158,11,0.25)]"
                            >
                                {auth.user
                                    ? 'Open your dashboard'
                                    : 'Start for free'}
                                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-white/20 lg:px-8">
                        <p>BuildWise — Construction services management</p>
                    </footer>
                </div>
            </main>
        </>
    );
}
