<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Keep this migration MySQL-oriented because the existing project schema uses raw ALTER TABLE in several migrations.
        DB::statement('ALTER TABLE hardwaremaintenance CHANGE graphiccard graphicscard VARCHAR(45) NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY ram VARCHAR(45) NOT NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY motherboard VARCHAR(45) NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY ssddisk VARCHAR(45) NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY hdddisk VARCHAR(45) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE hardwaremaintenance CHANGE graphicscard graphiccard VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY ram DECIMAL(2,0) NOT NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY motherboard VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY ssddisk DECIMAL(8,2) NOT NULL');
        DB::statement('ALTER TABLE hardwaremaintenance MODIFY hdddisk DECIMAL(8,2) NOT NULL');
    }
};
