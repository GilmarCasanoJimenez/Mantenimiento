<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable()->after('idperson');
        });

        DB::statement("\n            UPDATE users u\n            LEFT JOIN person p ON p.idperson = u.idperson\n            SET u.name = COALESCE(p.name, 'Usuario')\n            WHERE u.name IS NULL\n        ");
    }
};
