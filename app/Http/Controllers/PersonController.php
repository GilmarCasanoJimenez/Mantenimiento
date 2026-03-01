<?php

namespace App\Http\Controllers;

use App\Models\Person;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class PersonController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Person/Create');
    }

    public function index(): Response
    {
        $persons = Person::query()
            ->leftJoin('users', 'users.idperson', '=', 'people.idperson')
            ->select('people.idperson', 'people.name', 'people.employment', 'people.state', 'people.created_at', 'people.updated_at', DB::raw('users.id as user_id'), DB::raw('users.email as user_email'))
            ->orderBy('name')
            ->get();

        $assignedAssets = DB::table('fixedasset as fa')
            ->leftJoin('typefixedasset as tfa', 'tfa.idtypefixedasset', '=', 'fa.idtypefixedasset')
            ->leftJoin('agencies as ag', 'ag.idagencie', '=', 'fa.idagencie')
            ->whereNotNull('fa.idperson')
            ->select(
                'fa.idperson',
                'fa.idfixedasset',
                DB::raw('tfa.name as type_name'),
                'fa.brand',
                'fa.model',
                'fa.serial',
                DB::raw('ag.name as agencie_name'),
                'fa.location',
                'fa.state'
            )
            ->orderBy('fa.idfixedasset')
            ->get()
            ->groupBy('idperson')
            ->map(fn ($items) => $items->values())
            ->toArray();

        return Inertia::render('Person/List', [
            'persons' => $persons,
            'assignedAssets' => $assignedAssets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:45'],
            'employment' => ['required', 'string', 'max:45'],
            'create_user' => ['nullable', 'boolean'],
            'email' => ['nullable', 'required_if:create_user,true', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'required_if:create_user,true', 'confirmed', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($validated): void {
            $person = Person::create([
                'name' => $validated['name'],
                'employment' => $validated['employment'],
                'state' => 1,
            ]);

            if (! empty($validated['create_user'])) {
                User::create([
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'idperson' => $person->idperson,
                ]);
            }
        });

        return redirect()->route('person.list');
    }

    public function edit(Person $person): Response
    {
        return Inertia::render('Person/Edit', [
            'person' => $person->only(['idperson', 'name', 'employment', 'state']),
        ]);
    }

    public function update(Request $request, Person $person): RedirectResponse
    {
        $person->load('user');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:45'],
            'employment' => ['required', 'string', 'max:45'],
            'create_user' => ['nullable', 'boolean'],
            'email' => [
                'nullable',
                'required_if:create_user,true',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($person->user?->id),
            ],
            'password' => [
                'nullable',
                Rule::requiredIf(fn () => $request->boolean('create_user') && ! $person->user),
                'confirmed',
                Rules\Password::defaults(),
            ],
        ]);

        DB::transaction(function () use ($validated, $person): void {
            $person->update([
                'name' => $validated['name'],
                'employment' => $validated['employment'],
            ]);

            if (! empty($validated['create_user'])) {
                if ($person->user) {
                    $person->user->email = $validated['email'];

                    if (! empty($validated['password'])) {
                        $person->user->password = Hash::make($validated['password']);
                    }

                    $person->user->save();
                } else {
                    User::create([
                        'email' => $validated['email'],
                        'password' => Hash::make($validated['password']),
                        'idperson' => $person->idperson,
                    ]);
                }
            }
        });

        return redirect()->route('person.list');
    }

    public function toggleState(Person $person): RedirectResponse
    {
        $person->state = $person->state === 1 ? 0 : 1;
        $person->save();

        return redirect()->route('person.list');
    }
}
