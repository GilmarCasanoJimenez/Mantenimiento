<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fixedasset', function (Blueprint $table) {
            if (DB::getDriverName() === 'mysql') {
                $table->string('asset_code', 45)->nullable()->after('idfixedasset');
            } else {
                $table->string('asset_code', 45)->nullable();
            }

            $table->unique('asset_code', 'fixedasset_asset_code_unique');
        });

        $assets = DB::table('fixedasset')
            ->select('idfixedasset', 'asset_code')
            ->orderBy('idfixedasset')
            ->get();

        foreach ($assets as $asset) {
            if (! empty($asset->asset_code)) {
                continue;
            }

            DB::table('fixedasset')
                ->where('idfixedasset', $asset->idfixedasset)
                ->update([
                    'asset_code' => 'AF-' . str_pad((string) $asset->idfixedasset, 6, '0', STR_PAD_LEFT),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('fixedasset', function (Blueprint $table) {
            $table->dropUnique('fixedasset_asset_code_unique');
            $table->dropColumn('asset_code');
        });
    }
};
