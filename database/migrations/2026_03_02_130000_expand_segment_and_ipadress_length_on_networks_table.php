<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE networks MODIFY segment VARCHAR(15) NOT NULL');
        DB::statement('ALTER TABLE networks MODIFY ipadress VARCHAR(15) NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE networks MODIFY segment VARCHAR(11) NOT NULL');
        DB::statement('ALTER TABLE networks MODIFY ipadress VARCHAR(11) NOT NULL');
    }
};
