<?php

namespace App\Http\Responses\Concerns;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

trait RedirectsToCurrentTeam
{
    protected function redirectPathForCurrentTeam(Request $request, string $redirect): string
    {
        $team = $this->currentTeam($request);

        URL::defaults(['current_team' => $team->slug]);

        return "/{$team->slug}{$redirect}";
    }

    /**
     * Get the redirect path after authentication.
     *
     * Users linked to a client record are sent to the client portal; all other
     * users (team members / staff) are sent to their current team dashboard.
     */
    protected function redirectPathForAuthenticatedUser(Request $request, string $redirect): string
    {
        $user = $request->user();

        abort_if(! $user, 403);

        if ($user->client()->exists()) {
            return '/client-portal/bookings';
        }

        return $this->redirectPathForCurrentTeam($request, $redirect);
    }

    protected function currentTeam(Request $request): Team
    {
        $user = $request->user();

        abort_if(! $user, 403);

        $team = $user->currentTeam ?? $user->personalTeam();

        abort_if(! $team, 403);

        return $team;
    }
}
