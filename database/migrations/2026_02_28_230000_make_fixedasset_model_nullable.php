<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE fixedasset MODIFY model VARCHAR(45) NULL');
    }

    public function down(): void
    {
        DB::statement("UPDATE fixedasset SET model = '' WHERE model IS NULL");
        DB::statement('ALTER TABLE fixedasset MODIFY model VARCHAR(45) NOT NULL');
    }
};
