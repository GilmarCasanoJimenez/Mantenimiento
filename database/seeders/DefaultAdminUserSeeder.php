<?php

namespace Database\Seeders;

use App\Models\Person;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DefaultAdminUserSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::query()->firstOrNew([
                'email' => 'admin@admin.com',
            ]);

            $user->password = Hash::make('Clave123*');
            $user->email_verified_at = now();
            $user->save();

            $person = $user->idperson
                ? Person::query()->find($user->idperson)
                : null;

            if (! $person) {
                $person = Person::query()->firstOrNew([
                    'name' => 'Administrador',
                    'employment' => 'Administrador',
                ]);
            }

            $person->name = 'Administrador';
            $person->employment = 'Administrador';
            $person->state = 1;
            $person->save();

            if (DB::getSchemaBuilder()->hasColumn('users', 'idperson')) {
                DB::table('users')
                    ->where('id', $user->id)
                    ->update(['idperson' => $person->idperson]);
            }
        });
    }
}
