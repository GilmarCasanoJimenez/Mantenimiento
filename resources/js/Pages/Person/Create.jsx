import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function PersonCreate({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        employment: '',
        state: '1',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('person.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Crear funcionario</h2>}
        >
            <Head title="Crear funcionario" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <form onSubmit={submit} className="p-4 space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nombre" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="employment" value="Cargo" />
                                <TextInput
                                    id="employment"
                                    className="mt-1 block w-full"
                                    value={data.employment}
                                    onChange={(e) => setData('employment', e.target.value)}
                                    required
                                />
                                <InputError message={errors.employment} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="state" value="Estado" />
                                <select
                                    id="state"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                    value={data.state}
                                    onChange={(e) => setData('state', e.target.value)}
                                >
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                                <InputError message={errors.state} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-3">
                                <PrimaryButton disabled={processing}>Guardar</PrimaryButton>
                                <Link
                                    href={route('person.list')}
                                    className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-600"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
