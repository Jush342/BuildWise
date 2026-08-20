<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\SaveServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Service::class);

        return Inertia::render('services/index', [
            'services' => $request->user()->currentTeam->services()
                ->orderBy('name')
                ->get(['id', 'name', 'hourly_rate', 'status']),
        ]);
    }

    public function store(SaveServiceRequest $request): RedirectResponse
    {
        Gate::authorize('create', Service::class);

        $request->user()->currentTeam->services()->create($request->validated());

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function update(SaveServiceRequest $request, Service $service): RedirectResponse
    {
        Gate::authorize('update', $service);

        $service->update($request->validated());

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function destroy(Request $request, Service $service): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $service->delete();

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }
}
