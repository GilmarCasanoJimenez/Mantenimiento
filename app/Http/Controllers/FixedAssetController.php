<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FixedAssetController extends Controller
{
    public function create(): Response
    {
        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name')
            ->orderBy('name')
            ->get();

        $agencies = DB::table('agencies')
            ->select('idagencie', 'name')
            ->orderBy('name')
            ->get();

        $people = DB::table('people')
            ->select('idperson', 'name', 'employment')
            ->orderBy('name')
            ->get();

        return Inertia::render('FixedAsset/Assignment', [
            'assetTypes' => $assetTypes,
            'agencies' => $agencies,
            'people' => $people,
        ]);
    }

    public function index(): Response
    {
        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name')
            ->orderBy('name')
            ->get();

        $agencies = DB::table('agencies')
            ->select('idagencie', 'name')
            ->orderBy('name')
            ->get();

        $people = DB::table('people')
            ->select('idperson', 'name', 'employment')
            ->orderBy('name')
            ->get();

        $fixedAssets = DB::table('fixedasset as fa')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'fa.idagencie')
            ->leftJoin('people as p', 'p.idperson', '=', 'fa.idperson')
            ->select(
                'fa.idfixedasset',
                'fa.idtypefixedasset',
                'fa.idagencie',
                'fa.idperson',
                'fa.datepurchase',
                'fa.brand',
                'fa.model',
                'fa.color',
                'fa.serial',
                'fa.location',
                'fa.state',
                'fa.updated_at',
                'fa.idhardware',
                DB::raw('tfa.name as type_name'),
                DB::raw('ag.name as agencie_name'),
                DB::raw('p.name as person_name')
            )
            ->orderByDesc('fa.idfixedasset')
            ->get();

        return Inertia::render('FixedAsset/List', [
            'assetTypes' => $assetTypes,
            'agencies' => $agencies,
            'people' => $people,
            'fixedAssets' => $fixedAssets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'idtypefixedasset' => ['required', 'integer', 'exists:typefixedasset,idtypefixedasset'],
            'datepurchase' => ['required', 'date'],
            'brand' => ['required', 'string', 'max:45'],
            'model' => ['nullable', 'string', 'max:45'],
            'idhardware' => ['nullable', 'integer', 'exists:hardware,idhardware'],
            'color' => ['required', 'string', 'max:45'],
            'serial' => ['nullable', 'string', 'max:45'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'state' => ['required', 'integer', 'in:0,1'],
        ]);

        DB::table('fixedasset')->insert([
            'idtypefixedasset' => $validated['idtypefixedasset'],
            'datepurchase' => $validated['datepurchase'],
            'brand' => $validated['brand'],
            'model' => $validated['model'] ?? null,
            'idhardware' => $validated['idhardware'] ?? null,
            'color' => $validated['color'],
            'serial' => $validated['serial'] ?? null,
            'idagencie' => $validated['idagencie'],
            'location' => $validated['location'],
            'idperson' => $validated['idperson'],
            'state' => (int) $validated['state'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('fixedasset.list');
    }

    public function update(Request $request, int $fixedasset): RedirectResponse
    {
        $exists = DB::table('fixedasset')
            ->where('idfixedasset', $fixedasset)
            ->exists();

        if (! $exists) {
            abort(404);
        }

        $validated = $request->validate([
            'idtypefixedasset' => ['required', 'integer', 'exists:typefixedasset,idtypefixedasset'],
            'datepurchase' => ['required', 'date'],
            'brand' => ['required', 'string', 'max:45'],
            'model' => ['nullable', 'string', 'max:45'],
            'idhardware' => ['nullable', 'integer', 'exists:hardware,idhardware'],
            'color' => ['required', 'string', 'max:45'],
            'serial' => ['nullable', 'string', 'max:45'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'state' => ['required', 'integer', 'in:0,1'],
        ]);

        DB::table('fixedasset')
            ->where('idfixedasset', $fixedasset)
            ->update([
                'idtypefixedasset' => $validated['idtypefixedasset'],
                'datepurchase' => $validated['datepurchase'],
                'brand' => $validated['brand'],
                'model' => $validated['model'] ?? null,
                'idhardware' => $validated['idhardware'] ?? null,
                'color' => $validated['color'],
                'serial' => $validated['serial'] ?? null,
                'idagencie' => $validated['idagencie'],
                'location' => $validated['location'],
                'idperson' => $validated['idperson'],
                'state' => (int) $validated['state'],
                'updated_at' => now(),
            ]);

        return redirect()->route('fixedasset.list');
    }

    public function toggleState(int $fixedasset): RedirectResponse
    {
        $asset = DB::table('fixedasset')
            ->where('idfixedasset', $fixedasset)
            ->first(['idfixedasset', 'state']);

        if (! $asset) {
            abort(404);
        }

        DB::table('fixedasset')
            ->where('idfixedasset', $fixedasset)
            ->update([
                'state' => (int) $asset->state === 1 ? 0 : 1,
                'updated_at' => now(),
            ]);

        return redirect()->route('fixedasset.list');
    }
}
