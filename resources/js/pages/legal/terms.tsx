import { Head, Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
            <Head title="Terms of Service" />

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
                            Terms of Service
                        </h1>
                        <p className="text-sm text-zinc-400">
                            Last updated: September 1, 2026
                        </p>
                    </header>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing or using BuildWise, you agree to be
                            bound by these Terms of Service. If you do not
                            agree, you may not use the service. Your continued
                            use constitutes acceptance of any updates to these
                            terms.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            2. Description of Service
                        </h2>
                        <p>
                            BuildWise provides tools for managing clients,
                            services, bookings, billing, and inventory. The
                            service is provided on an "as is" and "as available"
                            basis.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            3. Accounts
                        </h2>
                        <p>
                            You are responsible for maintaining the
                            confidentiality of your account credentials and for
                            all activity that occurs under your account. You
                            agree to provide accurate and current information
                            when registering.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            4. Acceptable Use
                        </h2>
                        <p>
                            You agree not to misuse the service, attempt to gain
                            unauthorized access, or use the service in any way
                            that violates applicable laws or regulations.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            5. Intellectual Property
                        </h2>
                        <p>
                            The service and its original content, features, and
                            functionality are and will remain the exclusive
                            property of BuildWise and its licensors.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            6. Limitation of Liability
                        </h2>
                        <p>
                            In no event shall BuildWise be liable for any
                            indirect, incidental, special, consequential, or
                            punitive damages arising from your use of the
                            service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            7. Termination
                        </h2>
                        <p>
                            We may terminate or suspend your access to the
                            service at our sole discretion, without prior
                            notice, for conduct that we believe violates these
                            terms or is harmful to other users.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            8. Contact
                        </h2>
                        <p>
                            If you have any questions about these Terms, please
                            contact us through the support channels provided on
                            our website.
                        </p>
                    </section>
                </article>
            </div>
        </div>
    );
}
