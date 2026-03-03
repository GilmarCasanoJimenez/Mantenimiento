import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DatePickerInput from '@/Components/DatePickerInput';
import TextInput from '@/Components/TextInput';
import { Combobox, Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Fragment, useEffect, useState } from 'react';

export default function MaintenanceList({ auth, maintenances = [], hardwareMaintenances = [], fixedAssets = [], agencies = [], people = [] }) {
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [assetQuery, setAssetQuery] = useState('');
    const [editAssetQuery, setEditAssetQuery] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        assetCode: '',
        asset: '',
        person: '',
        agencie: '',
        location: '',
    });
    const defaultHardwareMaintenanceId = hardwareMaintenances[0]
        ? String(hardwareMaintenances[0].idhardwaremaintenance)
        : '';
    const getTodayDate = () => {
        const now = new Date();
        const timezoneOffsetMs = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 10);
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            assetCode: '',
            asset: '',
            person: '',
            agencie: '',
            location: '',
        });
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        idhardwaremaintenance: defaultHardwareMaintenanceId,
        type: '',
        idfixedasset: '',
        date: getTodayDate(),
        diagnostic: '',
        workdone: '',
        observation: '',
        idagencie: '',
        location: '',
        idperson: '',
    });

    const {
        data: editData,
        setData: setEditData,
        patch,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
        idhardwaremaintenance: '',
        type: '',
        idfixedasset: '',
        date: '',
        diagnostic: '',
        workdone: '',
        observation: '',
        idagencie: '',
        location: '',
        idperson: '',
    });

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

    const assetLabel = (item) => `${item.asset_code ?? item.idfixedasset} - ${item.type_name ?? '-'} - ${item.brand ?? '-'} ${item.model ?? ''}`;
    const personLabel = (item) => `${item.name} - ${item.employment}`;
    const maintenanceTypes = ['PREVENTIVO', 'CORRECTIVO'];
    const assetPersonLabel = (item) => {
        if (!item) {
            return '';
        }

        return item.person_employment
            ? `${item.person_name} - ${item.person_employment}`
            : (item.person_name ?? '');
    };
    const compactSelectClass = 'rounded-md border-gray-300 bg-white py-1.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
    const compactInputClass = 'mt-1 block w-full py-1.5 text-sm';

    const filteredMaintenances = maintenances.filter((item) => (
        (item.type ?? '').toLowerCase().includes(filters.type.toLowerCase())
        && (item.asset_code ?? '').toLowerCase().includes(filters.assetCode.toLowerCase())
        && `${item.asset_type_name ?? ''} ${item.asset_brand ?? ''} ${item.asset_model ?? ''}`.toLowerCase().includes(filters.asset.toLowerCase())
        && (item.person_name ?? '').toLowerCase().includes(filters.person.toLowerCase())
        && (item.agencie_name ?? '').toLowerCase().includes(filters.agencie.toLowerCase())
        && (item.location ?? '').toLowerCase().includes(filters.location.toLowerCase())
    ));
    const hasActiveFilters = Object.values(filters).some((value) => (value ?? '').trim() !== '');

    const selectedAsset = fixedAssets.find((item) => String(item.idfixedasset) === String(data.idfixedasset));
    const selectedEditAsset = fixedAssets.find((item) => String(item.idfixedasset) === String(editData.idfixedasset));
    const filteredFixedAssets = assetQuery.trim() === ''
        ? fixedAssets
        : fixedAssets.filter((item) => assetLabel(item).toLowerCase().includes(assetQuery.toLowerCase()));
    const filteredEditFixedAssets = editAssetQuery.trim() === ''
        ? fixedAssets
        : fixedAssets.filter((item) => assetLabel(item).toLowerCase().includes(editAssetQuery.toLowerCase()));
    const selectedAssetAgency = selectedAsset?.agencie_name ?? '';
    const selectedAssetPerson = assetPersonLabel(selectedAsset);
    const selectedEditAssetAgency = selectedEditAsset?.agencie_name ?? '';
    const selectedEditAssetPerson = assetPersonLabel(selectedEditAsset);

    useEffect(() => {
        const agencyId = selectedAsset?.idagencie ? String(selectedAsset.idagencie) : '';
        const personId = selectedAsset?.idperson ? String(selectedAsset.idperson) : '';
        const location = selectedAsset?.location ?? '';

        if (data.idagencie !== agencyId) {
            setData('idagencie', agencyId);
        }

        if (data.idperson !== personId) {
            setData('idperson', personId);
        }

        if (data.location !== location) {
            setData('location', location);
        }
    }, [selectedAsset]);

    useEffect(() => {
        const agencyId = selectedEditAsset?.idagencie ? String(selectedEditAsset.idagencie) : '';
        const personId = selectedEditAsset?.idperson ? String(selectedEditAsset.idperson) : '';
        const location = selectedEditAsset?.location ?? '';

        if (editData.idagencie !== agencyId) {
            setEditData('idagencie', agencyId);
        }

        if (editData.idperson !== personId) {
            setEditData('idperson', personId);
        }

        if (editData.location !== location) {
            setEditData('location', location);
        }
    }, [selectedEditAsset]);

    const openCreateModal = () => {
        if (!data.idhardwaremaintenance && defaultHardwareMaintenanceId) {
            setData('idhardwaremaintenance', defaultHardwareMaintenanceId);
        }

        setData('date', getTodayDate());

        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setAssetQuery('');
        clearErrors();
        reset();
    };

    const openEditModal = (item) => {
        setEditingMaintenanceId(item.idmaintenance);
        setEditData('idhardwaremaintenance', item.idhardwaremaintenance ? String(item.idhardwaremaintenance) : '');
        setEditData('type', item.type ?? '');
        setEditData('idfixedasset', item.idfixedasset ? String(item.idfixedasset) : '');
        setEditData('date', item.date ?? '');
        setEditData('diagnostic', item.diagnostic ?? '');
        setEditData('workdone', item.workdone ?? '');
        setEditData('observation', item.observation ?? '');
        setEditData('idagencie', item.idagencie ? String(item.idagencie) : '');
        setEditData('location', item.location ?? '');
        setEditData('idperson', item.idperson ? String(item.idperson) : '');
        setEditAssetQuery('');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingMaintenanceId(null);
        setEditAssetQuery('');
        clearEditErrors();
        resetEdit();
    };

    const submitCreate = (event) => {
        event.preventDefault();

        post(route('maintenance.store'), {
            preserveScroll: true,
            onSuccess: () => closeCreateModal(),
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();

        if (!editingMaintenanceId) {
            return;
        }

        patch(route('maintenance.update', editingMaintenanceId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const copyTableToClipboard = async () => {
        if (filteredMaintenances.length === 0) {
            setCopiedRowsCount(0);
            setShowCopyModal(true);
            return;
        }

        const headers = ['#', 'Fecha', 'Tipo', 'Código activo', 'Activo', 'Responsable', 'Agencia', 'Ubicación', 'Usuario', 'Últ. modif.'];
        const rows = filteredMaintenances.map((item, index) => [
            String(index + 1),
            formatDate(item.date),
            item.type ?? '-',
            item.asset_code ?? '-',
            `${item.asset_type_name ?? '-'} - ${item.asset_brand ?? '-'} ${item.asset_model ?? ''}`,
            item.person_name ?? '-',
            item.agencie_name ?? '-',
            item.location ?? '-',
            item.user_name ?? '-',
            formatDate(item.updated_at),
        ].join('\t'));

        const text = [headers.join('\t'), ...rows].join('\n');

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

        setCopiedRowsCount(filteredMaintenances.length);
        setShowCopyModal(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Lista de Mantenimientos</h2>}
        >
            <Head title="Lista de Mantenimientos" />

            <div className="py-6">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-gray-800 dark:shadow-gray-900/30">
                        <div className="p-4 text-gray-900 dark:text-gray-100">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <div>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters}
                                        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white ${hasActiveFilters ? 'bg-gray-500 hover:bg-gray-600' : 'cursor-not-allowed bg-gray-400 opacity-70'}`}
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18" />
                                            <path d="M6 12h12" />
                                            <path d="M10 18h4" />
                                        </svg>
                                        Limpiar filtros
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={copyTableToClipboard}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-slate-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-slate-700"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copiar tabla
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openCreateModal}
                                        className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-green-700"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 5v14M5 12h14" />
                                        </svg>
                                        Nuevo mantenimiento
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Tipo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Código activo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Activo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsable</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Agencia</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Ubicación</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Usuario</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Últ. modif.</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Acciones</th>
                                        </tr>
                                        <tr>
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar tipo"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.type}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
                                                />
                                            </th>
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
                                                    placeholder="Filtrar activo"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.asset}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, asset: event.target.value }))}
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
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar agencia"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.agencie}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, agencie: event.target.value }))}
                                                />
                                            </th>
                                            <th className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar ubicación"
                                                    className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                    value={filters.location}
                                                    onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                                                />
                                            </th>
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2" />
                                            <th className="px-4 py-2" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredMaintenances.length > 0 ? (
                                            filteredMaintenances.map((item, index) => (
                                                <tr key={item.idmaintenance}>
                                                    <td className="px-4 py-3 text-sm align-top">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{formatDate(item.date)}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.type}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{item.asset_code ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{`${item.asset_type_name ?? '-'} - ${item.asset_brand ?? '-'} ${item.asset_model ?? ''}`}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.person_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.agencie_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.location}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.user_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{formatDate(item.updated_at)}</td>
                                                    <td className="px-4 py-3 text-sm align-top">
                                                        <div className="flex flex-wrap gap-2">
                                                            <a
                                                                href={route('maintenance.report', item.idmaintenance)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-md bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                                                            >
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                    <polyline points="14 2 14 8 20 8" />
                                                                    <path d="M9 15h6" />
                                                                    <path d="M9 18h6" />
                                                                </svg>
                                                                PDF
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(item)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                                            >
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M12 20h9" />
                                                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                                </svg>
                                                                Modificar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={11} className="px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-300">
                                                    {hasActiveFilters
                                                        ? 'No hay resultados para los filtros aplicados.'
                                                        : 'No hay mantenimientos registrados.'}
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

            <Modal show={showCreateModal} onClose={closeCreateModal} maxWidth="4xl">
                <form onSubmit={submitCreate} className="p-4 sm:p-5">
                    <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Nuevo mantenimiento</h2>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="idfixedasset" value="Activo fijo" />
                            <Combobox
                                value={selectedAsset ?? null}
                                onChange={(item) => {
                                    setData('idfixedasset', item ? String(item.idfixedasset) : '');
                                    setData('idagencie', item?.idagencie ? String(item.idagencie) : '');
                                    setData('idperson', item?.idperson ? String(item.idperson) : '');
                                    setData('location', item?.location ?? '');
                                    setAssetQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="idfixedasset"
                                            className="w-full border-none bg-transparent py-1.5 pl-3 pr-10 text-sm text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(item) => (item ? assetLabel(item) : '')}
                                            onChange={(event) => {
                                                setAssetQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setData('idfixedasset', '');
                                                    setData('idagencie', '');
                                                    setData('idperson', '');
                                                    setData('location', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar activo..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white">
                                            {filteredFixedAssets.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">Sin coincidencias</div>
                                            ) : (
                                                filteredFixedAssets.map((item) => (
                                                    <Combobox.Option key={item.idfixedasset} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                                                        <span className="block truncate">{assetLabel(item)}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <InputError message={errors.idfixedasset} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Tipo" />
                            <select id="type" className={`mt-1 block w-full ${compactSelectClass}`} value={data.type} onChange={(event) => setData('type', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {maintenanceTypes.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date" value="Fecha" />
                            <DatePickerInput id="date" value={data.date} onChange={(value) => setData('date', value)} placeholder="Selecciona fecha" compact />
                            <InputError message={errors.date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="idagencie" value="Agencia" />
                            <TextInput id="idagencie" className={compactInputClass} value={selectedAssetAgency} readOnly required />
                            <InputError message={errors.idagencie} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="location" value="Ubicación" />
                            <TextInput id="location" className={compactInputClass} value={data.location} onChange={(event) => setData('location', event.target.value)} required />
                            <InputError message={errors.location} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="idperson" value="Funcionario" />
                            <TextInput id="idperson" className={compactInputClass} value={selectedAssetPerson} readOnly required />
                            <InputError message={errors.idperson} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="diagnostic" value="Diagnóstico" />
                            <TextInput id="diagnostic" className={compactInputClass} value={data.diagnostic} onChange={(event) => setData('diagnostic', event.target.value)} required />
                            <InputError message={errors.diagnostic} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="workdone" value="Trabajo realizado" />
                            <TextInput id="workdone" className={compactInputClass} value={data.workdone} onChange={(event) => setData('workdone', event.target.value)} required />
                            <InputError message={errors.workdone} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="observation" value="Observación" />
                            <TextInput id="observation" className={compactInputClass} value={data.observation} onChange={(event) => setData('observation', event.target.value)} required />
                            <InputError message={errors.observation} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeCreateModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar mantenimiento</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="4xl">
                <form onSubmit={submitEdit} className="p-4 sm:p-5">
                    <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">Modificar mantenimiento</h2>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="edit_idfixedasset" value="Activo fijo" />
                            <Combobox
                                value={selectedEditAsset ?? null}
                                onChange={(item) => {
                                    setEditData('idfixedasset', item ? String(item.idfixedasset) : '');
                                    setEditData('idagencie', item?.idagencie ? String(item.idagencie) : '');
                                    setEditData('idperson', item?.idperson ? String(item.idperson) : '');
                                    setEditData('location', item?.location ?? '');
                                    setEditAssetQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="edit_idfixedasset"
                                            className="w-full border-none bg-transparent py-1.5 pl-3 pr-10 text-sm text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(item) => (item ? assetLabel(item) : '')}
                                            onChange={(event) => {
                                                setEditAssetQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setEditData('idfixedasset', '');
                                                    setEditData('idagencie', '');
                                                    setEditData('idperson', '');
                                                    setEditData('location', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar activo..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white">
                                            {filteredEditFixedAssets.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">Sin coincidencias</div>
                                            ) : (
                                                filteredEditFixedAssets.map((item) => (
                                                    <Combobox.Option key={item.idfixedasset} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                                                        <span className="block truncate">{assetLabel(item)}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <InputError message={editErrors.idfixedasset} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_type" value="Tipo" />
                            <select id="edit_type" className={`mt-1 block w-full ${compactSelectClass}`} value={editData.type} onChange={(event) => setEditData('type', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {maintenanceTypes.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idhardwaremaintenance" value="Hardware mantenimiento" />
                            <select id="edit_idhardwaremaintenance" className={`mt-1 block w-full ${compactSelectClass}`} value={editData.idhardwaremaintenance} onChange={(event) => setEditData('idhardwaremaintenance', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {hardwareMaintenances.map((item) => (
                                    <option key={item.idhardwaremaintenance} value={item.idhardwaremaintenance}>{`${item.idhardwaremaintenance} - ${item.processor}`}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.idhardwaremaintenance} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_date" value="Fecha" />
                            <DatePickerInput id="edit_date" value={editData.date} onChange={(value) => setEditData('date', value)} placeholder="Selecciona fecha" compact />
                            <InputError message={editErrors.date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idagencie" value="Agencia" />
                            <TextInput id="edit_idagencie" className={compactInputClass} value={selectedEditAssetAgency} readOnly required />
                            <InputError message={editErrors.idagencie} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_location" value="Ubicación" />
                            <TextInput id="edit_location" className={compactInputClass} value={editData.location} onChange={(event) => setEditData('location', event.target.value)} required />
                            <InputError message={editErrors.location} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idperson" value="Funcionario" />
                            <TextInput id="edit_idperson" className={compactInputClass} value={selectedEditAssetPerson} readOnly required />
                            <InputError message={editErrors.idperson} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_diagnostic" value="Diagnóstico" />
                            <TextInput id="edit_diagnostic" className={compactInputClass} value={editData.diagnostic} onChange={(event) => setEditData('diagnostic', event.target.value)} required />
                            <InputError message={editErrors.diagnostic} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_workdone" value="Trabajo realizado" />
                            <TextInput id="edit_workdone" className={compactInputClass} value={editData.workdone} onChange={(event) => setEditData('workdone', event.target.value)} required />
                            <InputError message={editErrors.workdone} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_observation" value="Observación" />
                            <TextInput id="edit_observation" className={compactInputClass} value={editData.observation} onChange={(event) => setEditData('observation', event.target.value)} required />
                            <InputError message={editErrors.observation} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeEditModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={editProcessing}>Guardar cambios</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
