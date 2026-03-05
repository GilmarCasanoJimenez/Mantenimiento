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
                DB::raw('fa.asset_code as asset_code'),
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
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'fa.idagencie')
            ->leftJoin('people as p', 'p.idperson', '=', 'fa.idperson')
            ->leftJoin('hardware as hw', 'hw.idhardware', '=', 'fa.idhardware')
            ->select(
                'fa.idfixedasset',
                'fa.asset_code',
                'fa.brand',
                'fa.model',
                'fa.idhardware',
                'fa.idagencie',
                'fa.idperson',
                'fa.location',
                DB::raw('COALESCE(ag.name, "-") as agencie_name'),
                DB::raw('COALESCE(p.name, "-") as person_name'),
                DB::raw('COALESCE(p.employment, "") as person_employment'),
                DB::raw('tfa.name as type_name'),
                DB::raw('COALESCE(tfa.is_informatic, 0) as type_is_informatic'),
                DB::raw('hw.processor as hardware_processor'),
                DB::raw('hw.ram as hardware_ram'),
                DB::raw('hw.motherboard as hardware_motherboard'),
                DB::raw('hw.graphicscard as hardware_graphicscard'),
                DB::raw('hw.ssddisk as hardware_ssddisk'),
                DB::raw('hw.hdddisk as hardware_hdddisk')
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

        return Inertia::render('Maintenance/List', [
            'maintenances' => $maintenances,
            'hardwareMaintenances' => $hardwareMaintenances,
            'fixedAssets' => $fixedAssets,
            'agencies' => $agencies,
            'people' => $people,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'idhardwaremaintenance' => ['nullable', 'integer', 'exists:hardwaremaintenance,idhardwaremaintenance'],
            'type' => ['required', 'string', 'max:45'],
            'idfixedasset' => ['required', 'integer', 'exists:fixedasset,idfixedasset'],
            'date' => ['required', 'date'],
            'diagnostic' => ['required', 'string', 'max:300'],
            'workdone' => ['required', 'string', 'max:300'],
            'observation' => ['required', 'string', 'max:300'],
            'idagencie' => ['required', 'integer', 'exists:agencies,idagencie'],
            'location' => ['required', 'string', 'max:45'],
            'idperson' => ['required', 'integer', 'exists:people,idperson'],
            'processor' => ['nullable', 'string', 'max:45'],
            'ram' => ['nullable', 'string', 'max:45'],
            'motherboard' => ['nullable', 'string', 'max:45'],
            'graphicscard' => ['nullable', 'string', 'max:45'],
            'ssddisk' => ['nullable', 'string', 'max:45'],
            'hdddisk' => ['nullable', 'string', 'max:45'],
        ]);

        $userId = $request->user()?->id;

        if (! $userId) {
            abort(403);
        }

        $asset = DB::table('fixedasset as fa')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->where('fa.idfixedasset', $validated['idfixedasset'])
            ->select('fa.idfixedasset', 'fa.idhardware', DB::raw('COALESCE(tfa.is_informatic, 0) as type_is_informatic'))
            ->first();

        if (! $asset) {
            abort(404);
        }

        $isInformatic = (bool) ($asset->type_is_informatic ?? false);
        $currentHardware = null;
        $networkSnapshot = $this->loadNetworkSnapshotForAsset((int) $validated['idfixedasset']);

        if ($isInformatic) {
            if (! $asset->idhardware) {
                return redirect()
                    ->back()
                    ->withErrors(['idfixedasset' => 'El activo informático no tiene hardware asociado.'])
                    ->withInput();
            }

            $currentHardware = DB::table('hardware')
                ->where('idhardware', $asset->idhardware)
                ->first(['idhardware', 'processor', 'ram', 'motherboard', 'graphicscard', 'ssddisk', 'hdddisk']);

            if (! $currentHardware) {
                return redirect()
                    ->back()
                    ->withErrors(['idfixedasset' => 'No se encontraron datos de hardware para este activo.'])
                    ->withInput();
            }
        }

        DB::transaction(function () use ($validated, $isInformatic, $currentHardware, $networkSnapshot, $userId): void {
            if ($isInformatic && $currentHardware) {
                $hardwareMaintenanceId = $this->createHardwareMaintenanceSnapshot([
                    'processor' => $currentHardware->processor,
                    'ram' => $currentHardware->ram,
                    'motherboard' => $currentHardware->motherboard,
                    'graphicscard' => $currentHardware->graphicscard,
                    'ssddisk' => $currentHardware->ssddisk,
                    'hdddisk' => $currentHardware->hdddisk,
                ]);

                $newHardware = [
                    'processor' => $validated['processor'] ?? $currentHardware->processor,
                    'ram' => $validated['ram'] ?? $currentHardware->ram,
                    'motherboard' => $validated['motherboard'] ?? $currentHardware->motherboard,
                    'graphicscard' => $validated['graphicscard'] ?? $currentHardware->graphicscard,
                    'ssddisk' => $validated['ssddisk'] ?? $currentHardware->ssddisk,
                    'hdddisk' => $validated['hdddisk'] ?? $currentHardware->hdddisk,
                ];

                $hasHardwareChanges = $this->hardwareValueChanged($currentHardware->processor, $newHardware['processor'])
                    || $this->hardwareValueChanged($currentHardware->ram, $newHardware['ram'])
                    || $this->hardwareValueChanged($currentHardware->motherboard, $newHardware['motherboard'])
                    || $this->hardwareValueChanged($currentHardware->graphicscard, $newHardware['graphicscard'])
                    || $this->hardwareValueChanged($currentHardware->ssddisk, $newHardware['ssddisk'])
                    || $this->hardwareValueChanged($currentHardware->hdddisk, $newHardware['hdddisk']);

                if ($hasHardwareChanges) {
                    DB::table('hardware')
                        ->where('idhardware', $currentHardware->idhardware)
                        ->update([
                            'processor' => $newHardware['processor'],
                            'ram' => $newHardware['ram'],
                            'motherboard' => $newHardware['motherboard'] ?: null,
                            'graphicscard' => $newHardware['graphicscard'] ?: null,
                            'ssddisk' => $newHardware['ssddisk'] ?: null,
                            'hdddisk' => $newHardware['hdddisk'] ?: null,
                            'updated_at' => now(),
                        ]);
                }
            } else {
                $hardwareMaintenanceId = $this->createHardwareMaintenanceSnapshot([
                    'processor' => 'N/A',
                    'ram' => '0',
                    'motherboard' => 'N/A',
                    'graphicscard' => 'N/A',
                    'ssddisk' => '0',
                    'hdddisk' => '0',
                ]);
            }

            DB::table('maintenance')->insert([
                'idhardwaremaintenance' => $hardwareMaintenanceId,
                'type' => $validated['type'],
                'idfixedasset' => $validated['idfixedasset'],
                'date' => $validated['date'],
                'diagnostic' => $validated['diagnostic'],
                'workdone' => $validated['workdone'],
                'observation' => $validated['observation'],
                'idagencie' => $validated['idagencie'],
                'location' => $validated['location'],
                'ipadress' => $networkSnapshot['ipadress'],
                'hostname' => $networkSnapshot['hostname'],
                'idperson' => $validated['idperson'],
                'iduser' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

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
        ]);

        $userId = $request->user()?->id;

        if (! $userId) {
            abort(403);
        }

        $networkSnapshot = $this->loadNetworkSnapshotForAsset((int) $validated['idfixedasset']);

        DB::table('maintenance')
            ->where('idmaintenance', $maintenance)
            ->update([
                ...$validated,
                'ipadress' => $networkSnapshot['ipadress'],
                'hostname' => $networkSnapshot['hostname'],
                'iduser' => $userId,
                'updated_at' => now(),
            ]);

        return redirect()->route('maintenance.list');
    }

    public function report(int $maintenance)
    {
        $item = DB::table('maintenance as m')
            ->leftJoin('hardwaremaintenance as hm', 'hm.idhardwaremaintenance', '=', 'm.idhardwaremaintenance')
            ->leftJoin('fixedasset as fa', 'fa.idfixedasset', '=', 'm.idfixedasset')
            ->leftJoin('hardware as hw', 'hw.idhardware', '=', 'fa.idhardware')
            ->leftJoin('networks as nw', 'nw.idnetwork', '=', 'hw.idnetwork')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'm.idagencie')
            ->leftJoin('people as p', 'p.idperson', '=', 'm.idperson')
            ->leftJoin('users as u', 'u.id', '=', 'm.iduser')
            ->leftJoin('people as up', 'up.idperson', '=', 'u.idperson')
            ->select(
                'm.idmaintenance',
                'm.type',
                'm.date',
                'm.created_at as maintenance_created_at',
                'm.diagnostic',
                'm.workdone',
                'm.observation',
                'm.location',
                'fa.idfixedasset',
                'fa.asset_code',
                'fa.datepurchase',
                'fa.brand',
                'fa.model',
                'fa.serial',
                'fa.color',
                DB::raw('COALESCE(tfa.name, "-") as asset_type_name'),
                DB::raw('COALESCE(ag.name, "-") as agencie_name'),
                DB::raw('COALESCE(p.name, "-") as responsible_name'),
                DB::raw('COALESCE(up.name, "Sin nombre") as maintenance_user_name'),
                DB::raw('COALESCE(hm.processor, hw.processor, "-") as processor'),
                DB::raw('COALESCE(hm.ram, hw.ram) as ram'),
                DB::raw('COALESCE(hm.ssddisk, hw.ssddisk) as ssddisk'),
                DB::raw('COALESCE(hm.hdddisk, hw.hdddisk) as hdddisk'),
                DB::raw('COALESCE(m.ipadress, nw.ipadress, "-") as ipadress'),
                DB::raw('COALESCE(m.hostname, nw.hostname, "-") as hostname')
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

    public function history(): Response
    {
        $maintenanceCounts = DB::table('maintenance')
            ->select('idfixedasset', DB::raw('COUNT(*) as maintenance_count'))
            ->groupBy('idfixedasset');

        $maintenanceWorkLog = DB::table('maintenance as m')
            ->select(
                'm.idfixedasset',
                DB::raw("GROUP_CONCAT(CONCAT(DATE_FORMAT(m.date, '%d/%m/%Y'), ' - ', COALESCE(m.workdone, '-')) ORDER BY m.date DESC, m.idmaintenance DESC SEPARATOR ' || ') as work_log"),
                DB::raw("GROUP_CONCAT(DATE_FORMAT(m.date, '%Y-%m-%d') ORDER BY m.date DESC, m.idmaintenance DESC SEPARATOR '||') as maintenance_dates")
            )
            ->groupBy('m.idfixedasset');

        $latestMaintenanceByAsset = DB::table('maintenance as m')
            ->select('m.idfixedasset', DB::raw('MAX(m.idmaintenance) as last_idmaintenance'))
            ->groupBy('m.idfixedasset');

        $history = DB::table('fixedasset as fa')
            ->leftJoin('people as cp', 'cp.idperson', '=', 'fa.idperson')
            ->joinSub($maintenanceCounts, 'mc', function ($join): void {
                $join->on('mc.idfixedasset', '=', 'fa.idfixedasset');
            })
            ->leftJoinSub($maintenanceWorkLog, 'wl', function ($join): void {
                $join->on('wl.idfixedasset', '=', 'fa.idfixedasset');
            })
            ->leftJoinSub($latestMaintenanceByAsset, 'lm', function ($join): void {
                $join->on('lm.idfixedasset', '=', 'fa.idfixedasset');
            })
            ->leftJoin('maintenance as ml', 'ml.idmaintenance', '=', 'lm.last_idmaintenance')
            ->leftJoin('users as u', 'u.id', '=', 'ml.iduser')
            ->leftJoin('people as up', 'up.idperson', '=', 'u.idperson')
            ->select(
                'fa.idfixedasset',
                DB::raw('fa.asset_code as asset_code'),
                DB::raw('COALESCE(fa.description, "-") as asset_description'),
                DB::raw('COALESCE(cp.name, "-") as current_person_name'),
                DB::raw('COALESCE(mc.maintenance_count, 0) as maintenance_count'),
                DB::raw('COALESCE(wl.work_log, "-") as work_log'),
                DB::raw('COALESCE(wl.maintenance_dates, "") as maintenance_dates'),
                DB::raw('COALESCE(up.name, "Sin nombre") as user_name')
            )
            ->orderBy('fa.asset_code')
            ->get();

        return Inertia::render('Maintenance/History', [
            'history' => $history,
        ]);
    }

    private function createHardwareMaintenanceSnapshot(array $hardwareData): int
    {
        return (int) DB::table('hardwaremaintenance')->insertGetId([
            'processor' => $this->normalizeHardwareText($hardwareData['processor'] ?? null, 'N/A'),
            'ram' => $this->normalizeHardwareText($hardwareData['ram'] ?? null, '0'),
            'motherboard' => $this->normalizeHardwareText($hardwareData['motherboard'] ?? null, 'N/A'),
            'graphicscard' => $this->normalizeHardwareText($hardwareData['graphicscard'] ?? $hardwareData['graphiccard'] ?? null, 'N/A'),
            'ssddisk' => $this->normalizeHardwareText($hardwareData['ssddisk'] ?? null, '0'),
            'hdddisk' => $this->normalizeHardwareText($hardwareData['hdddisk'] ?? null, '0'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function normalizeHardwareText(mixed $value, string $default): string
    {
        $text = trim((string) ($value ?? ''));

        return $text !== '' ? $text : $default;
    }

    private function hardwareValueChanged(mixed $current, mixed $new): bool
    {
        return trim((string) ($current ?? '')) !== trim((string) ($new ?? ''));
    }

    private function loadNetworkSnapshotForAsset(int $fixedAssetId): array
    {
        $network = DB::table('fixedasset as fa')
            ->leftJoin('hardware as hw', 'hw.idhardware', '=', 'fa.idhardware')
            ->leftJoin('networks as nw', 'nw.idnetwork', '=', 'hw.idnetwork')
            ->where('fa.idfixedasset', $fixedAssetId)
            ->first(['nw.ipadress', 'nw.hostname']);

        return [
            'ipadress' => $network?->ipadress,
            'hostname' => $network?->hostname,
        ];
    }
}
