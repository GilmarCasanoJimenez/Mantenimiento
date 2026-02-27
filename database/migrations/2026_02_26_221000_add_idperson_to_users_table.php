<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('idperson')->nullable()->after('id');
            $table->unique('idperson', 'users_idperson_unique');
            $table->foreign('idperson', 'users_idperson_foreign')
                ->references('idperson')
                ->on('person')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('users_idperson_foreign');
            $table->dropUnique('users_idperson_unique');
            $table->dropColumn('idperson');
        });
    }
};
