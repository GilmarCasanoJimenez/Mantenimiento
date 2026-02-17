<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $people = DB::table('person')
            ->select('idperson', 'name', 'employment', 'state', 'created_at')
            ->orderBy('name')
            ->get();

        $assetTypesByCount = DB::table('fixedasset as fa')
            ->join('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->select('tfa.idtypefixedasset', 'tfa.name', DB::raw('COUNT(fa.idfixedasset) as total'))
            ->groupBy('tfa.idtypefixedasset', 'tfa.name')
            ->orderByDesc('total')
            ->get();

        $assetsWithMaintenanceByType = DB::table('maintenance as m')
            ->join('fixedasset as fa', 'fa.idfixedasset', '=', 'm.idfixedasset')
            ->join('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->select('tfa.idtypefixedasset', 'tfa.name', DB::raw('COUNT(DISTINCT fa.idfixedasset) as total'))
            ->groupBy('tfa.idtypefixedasset', 'tfa.name')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('Dashboard', [
            'peopleSummary' => [
                'total' => $people->count(),
                'items' => $people,
            ],
            'assetTypesByCount' => $assetTypesByCount,
            'assetsWithMaintenanceByType' => $assetsWithMaintenanceByType,
        ]);
    }
}
