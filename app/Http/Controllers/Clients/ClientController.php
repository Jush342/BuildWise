<?php

namespace App\Http\Controllers\Clients;

use App\Http\Controllers\Controller;
use App\Http\Requests\Clients\SaveClientRequest;
use App\Models\Client;
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

        return Inertia::render('clients/index', [
            'clients' => $request->user()->currentTeam->clients()
                ->orderBy('name')
                ->get(['id', 'name', 'contact', 'email', 'address']),
        ]);
    }

    public function store(SaveClientRequest $request): RedirectResponse
    {
        Gate::authorize('create', Client::class);

        $request->user()->currentTeam->clients()->create($request->validated());

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function update(SaveClientRequest $request, Client $client): RedirectResponse
    {
        Gate::authorize('update', $client);

        $client->update($request->validated());

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        Gate::authorize('delete', $client);

        $client->delete();

        return to_route('clients.index', ['current_team' => $request->user()->currentTeam]);
    }
}
