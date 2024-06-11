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
        Schema::create('hardwaremaintenances', function (Blueprint $table) {
            $table->id();
            $table->string('processor');
            $table->decimal('ram',2);
            $table->string('motherboard');
            $table->string('graphiccard');
            $table->decimal('ssddisk');
            $table->decimal('hdddisk');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hardwaremaintenances');
    }
};
