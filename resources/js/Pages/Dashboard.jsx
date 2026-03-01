import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth, peopleSummary, assetTypesByCount, assetsWithMaintenanceByType }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Inicio</h2>}
        >
            <Head title="Inicio" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                            <div className="p-4 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-semibold">Vista general de personas registradas</h3>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Total de personas: {peopleSummary.total}</p>

                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nombre</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cargo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            {peopleSummary.items.map((person) => (
                                                <tr key={person.idperson}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{person.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{person.employment}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{person.state === 1 ? 'Activo' : 'Inactivo'}</td>
                                                </tr>
                                            ))}
                                            {peopleSummary.items.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" colSpan={3}>
                                                        No hay personas registradas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                            <div className="p-4 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-semibold">Tipos de activo con mayor cantidad</h3>
                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tipo de activo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            {assetTypesByCount.map((item) => (
                                                <tr key={item.idtypefixedasset}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{item.total}</td>
                                                </tr>
                                            ))}
                                            {assetTypesByCount.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" colSpan={2}>
                                                        No hay activos registrados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                            <div className="p-4 text-gray-900 dark:text-gray-100">
                                <h3 className="text-lg font-semibold">Activos con mantenimiento agrupados por tipo</h3>
                                <div className="mt-4 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tipo de activo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Activos con mantenimiento</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                            {assetsWithMaintenanceByType.map((item) => (
                                                <tr key={item.idtypefixedasset}>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{item.total}</td>
                                                </tr>
                                            ))}
                                            {assetsWithMaintenanceByType.length === 0 && (
                                                <tr>
                                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" colSpan={2}>
                                                        No hay mantenimientos registrados.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
