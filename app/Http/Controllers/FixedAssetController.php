<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FixedAssetController extends Controller
{
    public function create(): Response
    {
        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name', 'is_informatic')
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
        $informaticCreation = session()->pull('informatic_creation');

        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name', 'is_informatic')
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
            ->leftJoin('hardware as hw', 'hw.idhardware', '=', 'fa.idhardware')
            ->leftJoin('networks as nw', 'nw.idnetwork', '=', 'hw.idnetwork')
            ->select(
                'fa.idfixedasset',
                'fa.asset_code',
                'fa.idtypefixedasset',
                'fa.idagencie',
                'fa.idperson',
                'fa.datepurchase',
                'fa.brand',
                'fa.model',
                'fa.description',
                'fa.color',
                'fa.serial',
                'fa.location',
                'fa.state',
                'fa.updated_at',
                'fa.idhardware',
                DB::raw('tfa.name as type_name'),
                DB::raw('tfa.is_informatic as type_is_informatic'),
                DB::raw('ag.name as agencie_name'),
                DB::raw('p.name as person_name'),
                DB::raw('nw.username as network_username'),
                DB::raw('nw.segment as network_segment'),
                DB::raw('nw.ipadress as network_ipadress'),
                DB::raw('nw.hostname as network_hostname'),
                DB::raw('nw.operativesystem as network_operativesystem'),
                DB::raw('nw.antivirus as network_antivirus'),
                DB::raw('hw.processor as hardware_processor'),
                DB::raw('hw.ram as hardware_ram'),
                DB::raw('hw.motherboard as hardware_motherboard'),
                DB::raw('hw.graphicscard as hardware_graphicscard'),
                DB::raw('hw.ssddisk as hardware_ssddisk'),
                DB::raw('hw.hdddisk as hardware_hdddisk')
            )
            ->orderByDesc('fa.idfixedasset')
            ->get();

        return Inertia::render('FixedAsset/List', [
            'assetTypes' => $assetTypes,
            'agencies' => $agencies,
            'people' => $people,
            'fixedAssets' => $fixedAssets,
            'informaticCreation' => $informaticCreation,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'asset_code' => ['required', 'string', 'max:45', 'unique:fixedasset,asset_code'],
            'idtypefixedasset' => ['required', 'integer', 'exists:typefixedasset,idtypefixedasset'],
            'datepurchase' => ['required', 'date'],
            'brand' => ['required', 'string', 'max:45'],
            'model' => ['nullable', 'string', 'max:45'],
            'description' => ['nullable', 'string', 'max:300'],
            'idhardware' => ['nullable', 'integer', 'exists:hardware,idhardware'],
            'color' => ['required', 'string', 'max:45'],
            'serial' => ['nullable', 'string', 'max:45'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
        ]);

        $selectedType = DB::table('typefixedasset')
            ->where('idtypefixedasset', $validated['idtypefixedasset'])
            ->first(['is_informatic']);

        if (! $selectedType || ! (bool) $selectedType->is_informatic) {
            $validated['idhardware'] = null;
        }

        $newFixedAssetId = DB::table('fixedasset')->insertGetId([
            'asset_code' => $validated['asset_code'],
            'idtypefixedasset' => $validated['idtypefixedasset'],
            'datepurchase' => $validated['datepurchase'],
            'brand' => $validated['brand'],
            'model' => $validated['model'] ?? null,
            'description' => $validated['description'] ?? null,
            'idhardware' => $validated['idhardware'] ?? null,
            'color' => $validated['color'],
            'serial' => $validated['serial'] ?? null,
            'idagencie' => $validated['idagencie'],
            'location' => $validated['location'],
            'idperson' => $validated['idperson'],
            'state' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ((bool) $selectedType?->is_informatic) {
            return redirect()
                ->route('fixedasset.list')
                ->with('informatic_creation', [
                    'idfixedasset' => $newFixedAssetId,
                    'asset_code' => $validated['asset_code'],
                ]);
        }

        return redirect()->route('fixedasset.list');
    }

    public function storeInformaticDetails(Request $request, int $fixedasset): RedirectResponse
    {
        $asset = DB::table('fixedasset as fa')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->where('fa.idfixedasset', $fixedasset)
            ->select('fa.idfixedasset', 'fa.idhardware', DB::raw('tfa.is_informatic as type_is_informatic'))
            ->first();

        if (! $asset) {
            abort(404);
        }

        if (! (bool) ($asset->type_is_informatic ?? false)) {
            return redirect()->route('fixedasset.list');
        }

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:75'],
            'segment' => ['required', 'string', 'max:15'],
            'ipadress' => ['required', 'string', 'max:15'],
            'hostname' => ['required', 'string', 'max:14'],
            'operativesystem' => ['required', 'string', 'max:75'],
            'antivirus' => ['required', 'string', 'max:75'],
            'processor' => ['required', 'string', 'max:45'],
            'ram' => ['required', 'string', 'max:45'],
            'motherboard' => ['nullable', 'string', 'max:45'],
            'graphicscard' => ['nullable', 'string', 'max:45'],
            'ssddisk' => ['nullable', 'string', 'max:45'],
            'hdddisk' => ['nullable', 'string', 'max:45'],
        ]);

        DB::transaction(function () use ($asset, $fixedasset, $validated) {
            $networkPayload = [
                'username' => $validated['username'],
                'segment' => $validated['segment'],
                'ipadress' => $validated['ipadress'],
                'hostname' => $validated['hostname'],
                'operativesystem' => $validated['operativesystem'],
                'antivirus' => $validated['antivirus'],
            ];

            if ($asset->idhardware) {
                $hardware = DB::table('hardware')
                    ->where('idhardware', $asset->idhardware)
                    ->first(['idhardware', 'idnetwork']);

                if ($hardware && $hardware->idnetwork) {
                    DB::table('networks')
                        ->where('idnetwork', $hardware->idnetwork)
                        ->update($networkPayload);

                    DB::table('hardware')
                        ->where('idhardware', $hardware->idhardware)
                        ->update([
                            'processor' => $validated['processor'],
                            'ram' => $validated['ram'],
                            'motherboard' => $validated['motherboard'] ?? null,
                            'graphicscard' => $validated['graphicscard'] ?? null,
                            'ssddisk' => $validated['ssddisk'] ?? null,
                            'hdddisk' => $validated['hdddisk'] ?? null,
                            'updated_at' => now(),
                        ]);

                    return;
                }
            }

            $networkId = DB::table('networks')->insertGetId($networkPayload);

            $hardwareId = DB::table('hardware')->insertGetId([
                'processor' => $validated['processor'],
                'ram' => $validated['ram'],
                'motherboard' => $validated['motherboard'] ?? null,
                'graphicscard' => $validated['graphicscard'] ?? null,
                'ssddisk' => $validated['ssddisk'] ?? null,
                'hdddisk' => $validated['hdddisk'] ?? null,
                'idnetwork' => $networkId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('fixedasset')
                ->where('idfixedasset', $fixedasset)
                ->update([
                    'idhardware' => $hardwareId,
                    'updated_at' => now(),
                ]);
        });

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
            'asset_code' => [
                'required',
                'string',
                'max:45',
                Rule::unique('fixedasset', 'asset_code')->ignore($fixedasset, 'idfixedasset'),
            ],
            'idtypefixedasset' => ['required', 'integer', 'exists:typefixedasset,idtypefixedasset'],
            'datepurchase' => ['required', 'date'],
            'brand' => ['required', 'string', 'max:45'],
            'model' => ['nullable', 'string', 'max:45'],
            'description' => ['nullable', 'string', 'max:300'],
            'idhardware' => ['nullable', 'integer', 'exists:hardware,idhardware'],
            'color' => ['required', 'string', 'max:45'],
            'serial' => ['nullable', 'string', 'max:45'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'state' => ['required', 'integer', 'in:0,1'],
        ]);

        $selectedType = DB::table('typefixedasset')
            ->where('idtypefixedasset', $validated['idtypefixedasset'])
            ->first(['is_informatic']);

        if (! $selectedType || ! (bool) $selectedType->is_informatic) {
            $validated['idhardware'] = null;
        }

        DB::table('fixedasset')
            ->where('idfixedasset', $fixedasset)
            ->update([
                'asset_code' => $validated['asset_code'],
                'idtypefixedasset' => $validated['idtypefixedasset'],
                'datepurchase' => $validated['datepurchase'],
                'brand' => $validated['brand'],
                'model' => $validated['model'] ?? null,
                'description' => $validated['description'] ?? null,
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
