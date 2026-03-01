<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function agenciesIndex(): Response
    {
        $agencies = DB::table('agencies')
            ->select('idagencie', 'name', 'localitation')
            ->orderBy('name')
            ->get();

        return Inertia::render('Settings/Agencies/List', [
            'agencies' => $agencies,
        ]);
    }

    public function agenciesStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:25'],
            'localitation' => ['nullable', 'string'],
        ]);

        DB::table('agencies')->insert([
            'name' => $validated['name'],
            'localitation' => $validated['localitation'] ?? null,
        ]);

        return redirect()->route('settings.agencies.list');
    }

    public function agenciesUpdate(Request $request, int $agencie): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:25'],
            'localitation' => ['nullable', 'string'],
        ]);

        DB::table('agencies')
            ->where('idagencie', $agencie)
            ->update([
                'name' => $validated['name'],
                'localitation' => $validated['localitation'] ?? null,
            ]);

        return redirect()->route('settings.agencies.list');
    }

    public function assetTypesIndex(): Response
    {
        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name', 'description')
            ->orderBy('name')
            ->get();

        return Inertia::render('Settings/AssetTypes/List', [
            'assetTypes' => $assetTypes,
        ]);
    }

    public function assetTypesStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ]);

        DB::table('typefixedasset')->insert([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('settings.asset-types.list');
    }

    public function assetTypesUpdate(Request $request, int $typefixedasset): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ]);

        DB::table('typefixedasset')
            ->where('idtypefixedasset', $typefixedasset)
            ->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
            ]);

        return redirect()->route('settings.asset-types.list');
    }
}
