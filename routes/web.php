<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

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

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
