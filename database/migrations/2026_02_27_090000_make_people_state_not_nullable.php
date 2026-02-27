<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE people SET state = 0 WHERE state IS NULL");
        DB::statement("ALTER TABLE people MODIFY state TINYINT NOT NULL DEFAULT 1");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE people MODIFY state TINYINT NULL DEFAULT NULL");
    }
};
