<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->belongsToTeam($this->user()->currentTeam) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'item_name' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'condition' => ['required', 'in:good,fair,poor'],
            'status' => ['required', 'in:available,low_stock,out_of_stock'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $serviceId = $this->integer('service_id');
            $team = $this->user()?->currentTeam;

            if ($serviceId && $team && ! $team->services()->whereKey($serviceId)->exists()) {
                $validator->errors()->add('service_id', 'The selected service is not part of this team.');
            }
        }];
    }
}
