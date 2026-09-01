import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
            <Head title="Privacy Policy" />

            <div className="mx-auto max-w-3xl px-6 py-16">
                <div className="mb-10 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-white">
                            <AppLogoIcon className="size-6 text-[#0a0a0a]" />
                        </div>
                        <span className="text-lg font-semibold text-white">
                            BuildWise
                        </span>
                    </Link>
                </div>

                <article className="space-y-6 text-sm leading-relaxed">
                    <header className="space-y-2">
                        <h1 className="text-3xl font-bold text-white">
                            Privacy Policy
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Last updated: September 1, 2026
                        </p>
                    </header>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            1. Information We Collect
                        </h2>
                        <p>
                            We collect information you provide directly, such as
                            your name, email address, and the data you enter
                            into the service (clients, bookings, billing, and
                            inventory records).
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            2. How We Use Information
                        </h2>
                        <p>
                            We use the information we collect to provide and
                            improve the service, process transactions, respond
                            to your requests, and ensure the security of your
                            account.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            3. Data Sharing
                        </h2>
                        <p>
                            We do not sell your personal information. We may
                            share data with service providers who assist in
                            operating the service, and only to the extent
                            necessary to provide those services.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            4. Data Security
                        </h2>
                        <p>
                            We take reasonable measures to protect your
                            information from unauthorized access, alteration, or
                            destruction. No method of transmission or storage is
                            completely secure.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            5. Your Rights
                        </h2>
                        <p>
                            You may access, correct, or delete the personal
                            information we hold about you by contacting us.
                            Depending on your location, additional rights may
                            apply under applicable data protection laws.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            6. Cookies
                        </h2>
                        <p>
                            We use cookies and similar technologies to maintain
                            your session, remember your preferences, and
                            understand how the service is used.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            7. Contact
                        </h2>
                        <p>
                            If you have any questions about this Privacy Policy,
                            please contact us through the support channels
                            provided on our website.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
