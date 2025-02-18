<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMaintenanceTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('maintenance', function (Blueprint $table) {
            $table->id('idmaintenance'); // Columna autoincremental `idmaintenance`
            $table->unsignedBigInteger('idhardwaremaintenance')->nullable(false); // Columna `idhardwaremaintenance` (NOT NULL)
            $table->string('type', 45)->nullable(false); // Columna `type` (NOT NULL)
            $table->unsignedBigInteger('idfixedasset')->nullable(false); // Columna `idfixedasset` (NOT NULL)
            $table->date('date')->nullable(false); // Columna `date` (NOT NULL)
            $table->string('diagnostic', 300)->nullable(false); // Columna `diagnostic` (NOT NULL)
            $table->string('workdone', 300)->nullable(false); // Columna `workdone` (NOT NULL)
            $table->string('observation', 300)->nullable(false); // Columna `observation` (NOT NULL)
            $table->unsignedBigInteger('idagencie')->nullable(false); // Columna `idagencie` (NOT NULL)
            $table->string('location', 45)->nullable(false); // Columna `location` (NOT NULL)
            $table->unsignedBigInteger('idperson')->nullable(false); // Columna `idperson` (NOT NULL)
            $table->unsignedBigInteger('iduser')->nullable(false); // Columna `iduser` (NOT NULL)
            $table->timestamps(); // Opcional: añade `created_at` y `updated_at`

            // Definir clave única para `idmaintenance`
            $table->unique('idmaintenance', 'idmaintenance_UNIQUE');

            // Definir claves foráneas
            $table->foreign('idhardwaremaintenance')->references('idhardwaremaintenance')->on('hardwaremaintenance')->onDelete('cascade');
            $table->foreign('idfixedasset')->references('idfixedasset')->on('fixedasset')->onDelete('cascade');
            $table->foreign('idagencie')->references('idagencie')->on('agencies')->onDelete('cascade');
            $table->foreign('idperson')->references('idperson')->on('person')->onDelete('cascade');
            $table->foreign('iduser')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('maintenance');
    }
};
