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
        Schema::create('fixedasset', function (Blueprint $table) {
            $table->id();
            $table->date('datepurchase');
            $table->string('brand');
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->string('serial')->nullable();
            $table->string('location')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixedasset');
    }
};
