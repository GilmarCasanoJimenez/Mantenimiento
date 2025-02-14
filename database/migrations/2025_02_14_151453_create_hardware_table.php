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
        Schema::create('hardware', function (Blueprint $table) {
            // Clave primaria autoincremental
            $table->id('idhardware'); // Equivalente a `idhardware` INT AUTO_INCREMENT PRIMARY KEY

            // Columnas de la tabla
            $table->string('processor', 45); // Equivalente a `processor` VARCHAR(45) NOT NULL
            $table->string('ram', 45); // Equivalente a `ram` VARCHAR(45) NOT NULL
            $table->string('motherboard', 45)->nullable(); // Equivalente a `motherboard` VARCHAR(45) DEFAULT NULL
            $table->string('graphicscard', 45)->nullable(); // Equivalente a `graphicscard` VARCHAR(45) DEFAULT NULL
            $table->string('ssddisk', 45)->nullable(); // Equivalente a `ssddisk` VARCHAR(45) DEFAULT NULL
            $table->string('hdddisk', 45)->nullable(); // Equivalente a `hdddisk` VARCHAR(45) DEFAULT NULL
            $table->unsignedBigInteger('idnetwork'); // Equivalente a `idnetwork` INT NOT NULL

            // Clave única
            $table->unique('idhardware', 'idhardware_UNIQUE'); // Equivalente a UNIQUE KEY `idhardware_UNIQUE`

            // Clave foránea
            $table->foreign('idnetwork') // Define la clave foránea `idnetwork`
                  ->references('idnetwork') // Referencia a la columna `idnetwork` en la tabla `network`
                  ->on('networks') // Nombre de la tabla referenciada
                  ->onDelete('cascade'); // Define el comportamiento al eliminar (opcional)

            // Timestamps (opcional, pero recomendado)
            $table->timestamps(); // Agrega `created_at` y `updated_at`
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hardware');
    }
};