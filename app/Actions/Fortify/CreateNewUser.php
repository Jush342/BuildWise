<?php

namespace App\Actions\Fortify;

use App\Models\Client;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    /**
     * Validate and create a newly registered client account.
     *
     * New self-registered users are always treated as clients. They are given
     * a linked Client record on the primary business team so that they are
     * routed to the client portal after registration.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => ['required', 'confirmed', Password::defaults()],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);

        $team = Team::primaryBusiness();

        Client::create([
            'team_id' => $team->id,
            'user_id' => $user->id,
            'name' => $input['name'],
            'email' => $input['email'],
        ]);

        return $user;
    }
}
