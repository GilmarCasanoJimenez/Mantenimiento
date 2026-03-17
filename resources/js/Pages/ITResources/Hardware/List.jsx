import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function List({ hardwareAssets = [] }) {
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [filters, setFilters] = useState({
        person: '',
        agency: '',
        processor: '',
    });

    const filteredAssets = hardwareAssets.filter((item) => {
        return (
            `${item.person_name ?? ''} ${item.network_username ?? ''}`.toLowerCase().includes(filters.person.toLowerCase())
            && (item.agencie_name ?? '').toLowerCase().includes(filters.agency.toLowerCase())
            && (item.processor ?? '').toLowerCase().includes(filters.processor.toLowerCase())
        );
    });

    const clearFilters = () => {
        setFilters({
            person: '',
            agency: '',
            processor: '',
        });
    };

    const toRow = (item) => [
        item.asset_code ?? `Activo #${item.idfixedasset}`,
        item.type_name ?? '-',
        item.brand ?? '-',
        item.model ?? '-',
        item.person_name ?? '-',
        item.network_username ?? '-',
        item.agencie_name ?? '-',
        item.processor ?? '-',
        item.ram ?? '-',
        item.motherboard ?? '-',
        item.graphicscard ?? '-',
        `SSD: ${item.ssddisk ?? '-'} | HDD: ${item.hdddisk ?? '-'}`,
        item.network_hostname ?? '-',
        item.network_ipadress ?? '-',
    ];

    const copyTableToClipboard = async () => {
        if (filteredAssets.length === 0) {
            setCopiedRowsCount(0);
            setShowCopyModal(true);
            return;
        }

        const headers = ['Activo', 'Tipo', 'Marca', 'Modelo', 'Funcionario', 'Usuario de red', 'Agencia', 'Procesador', 'RAM', 'Tarjeta madre', 'Grafica', 'Disco', 'Host', 'IP'];
        const text = [
            headers.join('\t'),
            ...filteredAssets.map((item) => toRow(item).join('\t')),
        ].join('\n');

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }

        setCopiedRowsCount(filteredAssets.length);
        setShowCopyModal(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Lista de Hardware
                </h2>
            }
        >
            <Head title="Lista de Hardware" />

            <PageContainer>
                <PageCard>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Hardware instalado en activos informaticos
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={copyTableToClipboard}
                                className="inline-flex items-center gap-1.5 rounded-md bg-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-slate-700"
                            >
                                Copiar tabla
                            </button>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                Total: {filteredAssets.length}
                            </span>
                        </div>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        <input
                            type="text"
                            value={filters.person}
                            onChange={(event) => setFilters((prev) => ({ ...prev, person: event.target.value }))}
                            placeholder="Filtrar por funcionario"
                            className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            value={filters.agency}
                            onChange={(event) => setFilters((prev) => ({ ...prev, agency: event.target.value }))}
                            placeholder="Filtrar por agencia"
                            className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            value={filters.processor}
                            onChange={(event) => setFilters((prev) => ({ ...prev, processor: event.target.value }))}
                            placeholder="Filtrar por procesador"
                            className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        />
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/40">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Activo</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Tipo</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Marca</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Modelo</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Funcionario</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Agencia</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Procesador</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">RAM</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Tarjeta madre</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Grafica</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Disco</th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Host/IP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                {filteredAssets.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                                            No hay resultados para los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}

                                {filteredAssets.map((item) => (
                                    <tr key={item.idfixedasset} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div className="font-semibold">{item.asset_code ?? `Activo #${item.idfixedasset}`}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.type_name ?? 'Sin tipo'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.brand ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.model ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div>{item.person_name ?? '-'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.network_username ?? '-'}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.agencie_name ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.processor ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.ram ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.motherboard ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">{item.graphicscard ?? '-'}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div className="text-xs">SSD: {item.ssddisk ?? '-'}</div>
                                            <div className="text-xs">HDD: {item.hdddisk ?? '-'}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div>{item.network_hostname ?? '-'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.network_ipadress ?? '-'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </PageCard>
            </PageContainer>

            <Modal show={showCopyModal} onClose={() => setShowCopyModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tabla copiada</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {copiedRowsCount > 0
                            ? `Se copiaron ${copiedRowsCount} filas al portapapeles.`
                            : 'No hay filas para copiar con los filtros actuales.'}
                    </p>
                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={() => setShowCopyModal(false)}>Cerrar</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
