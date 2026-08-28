<?php

namespace App\Http\Middleware;

use App\Models\Client;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClientAccess
{
    /**
     * Handle an incoming request.
     *
     * If the authenticated user is linked to a client record, set the
     * current client on the request so controllers can scope queries.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 401);

        $client = Client::where('user_id', $user->id)->first();

        if (! $client) {
            info('EnsureClientAccess: no client found for user_id='.$user->id);
            info('EnsureClientAccess: all clients='.Client::pluck('user_id')->toJson());
        }

        abort_unless($client !== null, 403, 'No client account linked to this user.');

        $request->attributes->set('currentClient', $client);

        return $next($request);
    }
}
