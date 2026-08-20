<?php

namespace App\Http\Requests\Services;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveServiceRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'hourly_rate' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', 'in:active,inactive'],
        ];
    }
}
