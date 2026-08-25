<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Billing\StorePaymentRequest;
use App\Models\BillingTransaction;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function store(StorePaymentRequest $request, Team $currentTeam, BillingTransaction $billingTransaction): RedirectResponse
    {
        Gate::authorize('manageBilling', $billingTransaction->booking);

        DB::transaction(function () use ($request, $billingTransaction): void {
            $billingTransaction = BillingTransaction::query()
                ->lockForUpdate()
                ->findOrFail($billingTransaction->id);
            $amount = round((float) $request->validated('amount'), 2);
            $balance = round((float) $billingTransaction->balance, 2);

            if ($amount > $balance) {
                throw ValidationException::withMessages([
                    'amount' => 'The payment cannot exceed the outstanding balance.',
                ]);
            }

            $billingTransaction->payments()->create([
                'payment_date' => $request->validated('payment_date'),
                'amount' => $amount,
                'method' => $request->validated('method'),
            ]);

            $amountPaid = round((float) $billingTransaction->amount_paid + $amount, 2);
            $remainingBalance = round((float) $billingTransaction->total_amount - $amountPaid, 2);

            $billingTransaction->update([
                'amount_paid' => $amountPaid,
                'balance' => $remainingBalance,
                'payment_status' => $remainingBalance === 0.0 ? 'paid' : 'partial',
            ]);
        });

        return to_route('billing.index', ['current_team' => $request->user()->currentTeam]);
    }
}
