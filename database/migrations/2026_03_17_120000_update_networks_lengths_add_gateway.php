<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('networks', function (Blueprint $table) {
            if (! Schema::hasColumn('networks', 'gateway')) {
                $table->string('gateway', 45)->default('-')->after('segment');
            }

            $table->string('segment', 45)->change();
            $table->string('ipadress', 45)->change();
            $table->string('hostname', 75)->change();
        });
    }

    public function down(): void
    {
        Schema::table('networks', function (Blueprint $table) {
            $table->string('segment', 11)->change();
            $table->string('ipadress', 11)->change();
            $table->string('hostname', 14)->change();

            if (Schema::hasColumn('networks', 'gateway')) {
                $table->dropColumn('gateway');
            }
        });
    }
};
