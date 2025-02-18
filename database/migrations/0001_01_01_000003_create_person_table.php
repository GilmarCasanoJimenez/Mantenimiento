<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePersonTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('person', function (Blueprint $table) {
            $table->id('idperson'); // Columna autoincremental `idperson`
            $table->string('name', 45)->nullable(false); // Columna `name` (NOT NULL)
            $table->string('employment', 45)->nullable(false); // Columna `employment` (NOT NULL)
            $table->unsignedBigInteger('iduser')->nullable(); // Columna `iduser` (puede ser NULL)
            $table->tinyInteger('state')->nullable(); // Columna `state` (puede ser NULL)
            $table->timestamps(); // Opcional: añade `created_at` y `updated_at`

            // Definir clave única para `idperson`
            $table->unique('idperson', 'idperson_UNIQUE');

            // Definir clave foránea para `iduser` que referencia la tabla `user`
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
        Schema::dropIfExists('person');
    }
};
