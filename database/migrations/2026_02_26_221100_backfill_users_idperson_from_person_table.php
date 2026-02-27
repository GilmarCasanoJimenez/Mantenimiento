<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("\n            UPDATE users u\n            INNER JOIN person p ON p.iduser = u.id\n            SET u.idperson = p.idperson\n            WHERE u.idperson IS NULL\n        ");
    }

    public function down(): void
    {
        DB::statement("\n            UPDATE users\n            SET idperson = NULL\n        ");
    }
};
