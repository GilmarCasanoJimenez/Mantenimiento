import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DatePickerInput from '@/Components/DatePickerInput';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function MaintenanceList({ auth, maintenances = [], hardwareMaintenances = [], fixedAssets = [], agencies = [], people = [], users = [] }) {
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingMaintenanceId, setEditingMaintenanceId] = useState(null);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [filters, setFilters] = useState({
        type: '',
        asset: '',
        person: '',
        agencie: '',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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
        iduser: '',
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
        iduser: '',
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

    const assetLabel = (item) => `${item.idfixedasset} - ${item.type_name ?? '-'} - ${item.brand ?? '-'} ${item.model ?? ''}`;
    const personLabel = (item) => `${item.name} - ${item.employment}`;

    const filteredMaintenances = maintenances.filter((item) => (
        (item.type ?? '').toLowerCase().includes(filters.type.toLowerCase())
        && `${item.asset_type_name ?? ''} ${item.asset_brand ?? ''} ${item.asset_model ?? ''}`.toLowerCase().includes(filters.asset.toLowerCase())
        && (item.person_name ?? '').toLowerCase().includes(filters.person.toLowerCase())
        && (item.agencie_name ?? '').toLowerCase().includes(filters.agencie.toLowerCase())
    ));

    const openCreateModal = () => setShowCreateModal(true);

    const closeCreateModal = () => {
        setShowCreateModal(false);
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
        setEditData('iduser', item.iduser ? String(item.iduser) : '');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingMaintenanceId(null);
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

        const headers = ['#', 'Fecha', 'Tipo', 'Activo', 'Responsable', 'Agencia', 'Ubicación', 'Usuario', 'Últ. modif.'];
        const rows = filteredMaintenances.map((item, index) => [
            String(index + 1),
            formatDate(item.date),
            item.type ?? '-',
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
                            <div className="mb-3 flex justify-end gap-2">
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

                            {filteredMaintenances.length === 0 ? (
                                <p>No hay mantenimientos registrados.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Fecha</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Tipo</th>
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
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredMaintenances.map((item, index) => (
                                                <tr key={item.idmaintenance}>
                                                    <td className="px-4 py-3 text-sm align-top">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{formatDate(item.date)}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{item.type}</td>
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
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
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nuevo mantenimiento</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="idhardwaremaintenance" value="Hardware mantenimiento" />
                            <select id="idhardwaremaintenance" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={data.idhardwaremaintenance} onChange={(event) => setData('idhardwaremaintenance', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {hardwareMaintenances.map((item) => (
                                    <option key={item.idhardwaremaintenance} value={item.idhardwaremaintenance}>{`${item.idhardwaremaintenance} - ${item.processor}`}</option>
                                ))}
                            </select>
                            <InputError message={errors.idhardwaremaintenance} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value="Tipo" />
                            <TextInput id="type" className="mt-1 block w-full" value={data.type} onChange={(event) => setData('type', event.target.value)} required />
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="idfixedasset" value="Activo fijo" />
                            <select id="idfixedasset" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={data.idfixedasset} onChange={(event) => setData('idfixedasset', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {fixedAssets.map((item) => (
                                    <option key={item.idfixedasset} value={item.idfixedasset}>{assetLabel(item)}</option>
                                ))}
                            </select>
                            <InputError message={errors.idfixedasset} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date" value="Fecha" />
                            <DatePickerInput id="date" value={data.date} onChange={(value) => setData('date', value)} placeholder="Selecciona fecha" />
                            <InputError message={errors.date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="idagencie" value="Agencia" />
                            <select id="idagencie" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={data.idagencie} onChange={(event) => setData('idagencie', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {agencies.map((item) => (
                                    <option key={item.idagencie} value={item.idagencie}>{item.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.idagencie} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="location" value="Ubicación" />
                            <TextInput id="location" className="mt-1 block w-full" value={data.location} onChange={(event) => setData('location', event.target.value)} required />
                            <InputError message={errors.location} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="idperson" value="Funcionario" />
                            <select id="idperson" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={data.idperson} onChange={(event) => setData('idperson', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {people.map((item) => (
                                    <option key={item.idperson} value={item.idperson}>{personLabel(item)}</option>
                                ))}
                            </select>
                            <InputError message={errors.idperson} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="iduser" value="Usuario" />
                            <select id="iduser" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={data.iduser} onChange={(event) => setData('iduser', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {users.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.iduser} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="diagnostic" value="Diagnóstico" />
                            <TextInput id="diagnostic" className="mt-1 block w-full" value={data.diagnostic} onChange={(event) => setData('diagnostic', event.target.value)} required />
                            <InputError message={errors.diagnostic} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="workdone" value="Trabajo realizado" />
                            <TextInput id="workdone" className="mt-1 block w-full" value={data.workdone} onChange={(event) => setData('workdone', event.target.value)} required />
                            <InputError message={errors.workdone} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="observation" value="Observación" />
                            <TextInput id="observation" className="mt-1 block w-full" value={data.observation} onChange={(event) => setData('observation', event.target.value)} required />
                            <InputError message={errors.observation} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeCreateModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar mantenimiento</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="4xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Modificar mantenimiento</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="edit_idhardwaremaintenance" value="Hardware mantenimiento" />
                            <select id="edit_idhardwaremaintenance" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.idhardwaremaintenance} onChange={(event) => setEditData('idhardwaremaintenance', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {hardwareMaintenances.map((item) => (
                                    <option key={item.idhardwaremaintenance} value={item.idhardwaremaintenance}>{`${item.idhardwaremaintenance} - ${item.processor}`}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.idhardwaremaintenance} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_type" value="Tipo" />
                            <TextInput id="edit_type" className="mt-1 block w-full" value={editData.type} onChange={(event) => setEditData('type', event.target.value)} required />
                            <InputError message={editErrors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idfixedasset" value="Activo fijo" />
                            <select id="edit_idfixedasset" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.idfixedasset} onChange={(event) => setEditData('idfixedasset', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {fixedAssets.map((item) => (
                                    <option key={item.idfixedasset} value={item.idfixedasset}>{assetLabel(item)}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.idfixedasset} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_date" value="Fecha" />
                            <DatePickerInput id="edit_date" value={editData.date} onChange={(value) => setEditData('date', value)} placeholder="Selecciona fecha" />
                            <InputError message={editErrors.date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idagencie" value="Agencia" />
                            <select id="edit_idagencie" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.idagencie} onChange={(event) => setEditData('idagencie', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {agencies.map((item) => (
                                    <option key={item.idagencie} value={item.idagencie}>{item.name}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.idagencie} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_location" value="Ubicación" />
                            <TextInput id="edit_location" className="mt-1 block w-full" value={editData.location} onChange={(event) => setEditData('location', event.target.value)} required />
                            <InputError message={editErrors.location} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idperson" value="Funcionario" />
                            <select id="edit_idperson" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.idperson} onChange={(event) => setEditData('idperson', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {people.map((item) => (
                                    <option key={item.idperson} value={item.idperson}>{personLabel(item)}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.idperson} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_iduser" value="Usuario" />
                            <select id="edit_iduser" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.iduser} onChange={(event) => setEditData('iduser', event.target.value)} required>
                                <option value="">Selecciona...</option>
                                {users.map((item) => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                            <InputError message={editErrors.iduser} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_diagnostic" value="Diagnóstico" />
                            <TextInput id="edit_diagnostic" className="mt-1 block w-full" value={editData.diagnostic} onChange={(event) => setEditData('diagnostic', event.target.value)} required />
                            <InputError message={editErrors.diagnostic} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_workdone" value="Trabajo realizado" />
                            <TextInput id="edit_workdone" className="mt-1 block w-full" value={editData.workdone} onChange={(event) => setEditData('workdone', event.target.value)} required />
                            <InputError message={editErrors.workdone} className="mt-2" />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel htmlFor="edit_observation" value="Observación" />
                            <TextInput id="edit_observation" className="mt-1 block w-full" value={editData.observation} onChange={(event) => setEditData('observation', event.target.value)} required />
                            <InputError message={editErrors.observation} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeEditModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={editProcessing}>Guardar cambios</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
