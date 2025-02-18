<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHardwaresoftwareTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hardwaresoftware', function (Blueprint $table) {
            $table->id('idhardwareSoftware'); // Esto crea un campo autoincremental
            $table->unsignedBigInteger('idhardware')->nullable(); // Campo idhardware
            $table->unsignedBigInteger('idsoftware')->nullable(); // Campo idsoftware
            $table->timestamps(); // Opcional: añade created_at y updated_at

            // Definir las claves foráneas
            $table->foreign('idhardware')->references('idhardware')->on('hardware')->onDelete('cascade');
            $table->foreign('idsoftware')->references('idsoftware')->on('software')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hardwaresoftware');
    }

};
