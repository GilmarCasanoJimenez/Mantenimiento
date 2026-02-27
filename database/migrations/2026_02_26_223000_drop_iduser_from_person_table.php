<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('person', function (Blueprint $table) {
            $table->dropForeign(['iduser']);
            $table->dropUnique('person_iduser_unique');
            $table->dropColumn('iduser');
        });
    }

    public function down(): void
    {
        Schema::table('person', function (Blueprint $table) {
            $table->unsignedBigInteger('iduser')->nullable()->after('employment');
            $table->unique('iduser', 'person_iduser_unique');
            $table->foreign('iduser')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
