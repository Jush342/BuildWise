<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Services\SaveServiceRequest;
use App\Models\Service;
use App\Models\Team;
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
        $search = trim((string) $request->query('search', ''));
        $services = $request->user()->currentTeam->services()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->get(['id', 'name', 'hourly_rate', 'status']);

        return Inertia::render('services/index', [
            'services' => $services,
            'search' => $search,
        ]);
    }

    public function store(SaveServiceRequest $request): RedirectResponse
    {
        Gate::authorize('create', Service::class);

        $request->user()->currentTeam->services()->create($request->validated());

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function update(SaveServiceRequest $request, Team $currentTeam, Service $service): RedirectResponse
    {
        Gate::authorize('update', $service);

        $service->update($request->validated());

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }

    public function destroy(Request $request, Team $currentTeam, Service $service): RedirectResponse
    {
        Gate::authorize('delete', $service);

        $service->delete();

        return to_route('services.index', ['current_team' => $request->user()->currentTeam]);
    }
}
