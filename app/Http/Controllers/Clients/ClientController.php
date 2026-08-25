<?php

namespace App\Http\Controllers\Clients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\SaveClientRequest;
use App\Models\Client;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Client::class);
        $search = trim((string) $request->query('search', ''));
        $clients = $request->user()->currentTeam->clients()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->get(['id', 'name', 'contact', 'email', 'address']);

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'search' => $search,
        ]);
    }

    public function store(SaveClientRequest $request): RedirectResponse
    {
        Gate::authorize('create', Client::class);

        $request->user()->currentTeam->clients()->create($request->validated());

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function update(SaveClientRequest $request, Team $currentTeam, Client $client): RedirectResponse
    {
        Gate::authorize('update', $client);

        $client->update($request->validated());

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function destroy(Request $request, Team $currentTeam, Client $client): RedirectResponse
    {
        Gate::authorize('delete', $client);

        $client->delete();

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }
}
