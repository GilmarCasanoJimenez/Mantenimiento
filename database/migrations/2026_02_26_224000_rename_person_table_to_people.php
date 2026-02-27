<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('person') && ! Schema::hasTable('people')) {
            Schema::rename('person', 'people');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('people') && ! Schema::hasTable('person')) {
            Schema::rename('people', 'person');
        }
    }
};
