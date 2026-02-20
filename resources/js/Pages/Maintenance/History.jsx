import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function MaintenanceHistory({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Historial de Mantenimientos</h2>}
        >
            <Head title="Historial de Mantenimientos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <div className="p-6 text-gray-900 dark:text-gray-100">Aquí consultarás el historial de mantenimientos.</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
