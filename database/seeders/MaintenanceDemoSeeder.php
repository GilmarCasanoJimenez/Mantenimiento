<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MaintenanceDemoSeeder extends Seeder
{
    public function run(): void
    {
        $hardwareIds = DB::table('hardwaremaintenance')->pluck('idhardwaremaintenance')->all();

        if (empty($hardwareIds)) {
            $hardwareRows = [
                ['processor' => 'Intel Core i5 10400', 'ram' => 0.08, 'motherboard' => 'ASUS PRIME H510M', 'graphiccard' => 'Intel UHD', 'ssddisk' => 256.00, 'hdddisk' => 1000.00],
                ['processor' => 'Intel Core i7 10700', 'ram' => 0.16, 'motherboard' => 'Gigabyte B460M', 'graphiccard' => 'NVIDIA GTX 1650', 'ssddisk' => 512.00, 'hdddisk' => 1000.00],
                ['processor' => 'AMD Ryzen 5 5600G', 'ram' => 0.16, 'motherboard' => 'MSI B550M PRO', 'graphiccard' => 'Radeon Vega', 'ssddisk' => 512.00, 'hdddisk' => 0.00],
                ['processor' => 'Intel Core i3 10100', 'ram' => 0.08, 'motherboard' => 'ASRock H410M', 'graphiccard' => 'Intel UHD', 'ssddisk' => 240.00, 'hdddisk' => 500.00],
            ];

            foreach ($hardwareRows as $row) {
                DB::table('hardwaremaintenance')->insert([
                    ...$row,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $hardwareIds = DB::table('hardwaremaintenance')->pluck('idhardwaremaintenance')->all();
        }

        $assets = DB::table('fixedasset')
            ->select('idfixedasset', 'idagencie', 'idperson', 'location')
            ->whereNotNull('idagencie')
            ->whereNotNull('idperson')
            ->get();

        if ($assets->isEmpty()) {
            $this->command?->warn('No hay activos con agencia y responsable para crear mantenimientos demo.');
            return;
        }

        $usersByPerson = DB::table('users')
            ->whereNotNull('idperson')
            ->select('id', 'idperson')
            ->get()
            ->groupBy('idperson');

        $fallbackUserId = DB::table('users')->value('id');

        if (! $fallbackUserId) {
            $this->command?->warn('No hay usuarios para asignar a mantenimientos demo.');
            return;
        }

        $types = ['Preventivo', 'Correctivo', 'Actualización', 'Limpieza'];
        $diagnostics = [
            'Lentitud general del equipo',
            'Falla de arranque intermitente',
            'Ruido en ventilación',
            'Error en red y conectividad',
            'Pantalla con parpadeo ocasional',
        ];
        $works = [
            'Se realizó limpieza interna y optimización del sistema',
            'Se reemplazó componente defectuoso y se validó funcionamiento',
            'Se actualizaron controladores y parches del sistema',
            'Se ajustó configuración de red y políticas de seguridad',
            'Se ejecutaron pruebas funcionales y de rendimiento',
        ];
        $observations = [
            'Equipo estable después del mantenimiento',
            'Se recomienda revisión en 30 días',
            'Usuario conforme con el servicio',
            'Sin novedades críticas al cierre',
            'Revisar respaldo preventivo semanal',
        ];

        $rowsToInsert = [];
        $target = 24;

        for ($i = 0; $i < $target; $i++) {
            $asset = $assets->random();
            $personUsers = $usersByPerson->get($asset->idperson, collect());
            $chosenUserId = $personUsers->isNotEmpty()
                ? $personUsers->random()->id
                : $fallbackUserId;

            $date = now()->subDays(random_int(1, 220))->toDateString();

            $rowsToInsert[] = [
                'idhardwaremaintenance' => $hardwareIds[array_rand($hardwareIds)],
                'type' => $types[array_rand($types)],
                'idfixedasset' => $asset->idfixedasset,
                'date' => $date,
                'diagnostic' => $diagnostics[array_rand($diagnostics)],
                'workdone' => $works[array_rand($works)],
                'observation' => $observations[array_rand($observations)],
                'idagencie' => $asset->idagencie,
                'location' => $asset->location,
                'idperson' => $asset->idperson,
                'iduser' => $chosenUserId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('maintenance')->insert($rowsToInsert);

        $this->command?->info('Mantenimientos demo creados: '.count($rowsToInsert));
    }
}
