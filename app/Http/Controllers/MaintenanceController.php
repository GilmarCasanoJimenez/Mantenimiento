<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    public function index(): Response
    {
        $maintenances = DB::table('maintenance as m')
            ->leftJoin('hardwaremaintenance as hm', 'hm.idhardwaremaintenance', '=', 'm.idhardwaremaintenance')
            ->leftJoin('fixedasset as fa', 'fa.idfixedasset', '=', 'm.idfixedasset')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'm.idagencie')
            ->leftJoin('people as p', 'p.idperson', '=', 'm.idperson')
            ->leftJoin('users as u', 'u.id', '=', 'm.iduser')
            ->leftJoin('people as up', 'up.idperson', '=', 'u.idperson')
            ->select(
                'm.idmaintenance',
                'm.idhardwaremaintenance',
                'm.idfixedasset',
                'm.idagencie',
                'm.idperson',
                'm.iduser',
                'm.type',
                'm.date',
                'm.diagnostic',
                'm.workdone',
                'm.observation',
                'm.location',
                'm.updated_at',
                DB::raw('COALESCE(tfa.name, "-") as asset_type_name'),
                DB::raw('fa.brand as asset_brand'),
                DB::raw('fa.model as asset_model'),
                DB::raw('ag.name as agencie_name'),
                DB::raw('p.name as person_name'),
                DB::raw("COALESCE(up.name, 'Sin nombre') as user_name"),
                DB::raw('hm.processor as hardware_processor')
            )
            ->orderByDesc('m.idmaintenance')
            ->get();

        $hardwareMaintenances = DB::table('hardwaremaintenance')
            ->select('idhardwaremaintenance', 'processor')
            ->orderBy('processor')
            ->get();

        $fixedAssets = DB::table('fixedasset as fa')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->select(
                'fa.idfixedasset',
                'fa.brand',
                'fa.model',
                DB::raw('tfa.name as type_name')
            )
            ->orderByDesc('fa.idfixedasset')
            ->get();

        $agencies = DB::table('agencies')
            ->select('idagencie', 'name')
            ->orderBy('name')
            ->get();

        $people = DB::table('people')
            ->select('idperson', 'name', 'employment')
            ->orderBy('name')
            ->get();

        $users = DB::table('users as u')
            ->leftJoin('people as p', 'p.idperson', '=', 'u.idperson')
            ->select(
                'u.id',
                'u.email',
                DB::raw("COALESCE(p.name, 'Sin nombre') as name")
            )
            ->orderBy('name')
            ->get();

        return Inertia::render('Maintenance/List', [
            'maintenances' => $maintenances,
            'hardwareMaintenances' => $hardwareMaintenances,
            'fixedAssets' => $fixedAssets,
            'agencies' => $agencies,
            'people' => $people,
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'idhardwaremaintenance' => ['required', 'integer', 'exists:hardwaremaintenance,idhardwaremaintenance'],
            'type' => ['required', 'string', 'max:45'],
            'idfixedasset' => ['required', 'integer', 'exists:fixedasset,idfixedasset'],
            'date' => ['required', 'date'],
            'diagnostic' => ['required', 'string', 'max:300'],
            'workdone' => ['required', 'string', 'max:300'],
            'observation' => ['required', 'string', 'max:300'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'iduser' => ['required', 'integer', 'exists:users,id'],
        ]);

        DB::table('maintenance')->insert([
            ...$validated,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('maintenance.list');
    }

    public function update(Request $request, int $maintenance): RedirectResponse
    {
        $exists = DB::table('maintenance')
            ->where('idmaintenance', $maintenance)
            ->exists();

        if (! $exists) {
            abort(404);
        }

        $validated = $request->validate([
            'idhardwaremaintenance' => ['required', 'integer', 'exists:hardwaremaintenance,idhardwaremaintenance'],
            'type' => ['required', 'string', 'max:45'],
            'idfixedasset' => ['required', 'integer', 'exists:fixedasset,idfixedasset'],
            'date' => ['required', 'date'],
            'diagnostic' => ['required', 'string', 'max:300'],
            'workdone' => ['required', 'string', 'max:300'],
            'observation' => ['required', 'string', 'max:300'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'iduser' => ['required', 'integer', 'exists:users,id'],
        ]);

        DB::table('maintenance')
            ->where('idmaintenance', $maintenance)
            ->update([
                ...$validated,
                'updated_at' => now(),
            ]);

        return redirect()->route('maintenance.list');
    }

    public function report(int $maintenance)
    {
        $item = DB::table('maintenance as m')
            ->leftJoin('hardwaremaintenance as hm', 'hm.idhardwaremaintenance', '=', 'm.idhardwaremaintenance')
            ->leftJoin('fixedasset as fa', 'fa.idfixedasset', '=', 'm.idfixedasset')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'm.idagencie')
            ->leftJoin('people as p', 'p.idperson', '=', 'm.idperson')
            ->leftJoin('users as u', 'u.id', '=', 'm.iduser')
            ->leftJoin('people as up', 'up.idperson', '=', 'u.idperson')
            ->select(
                'm.idmaintenance',
                'm.type',
                'm.date',
                'm.diagnostic',
                'm.workdone',
                'm.observation',
                'm.location',
                'fa.idfixedasset',
                'fa.datepurchase',
                'fa.brand',
                'fa.model',
                'fa.serial',
                'fa.color',
                DB::raw('COALESCE(tfa.name, "-") as asset_type_name'),
                DB::raw('COALESCE(ag.name, "-") as agencie_name'),
                DB::raw('COALESCE(p.name, "-") as responsible_name'),
                DB::raw('COALESCE(up.name, "Sin nombre") as maintenance_user_name'),
                DB::raw('COALESCE(hm.processor, "-") as processor'),
                'hm.ram',
                'hm.ssddisk',
                'hm.hdddisk'
            )
            ->where('m.idmaintenance', $maintenance)
            ->first();

        if (! $item) {
            abort(404);
        }

        $type = mb_strtolower((string) $item->type);
        $isPreventive = str_contains($type, 'prevent');
        $isCorrective = str_contains($type, 'correct') || ! $isPreventive;

        return Pdf::loadView('pdf.maintenance-record', [
            'item' => $item,
            'isPreventive' => $isPreventive,
            'isCorrective' => $isCorrective,
        ])->setPaper('letter', 'portrait')
            ->stream("hoja-mantenimiento-{$maintenance}.pdf");
    }
}
