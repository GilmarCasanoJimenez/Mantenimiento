<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('networks', function (Blueprint $table) {
            $table->id();
            $table->string('username', 75);
            $table->string('segmente',11);
            $table->string('ipadress', 11);
            $table->string('hostname',14);
            $table->string('operativesystem',75);
            $table->string('antivirus',75);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('networks');
    }
};
