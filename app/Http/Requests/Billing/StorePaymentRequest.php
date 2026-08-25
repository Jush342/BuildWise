<?php

namespace App\Http\Requests\Billing;

use App\Models\BillingTransaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $billingTransaction = $this->route('billingTransaction');

        return $billingTransaction instanceof BillingTransaction
            && ($this->user()?->can('manageBilling', $billingTransaction->booking) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0'],
            'method' => ['required', 'string', 'max:50'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $billingTransaction = $this->route('billingTransaction');

            if (
                $billingTransaction instanceof BillingTransaction
                && (float) $this->input('amount') > (float) $billingTransaction->balance
            ) {
                $validator->errors()->add('amount', 'The payment cannot exceed the outstanding balance.');
            }
        }];
    }
}
