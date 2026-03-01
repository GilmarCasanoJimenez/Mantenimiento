import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function PersonEdit({ auth, person }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Modificar funcionario</h2>}
        >
            <Head title="Modificar funcionario" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <div className="p-4 text-gray-900 dark:text-gray-100 space-y-2">
                            <p><strong>ID:</strong> {person.idperson}</p>
                            <p><strong>Nombre:</strong> {person.name}</p>
                            <p><strong>Cargo:</strong> {person.employment}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Formulario de edición pendiente en el siguiente paso.</p>

                            <div className="pt-4">
                                <Link
                                    href={route('person.list')}
                                    className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-gray-600"
                                >
                                    Volver a la lista
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
