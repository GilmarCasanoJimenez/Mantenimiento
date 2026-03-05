import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';

export default function MaintenanceHistory({ auth, history = [] }) {
    const getCurrentYearRange = () => {
        const year = new Date().getFullYear();

        return {
            from: `${year}-01-01`,
            to: `${year}-12-31`,
        };
    };

    const defaultDateRange = getCurrentYearRange();

    const [filters, setFilters] = useState({
        assetCode: '',
        description: '',
        person: '',
        user: '',
        dateFrom: defaultDateRange.from,
        dateTo: defaultDateRange.to,
    });
    const [showDateFilterPanel, setShowDateFilterPanel] = useState(false);

    const isDateInRange = (date, from, to) => {
        if (!date) {
            return false;
        }

        if (from && date < from) {
            return false;
        }

        if (to && date > to) {
            return false;
        }

        return true;
    };

    const filteredHistory = useMemo(() => history
        .map((item) => {
            const workLines = String(item.work_log ?? '')
                .split(' || ')
                .map((value) => value.trim())
                .filter((value) => value !== '');

            const workDates = String(item.maintenance_dates ?? '')
                .split('||')
                .map((value) => value.trim());

            const filteredEntries = workLines.filter((line, index) => {
                const date = workDates[index] ?? '';

                return isDateInRange(date, filters.dateFrom, filters.dateTo);
            });

            return {
                ...item,
                filteredEntries,
                filteredMaintenanceCount: filteredEntries.length,
            };
        })
        .filter((item) => (
            (item.asset_code ?? '').toLowerCase().includes(filters.assetCode.toLowerCase())
            && (item.asset_description ?? '').toLowerCase().includes(filters.description.toLowerCase())
            && (item.current_person_name ?? '').toLowerCase().includes(filters.person.toLowerCase())
            && (item.user_name ?? '').toLowerCase().includes(filters.user.toLowerCase())
            && item.filteredEntries.length > 0
        )), [history, filters]);

    const hasActiveFilters = (
        (filters.assetCode ?? '').trim() !== ''
        || (filters.description ?? '').trim() !== ''
        || (filters.person ?? '').trim() !== ''
        || (filters.user ?? '').trim() !== ''
        || filters.dateFrom !== defaultDateRange.from
        || filters.dateTo !== defaultDateRange.to
    );

    const formatDate = (value) => {
        if (!value) {
            return '-';
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split('-');
            return `${day}/${month}/${year}`;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const clearFilters = () => {
        setFilters({
            assetCode: '',
            description: '',
            person: '',
            user: '',
            dateFrom: defaultDateRange.from,
            dateTo: defaultDateRange.to,
        });
    };

    const getCurrentMonthRange = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0);

        const toIso = (date) => date.toISOString().slice(0, 10);

        return {
            from: toIso(from),
            to: toIso(to),
        };
    };

    const applyDatePreset = (preset) => {
        if (preset === 'today') {
            const today = new Date().toISOString().slice(0, 10);
            setFilters((prev) => ({ ...prev, dateFrom: today, dateTo: today }));
            return;
        }

        if (preset === 'month') {
            const monthRange = getCurrentMonthRange();
            setFilters((prev) => ({ ...prev, dateFrom: monthRange.from, dateTo: monthRange.to }));
            return;
        }

        if (preset === 'year') {
            setFilters((prev) => ({ ...prev, dateFrom: defaultDateRange.from, dateTo: defaultDateRange.to }));
        }
    };

    const dateRangeLabel = `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Historial de Mantenimientos</h2>}
        >
            <Head title="Historial de Mantenimientos" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <div className="p-4 text-gray-900 dark:text-gray-100">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">Resumen histórico por registro de mantenimiento. Rango predeterminado: gestión actual.</p>
                                <div className="relative flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDateFilterPanel((prev) => !prev)}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                                    >
                                        Filtro fecha
                                    </button>

                                    <span className="text-xs text-gray-600 dark:text-gray-300">{dateRangeLabel}</span>

                                    {showDateFilterPanel && (
                                        <div className="absolute right-0 top-10 z-50 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Rango de fechas</p>

                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => applyDatePreset('today')}
                                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                                >
                                                    Hoy
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyDatePreset('month')}
                                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                                >
                                                    Este mes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyDatePreset('year')}
                                                    className="rounded-md border border-gray-300 px-2 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                                                >
                                                    Esta gestion
                                                </button>
                                            </div>

                                            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300">Personalizado</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.dateFrom}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
                                                        title="Desde"
                                                    />
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.dateTo}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
                                                        title="Hasta"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDateFilterPanel(false)}
                                                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                                >
                                                    Aplicar
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ${hasActiveFilters ? 'bg-gray-500 hover:bg-gray-600' : 'cursor-not-allowed bg-gray-400 opacity-70'}`}
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Código del activo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Descripción</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsable actual</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nro. mantenimientos</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Fecha - Trabajo realizado</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Usuario responsable</th>
                                        </tr>
                                        <tr>
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar código"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.assetCode}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, assetCode: event.target.value }))}
                                                />
                                            </th>
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar descripción"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.description}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, description: event.target.value }))}
                                                />
                                            </th>
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar responsable"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.person}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, person: event.target.value }))}
                                                />
                                            </th>
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar usuario"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.user}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, user: event.target.value }))}
                                                />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((item) => (
                                                <tr key={item.idfixedasset}>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.asset_code ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.asset_description ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.current_person_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top text-center">{item.filteredMaintenanceCount ?? 0}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">
                                                        <ul className="space-y-1">
                                                            {(item.filteredEntries ?? [])
                                                                .map((line, lineIndex) => (
                                                                    <li key={`${item.idfixedasset}-${lineIndex}`}>{`• ${line}`}</li>
                                                                ))}
                                                        </ul>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.user_name ?? '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
                                                    {hasActiveFilters
                                                        ? 'No hay resultados para los filtros aplicados.'
                                                        : 'No hay mantenimientos registrados en el historial.'}
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
        </AuthenticatedLayout>
    );
}
