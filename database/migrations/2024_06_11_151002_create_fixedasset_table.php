<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFixedassetTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fixedasset', function (Blueprint $table) {
            $table->id('idfixedasset'); // Columna autoincremental `idfixedasset`
            $table->unsignedBigInteger('idtypefixedasset')->nullable(false); // Columna `idtypefixedasset` (NOT NULL)
            $table->date('datepurchase')->nullable(false); // Columna `datepurchase` (NOT NULL)
            $table->string('brand', 45)->nullable(false); // Columna `brand` (NOT NULL)
            $table->string('model', 45)->nullable(false); // Columna `model` (NOT NULL)
            $table->unsignedBigInteger('idhardware')->nullable(); // Columna `idhardware` (puede ser NULL)
            $table->string('color', 45)->nullable(false); // Columna `color` (NOT NULL)
            $table->string('serial', 45)->nullable(); // Columna `serial` (puede ser NULL)
            $table->unsignedBigInteger('idagencie')->nullable(false); // Columna `idagencie` (NOT NULL)
            $table->string('location', 45)->nullable(false); // Columna `location` (NOT NULL)
            $table->unsignedBigInteger('idperson')->nullable(false); // Columna `idperson` (NOT NULL)
            $table->tinyInteger('state')->nullable(false); // Columna `state` (NOT NULL)
            $table->timestamps(); // Opcional: añade `created_at` y `updated_at`

            // Definir clave única para `idfixedasset`
            $table->unique('idfixedasset', 'idfixedasset_UNIQUE');

            // Definir claves foráneas
            $table->foreign('idtypefixedasset')->references('idtypefixedasset')->on('typefixedasset')->onDelete('cascade');
            $table->foreign('idhardware')->references('idhardware')->on('hardware')->onDelete('cascade');
            $table->foreign('idagencie')->references('idagencie')->on('agencies')->onDelete('cascade');
            $table->foreign('idperson')->references('idperson')->on('person')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fixedasset');
    }
};
