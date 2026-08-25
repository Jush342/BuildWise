import { Form, Head, router, usePage } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import PaymentController from '@/actions/App/Http/Controllers/Billing/PaymentController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index } from '@/routes/billing';
import type { Team } from '@/types';

type Payment = {
    id: number;
    payment_date: string;
    amount: string;
    method: string;
};

type BillingTransaction = {
    id: number;
    invoice_number: string;
    total_amount: string;
    amount_paid: string;
    balance: string;
    payment_status: string;
    booking: {
        client: {
            name: string;
        };
    };
    payments: Payment[];
};

type Props = {
    billingTransactions: BillingTransaction[];
    search: string;
};

export default function BillingIndex({
    billingTransactions,
    search: initialSearch,
}: Props) {
    const { currentTeam } = usePage<{ currentTeam: Team }>().props;
    const [search, setSearch] = useState(initialSearch);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            index.url(currentTeam.slug),
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Billing" />
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Billing"
                    description="Track invoices, balances, and payments"
                />
                <form onSubmit={submitSearch} className="flex gap-2">
                    <Input
                        aria-label="Search billing"
                        placeholder="Search invoice, client, or status..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Button type="submit" variant="outline">
                        Search
                    </Button>
                </form>
                <div className="space-y-4">
                    {billingTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="grid gap-6 rounded-lg border p-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            {transaction.invoice_number}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {transaction.booking.client.name}
                                        </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {transaction.payment_status}
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Total
                                        </p>
                                        <p className="font-medium">
                                            $
                                            {Number(
                                                transaction.total_amount,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Paid
                                        </p>
                                        <p className="font-medium">
                                            $
                                            {Number(
                                                transaction.amount_paid,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Balance
                                        </p>
                                        <p className="font-medium">
                                            $
                                            {Number(
                                                transaction.balance,
                                            ).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                {transaction.payments.length > 0 ? (
                                    <div className="space-y-2 border-t pt-3">
                                        <p className="text-sm font-medium">
                                            Payment history
                                        </p>
                                        {transaction.payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex justify-between gap-4 text-sm text-muted-foreground"
                                            >
                                                <span>
                                                    {payment.payment_date} ·{' '}
                                                    {payment.method}
                                                </span>
                                                <span>
                                                    $
                                                    {Number(
                                                        payment.amount,
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            {Number(transaction.balance) > 0 ? (
                                <Form
                                    {...PaymentController.store.form({
                                        current_team: currentTeam.slug,
                                        billingTransaction: transaction.id,
                                    })}
                                    options={{ preserveScroll: true }}
                                    className="space-y-4 rounded-md bg-muted/40 p-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="size-4" />
                                                <h2 className="font-medium">
                                                    Record payment
                                                </h2>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`payment-amount-${transaction.id}`}
                                                >
                                                    Amount
                                                </Label>
                                                <Input
                                                    id={`payment-amount-${transaction.id}`}
                                                    name="amount"
                                                    type="number"
                                                    min="0.01"
                                                    max={transaction.balance}
                                                    step="0.01"
                                                    required
                                                />
                                                <InputError
                                                    message={errors.amount}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`payment-date-${transaction.id}`}
                                                >
                                                    Date
                                                </Label>
                                                <Input
                                                    id={`payment-date-${transaction.id}`}
                                                    name="payment_date"
                                                    type="date"
                                                    required
                                                />
                                                <InputError
                                                    message={
                                                        errors.payment_date
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor={`payment-method-${transaction.id}`}
                                                >
                                                    Method
                                                </Label>
                                                <select
                                                    id={`payment-method-${transaction.id}`}
                                                    name="method"
                                                    defaultValue="cash"
                                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                                >
                                                    <option value="cash">
                                                        Cash
                                                    </option>
                                                    <option value="bank_transfer">
                                                        Bank transfer
                                                    </option>
                                                    <option value="card">
                                                        Card
                                                    </option>
                                                    <option value="other">
                                                        Other
                                                    </option>
                                                </select>
                                                <InputError
                                                    message={errors.method}
                                                />
                                            </div>
                                            <Button
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                {processing
                                                    ? 'Saving...'
                                                    : 'Record payment'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            ) : null}
                        </div>
                    ))}
                    {billingTransactions.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                            No invoices yet. Create a booking to generate an
                            invoice.
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}

BillingIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Billing',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});
