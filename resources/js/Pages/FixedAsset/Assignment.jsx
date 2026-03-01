import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import DatePickerInput from '@/Components/DatePickerInput';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function FixedAssetAssignment({ auth, assetTypes = [], agencies = [], people = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        idtypefixedasset: '',
        datepurchase: '',
        brand: '',
        model: '',
        color: '',
        serial: '',
        idagencie: '',
        location: '',
        idperson: '',
        state: '1',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('fixedasset.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Asignación de Activo</h2>}
        >
            <Head title="Asignación de Activo" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <form onSubmit={submit} className="p-4 space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="idtypefixedasset" value="Tipo de activo" />
                                    <select
                                        id="idtypefixedasset"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        value={data.idtypefixedasset}
                                        onChange={(event) => setData('idtypefixedasset', event.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        {assetTypes.map((item) => (
                                            <option key={item.idtypefixedasset} value={item.idtypefixedasset}>{item.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.idtypefixedasset} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="datepurchase" value="Fecha de compra" />
                                    <DatePickerInput
                                        id="datepurchase"
                                        value={data.datepurchase}
                                        onChange={(value) => setData('datepurchase', value)}
                                        placeholder="Selecciona fecha de compra"
                                    />
                                    <InputError message={errors.datepurchase} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="brand" value="Marca" />
                                    <TextInput
                                        id="brand"
                                        className="mt-1 block w-full"
                                        value={data.brand}
                                        onChange={(event) => setData('brand', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.brand} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="model" value="Modelo (opcional)" />
                                    <TextInput
                                        id="model"
                                        className="mt-1 block w-full"
                                        value={data.model}
                                        onChange={(event) => setData('model', event.target.value)}
                                    />
                                    <InputError message={errors.model} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="color" value="Color" />
                                    <TextInput
                                        id="color"
                                        className="mt-1 block w-full"
                                        value={data.color}
                                        onChange={(event) => setData('color', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.color} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="serial" value="Serial (opcional)" />
                                    <TextInput
                                        id="serial"
                                        className="mt-1 block w-full"
                                        value={data.serial}
                                        onChange={(event) => setData('serial', event.target.value)}
                                    />
                                    <InputError message={errors.serial} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="idagencie" value="Agencia" />
                                    <select
                                        id="idagencie"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        value={data.idagencie}
                                        onChange={(event) => setData('idagencie', event.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        {agencies.map((item) => (
                                            <option key={item.idagencie} value={item.idagencie}>{item.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.idagencie} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="location" value="Ubicación" />
                                    <TextInput
                                        id="location"
                                        className="mt-1 block w-full"
                                        value={data.location}
                                        onChange={(event) => setData('location', event.target.value)}
                                        required
                                    />
                                    <InputError message={errors.location} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="idperson" value="Funcionario responsable" />
                                    <select
                                        id="idperson"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        value={data.idperson}
                                        onChange={(event) => setData('idperson', event.target.value)}
                                        required
                                    >
                                        <option value="">Selecciona...</option>
                                        {people.map((item) => (
                                            <option key={item.idperson} value={item.idperson}>{`${item.name} - ${item.employment}`}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.idperson} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="state" value="Estado" />
                                    <select
                                        id="state"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        value={data.state}
                                        onChange={(event) => setData('state', event.target.value)}
                                        required
                                    >
                                        <option value="1">Activo</option>
                                        <option value="0">Inactivo</option>
                                    </select>
                                    <InputError message={errors.state} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <PrimaryButton disabled={processing}>Guardar activo</PrimaryButton>
                                <Link
                                    href={route('fixedasset.list')}
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
