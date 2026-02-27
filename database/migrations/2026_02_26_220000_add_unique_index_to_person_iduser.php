<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('person', function (Blueprint $table) {
            $table->unique('iduser', 'person_iduser_unique');
        });
    }

    public function down(): void
    {
        Schema::table('person', function (Blueprint $table) {
            $table->dropUnique('person_iduser_unique');
        });
    }
};
