<?php

namespace App\Http\Requests\Bookings;

use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->currentTeam !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_id' => ['required', 'integer', 'exists:clients,id'],
            'booking_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'services' => ['required', 'array', 'min:1'],
            'services.*.service_id' => ['required', 'integer', 'distinct'],
            'services.*.hours_rendered' => ['required', 'numeric', 'gt:0', 'max:9999'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $team = $this->user()?->currentTeam;

            if (! $team) {
                return;
            }

            if (! $team->clients()->whereKey($this->integer('client_id'))->exists()) {
                $validator->errors()->add('client_id', 'The selected client is not part of this team.');
            }

            $serviceIds = collect($this->input('services', []))->pluck('service_id')->filter();

            if ($serviceIds->diff($team->services()->whereIn('id', $serviceIds)->pluck('id'))->isNotEmpty()) {
                $validator->errors()->add('services', 'Every selected service must belong to this team.');
            }

            if ($validator->errors()->hasAny(['booking_date', 'start_time', 'end_time'])) {
                return;
            }

            $overlaps = Booking::query()
                ->whereBelongsTo($team)
                ->whereDate('booking_date', $this->date('booking_date'))
                ->where('status', '!=', 'cancelled')
                ->where('start_time', '<', $this->input('end_time'))
                ->where('end_time', '>', $this->input('start_time'))
                ->exists();

            if ($overlaps) {
                $validator->errors()->add('start_time', 'This time overlaps an existing booking.');
            }
        }];
    }
}
