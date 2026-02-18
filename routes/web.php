<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::get('/activos-fijos', function () {
    return redirect()->route('fixedasset.list');
})->middleware(['auth', 'verified'])->name('fixedasset.index');

Route::get('/activos-fijos/lista', function () {
    return Inertia::render('FixedAsset/List');
})->middleware(['auth', 'verified'])->name('fixedasset.list');

Route::get('/activos-fijos/asignacion', function () {
    return Inertia::render('FixedAsset/Assignment');
})->middleware(['auth', 'verified'])->name('fixedasset.assignment');

Route::get('/activos-fijos/mantenimiento', function () {
    return Inertia::render('FixedAsset/Maintenance');
})->middleware(['auth', 'verified'])->name('fixedasset.maintenance');

Route::get('/it-resources', function () {
    return redirect()->route('itresources.hardware.list');
})->middleware(['auth', 'verified'])->name('itresources.index');

Route::get('/it-resources/hardware/list', function () {
    return Inertia::render('ITResources/Hardware/List');
})->middleware(['auth', 'verified'])->name('itresources.hardware.list');

Route::get('/it-resources/hardware/details', function () {
    return Inertia::render('ITResources/Hardware/Details');
})->middleware(['auth', 'verified'])->name('itresources.hardware.details');

Route::get('/it-resources/software/list', function () {
    return Inertia::render('ITResources/Software/List');
})->middleware(['auth', 'verified'])->name('itresources.software.list');

Route::get('/it-resources/software/installed', function () {
    return Inertia::render('ITResources/Software/Installed');
})->middleware(['auth', 'verified'])->name('itresources.software.installed');

Route::get('/mantenimientos', function () {
    return redirect()->route('maintenance.list');
})->middleware(['auth', 'verified'])->name('maintenance.index');

Route::get('/mantenimientos/lista', function () {
    return Inertia::render('Maintenance/List');
})->middleware(['auth', 'verified'])->name('maintenance.list');

Route::get('/mantenimientos/historial', function () {
    return Inertia::render('Maintenance/History');
})->middleware(['auth', 'verified'])->name('maintenance.history');

Route::get('/person', function () {
    return redirect()->route('person.list');
})->middleware(['auth', 'verified'])->name('person.index');

Route::get('/person/lista', function () {
    return Inertia::render('Person/List');
})->middleware(['auth', 'verified'])->name('person.list');

Route::get('/usuarios', function () {
    return redirect()->route('users.list');
})->middleware(['auth', 'verified'])->name('users.index');

Route::get('/usuarios/lista', function () {
    return Inertia::render('Users/List');
})->middleware(['auth', 'verified'])->name('users.list');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
