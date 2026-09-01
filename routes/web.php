<?php

use App\Http\Controllers\Billing\BillingController;
use App\Http\Controllers\Billing\PaymentController;
use App\Http\Controllers\Bookings\BookingController;
use App\Http\Controllers\ClientPortal\PortalBookingController;
use App\Http\Controllers\ClientPortal\PortalInvoiceController;
use App\Http\Controllers\Clients\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Services\ServiceController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureClientAccess;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::inertia('terms', 'legal/terms')->name('terms');
Route::inertia('privacy', 'legal/privacy')->name('privacy');

Route::middleware(['auth', EnsureClientAccess::class])->prefix('client-portal')->group(function () {
    Route::get('bookings', [PortalBookingController::class, 'index'])->name('client-portal.bookings');
    Route::get('invoices', [PortalInvoiceController::class, 'index'])->name('client-portal.invoices');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
        Route::post('billing/{billingTransaction}/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
        Route::resource('clients', ClientController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('services', ServiceController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('bookings', BookingController::class)->only(['index', 'store', 'update']);
        Route::resource('inventory', InventoryController::class)->only(['index', 'store', 'update', 'destroy']);
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
