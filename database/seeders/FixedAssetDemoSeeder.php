<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixedAssetDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $peopleIds = DB::table('people')
                ->pluck('idperson')
                ->values()
                ->all();

            if (count($peopleIds) === 0) {
                return;
            }

            if (DB::table('typefixedasset')->count() === 0) {
                DB::table('typefixedasset')->insert([
                    ['name' => 'Laptop', 'description' => 'Equipo portatil'],
                    ['name' => 'Desktop', 'description' => 'Equipo de escritorio'],
                    ['name' => 'Impresora', 'description' => 'Impresora de oficina'],
                    ['name' => 'Monitor', 'description' => 'Monitor externo'],
                    ['name' => 'UPS', 'description' => 'Sistema de alimentacion ininterrumpida'],
                ]);
            }

            if (DB::table('agencies')->count() === 0) {
                DB::table('agencies')->insert([
                    ['name' => 'Agencia Central', 'localitation' => 'Edificio Principal'],
                    ['name' => 'Agencia Norte', 'localitation' => 'Zona Norte'],
                    ['name' => 'Agencia Sur', 'localitation' => 'Zona Sur'],
                ]);
            }

            if (DB::table('fixedasset')->count() > 0) {
                return;
            }

            $typeIds = DB::table('typefixedasset')
                ->pluck('idtypefixedasset')
                ->values()
                ->all();

            $agencyIds = DB::table('agencies')
                ->pluck('idagencie')
                ->values()
                ->all();

            if (count($typeIds) === 0 || count($agencyIds) === 0) {
                return;
            }

            $brands = ['Dell', 'HP', 'Lenovo', 'Epson', 'LG', 'Samsung'];
            $colors = ['Negro', 'Gris', 'Blanco'];
            $now = now();
            $assets = [];

            for ($index = 1; $index <= 12; $index++) {
                $assets[] = [
                    'idtypefixedasset' => $typeIds[($index - 1) % count($typeIds)],
                    'datepurchase' => now()->subDays($index * 20)->toDateString(),
                    'brand' => $brands[($index - 1) % count($brands)],
                    'model' => 'Modelo-'.str_pad((string) $index, 3, '0', STR_PAD_LEFT),
                    'idhardware' => null,
                    'color' => $colors[($index - 1) % count($colors)],
                    'serial' => 'SN-FA-'.str_pad((string) $index, 5, '0', STR_PAD_LEFT),
                    'idagencie' => $agencyIds[($index - 1) % count($agencyIds)],
                    'location' => 'Oficina '.(($index % 4) + 1),
                    'idperson' => $peopleIds[($index - 1) % count($peopleIds)],
                    'state' => $index % 5 === 0 ? 0 : 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('fixedasset')->insert($assets);
        });
    }
}
