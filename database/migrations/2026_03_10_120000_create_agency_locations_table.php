<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agency_locations', function (Blueprint $table) {
            $table->id('idagencylocation');
            $table->unsignedBigInteger('idagencie');
            $table->string('name', 45);
            $table->timestamps();

            $table->foreign('idagencie')->references('idagencie')->on('agencies')->onDelete('cascade');
            $table->unique(['idagencie', 'name']);
        });

        $agencies = DB::table('agencies')->select('idagencie', 'localitation')->get();

        foreach ($agencies as $agency) {
            $locations = collect(preg_split('/[\r\n,;]+/', (string) ($agency->localitation ?? '')) ?: [])
                ->map(fn ($item) => trim((string) $item))
                ->filter(fn ($item) => $item !== '')
                ->unique()
                ->values();

            foreach ($locations as $location) {
                DB::table('agency_locations')->insert([
                    'idagencie' => $agency->idagencie,
                    'name' => mb_substr($location, 0, 45),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $fixedAssetLocations = DB::table('fixedasset')
            ->select('idagencie', 'location')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->distinct()
            ->get();

        foreach ($fixedAssetLocations as $row) {
            $name = mb_substr(trim((string) $row->location), 0, 45);
            if ($name === '') {
                continue;
            }

            DB::table('agency_locations')->updateOrInsert(
                ['idagencie' => $row->idagencie, 'name' => $name],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('agency_locations');
    }
};
