<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance', function (Blueprint $table): void {
            $table->string('ipadress', 15)->nullable()->after('location');
            $table->string('hostname', 45)->nullable()->after('ipadress');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance', function (Blueprint $table): void {
            $table->dropColumn(['ipadress', 'hostname']);
        });
    }
};
