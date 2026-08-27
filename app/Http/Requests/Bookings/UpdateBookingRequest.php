<?php

namespace App\Http\Requests\Bookings;

use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('booking')) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->has('client_id') || $this->has('services') || $this->has('booking_date')) {
            return [
                'client_id' => ['required', 'integer', 'exists:clients,id'],
                'booking_date' => ['required', 'date'],
                'start_time' => ['required', 'date_format:H:i'],
                'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
                'services' => ['required', 'array', 'min:1'],
                'services.*.service_id' => ['required', 'integer', 'distinct'],
                'services.*.hours_rendered' => ['required', 'numeric', 'gt:0', 'max:9999'],
                'status' => ['sometimes', Rule::in([
                    Booking::STATUS_CONFIRMED,
                    Booking::STATUS_COMPLETED,
                    Booking::STATUS_CANCELLED,
                ])],
            ];
        }

        return [
            'status' => ['required', Rule::in([
                Booking::STATUS_CONFIRMED,
                Booking::STATUS_COMPLETED,
                Booking::STATUS_CANCELLED,
            ])],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $team = $this->user()?->currentTeam;
            $booking = $this->route('booking');

            if (! $team || ! ($booking instanceof Booking)) {
                return;
            }

            if ($this->has('client_id')) {
                if (! $team->clients()->whereKey($this->integer('client_id'))->exists()) {
                    $validator->errors()->add('client_id', 'The selected client is not part of this team.');
                }

                /** @var array<int, array{service_id: int, hours_rendered: int|float|string}> $serviceItems */
                $serviceItems = $this->validated('services', []);
                $serviceIds = collect($serviceItems)->pluck('service_id')->filter();

                if ($serviceIds->diff($team->services()->whereIn('id', $serviceIds)->pluck('id'))->isNotEmpty()) {
                    $validator->errors()->add('services', 'Every selected service must belong to this team.');
                }

                if ($validator->errors()->hasAny(['booking_date', 'start_time', 'end_time'])) {
                    return;
                }

                $overlaps = Booking::query()
                    ->whereBelongsTo($team)
                    ->where('id', '!=', $booking->id)
                    ->whereDate('booking_date', $this->date('booking_date'))
                    ->where('status', '!=', Booking::STATUS_CANCELLED)
                    ->where('start_time', '<', $this->input('end_time'))
                    ->where('end_time', '>', $this->input('start_time'))
                    ->exists();

                if ($overlaps) {
                    $validator->errors()->add('start_time', 'This time overlaps an existing booking.');
                }
            }
        }];
    }
}
