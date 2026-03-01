import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DatePickerInput from '@/Components/DatePickerInput';
import TextInput from '@/Components/TextInput';
import { Combobox, Listbox, Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { Fragment, useState } from 'react';

export default function FixedAssetList({ auth, fixedAssets = [], assetTypes = [], agencies = [], people = [] }) {
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAssetId, setEditingAssetId] = useState(null);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [typeQuery, setTypeQuery] = useState('');
    const [personQuery, setPersonQuery] = useState('');
    const [editTypeQuery, setEditTypeQuery] = useState('');
    const [editPersonQuery, setEditPersonQuery] = useState('');
    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        type: '',
        person: '',
        state: '',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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

    const {
        data: editData,
        setData: setEditData,
        patch,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
        clearErrors: clearEditErrors,
    } = useForm({
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

    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setTypeQuery('');
        setPersonQuery('');
        clearErrors();
        reset();
    };

    const openEditModal = (asset) => {
        setEditingAssetId(asset.idfixedasset);
        setEditData('idtypefixedasset', asset.idtypefixedasset ? String(asset.idtypefixedasset) : '');
        setEditData('datepurchase', asset.datepurchase ?? '');
        setEditData('brand', asset.brand ?? '');
        setEditData('model', asset.model ?? '');
        setEditData('color', asset.color ?? '');
        setEditData('serial', asset.serial ?? '');
        setEditData('idagencie', asset.idagencie ? String(asset.idagencie) : '');
        setEditData('location', asset.location ?? '');
        setEditData('idperson', asset.idperson ? String(asset.idperson) : '');
        setEditData('state', String(asset.state ?? 1));
        setEditTypeQuery('');
        setEditPersonQuery('');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingAssetId(null);
        setEditTypeQuery('');
        setEditPersonQuery('');
        clearEditErrors();
        resetEdit();
    };

    const submitCreate = (event) => {
        event.preventDefault();

        post(route('fixedasset.store'), {
            preserveScroll: true,
            onSuccess: () => closeCreateModal(),
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();

        if (!editingAssetId) {
            return;
        }

        patch(route('fixedasset.update', editingAssetId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const filteredAssets = fixedAssets.filter((asset) => {
        const stateLabel = asset.state === 1 ? 'Alta' : 'Baja';

        return (
            (asset.brand ?? '').toLowerCase().includes(filters.brand.toLowerCase())
            && (asset.model ?? '').toLowerCase().includes(filters.model.toLowerCase())
            && (asset.type_name ?? '').toLowerCase().includes(filters.type.toLowerCase())
            && (asset.person_name ?? '').toLowerCase().includes(filters.person.toLowerCase())
            && (filters.state === '' || stateLabel === filters.state)
        );
    });

    const formatLastModified = (value) => {
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

        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const copyTableToClipboard = async () => {
        if (filteredAssets.length === 0) {
            setCopiedRowsCount(0);
            setShowCopyModal(true);
            return;
        }

        const headers = ['#', 'Tipo', 'Marca', 'Modelo', 'Fecha compra', 'Serial', 'Responsable', 'Agencia', 'Ubicación', 'Estado', 'Últ. modif.'];
        const rows = filteredAssets.map((asset, index) => {
            const stateLabel = asset.state === 1 ? 'Alta' : 'Baja';

            return [
                String(index + 1),
                asset.type_name ?? '-',
                asset.brand ?? '-',
                asset.model ?? '-',
                formatLastModified(asset.datepurchase),
                asset.serial ?? '-',
                asset.person_name ?? '-',
                asset.agencie_name ?? '-',
                asset.location ?? '-',
                stateLabel,
                formatLastModified(asset.updated_at),
            ].join('\t');
        });

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

        setCopiedRowsCount(filteredAssets.length);
        setShowCopyModal(true);
    };

    const selectedType = assetTypes.find((item) => String(item.idtypefixedasset) === String(data.idtypefixedasset));
    const selectedAgency = agencies.find((item) => String(item.idagencie) === String(data.idagencie));
    const selectedPerson = people.find((item) => String(item.idperson) === String(data.idperson));
    const selectedEditType = assetTypes.find((item) => String(item.idtypefixedasset) === String(editData.idtypefixedasset));
    const selectedEditAgency = agencies.find((item) => String(item.idagencie) === String(editData.idagencie));
    const selectedEditPerson = people.find((item) => String(item.idperson) === String(editData.idperson));
    const filteredTypes = typeQuery.trim() === ''
        ? assetTypes
        : assetTypes.filter((item) => item.name.toLowerCase().includes(typeQuery.toLowerCase()));
    const filteredEditTypes = editTypeQuery.trim() === ''
        ? assetTypes
        : assetTypes.filter((item) => item.name.toLowerCase().includes(editTypeQuery.toLowerCase()));
    const filteredPeople = personQuery.trim() === ''
        ? people
        : people.filter((item) => (`${item.name} ${item.employment}`)
            .toLowerCase()
            .includes(personQuery.toLowerCase()));
    const filteredEditPeople = editPersonQuery.trim() === ''
        ? people
        : people.filter((item) => (`${item.name} ${item.employment}`)
            .toLowerCase()
            .includes(editPersonQuery.toLowerCase()));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Lista de Activos</h2>}
        >
            <Head title="Lista de Activos" />

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
                                    Nuevo activo
                                </button>
                            </div>

                            {filteredAssets.length === 0 ? (
                                <p>No hay activos fijos registrados.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Tipo</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Marca</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Modelo</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Fecha compra</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsable</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Agencia</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Ubicación</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Últ. modif.</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Acciones</th>
                                            </tr>
                                            <tr>
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
                                                        placeholder="Filtrar marca"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.brand}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, brand: event.target.value }))}
                                                    />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar modelo"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.model}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, model: event.target.value }))}
                                                    />
                                                </th>
                                                <th className="px-4 py-2" />
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
                                                    <select
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.state}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, state: event.target.value }))}
                                                    >
                                                        <option value="">Todos</option>
                                                        <option value="Alta">Alta</option>
                                                        <option value="Baja">Baja</option>
                                                    </select>
                                                </th>
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredAssets.map((asset, index) => (
                                                <tr key={asset.idfixedasset}>
                                                    <td className="px-4 py-3 text-sm align-top">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.type_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.brand}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.model}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{formatLastModified(asset.datepurchase)}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.person_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.agencie_name ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{asset.location}</td>
                                                    <td className="px-4 py-3 text-sm align-top">{asset.state === 1 ? 'Alta' : 'Baja'}</td>
                                                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">{formatLastModified(asset.updated_at)}</td>
                                                    <td className="px-4 py-3 text-sm align-top">
                                                        <div className="flex flex-col items-start gap-2 xl:flex-row xl:items-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(asset)}
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nuevo activo</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="idtypefixedasset" value="Tipo de activo" />
                            <Combobox
                                value={selectedType ?? null}
                                onChange={(item) => {
                                    setData('idtypefixedasset', item ? String(item.idtypefixedasset) : '');
                                    setTypeQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="idtypefixedasset"
                                            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(item) => (item ? item.name : '')}
                                            onChange={(event) => {
                                                setTypeQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setData('idtypefixedasset', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar tipo de activo..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            {filteredTypes.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">
                                                    Sin coincidencias
                                                </div>
                                            ) : (
                                                filteredTypes.map((item) => (
                                                    <Combobox.Option
                                                        key={item.idtypefixedasset}
                                                        value={item}
                                                        className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}
                                                    >
                                                        <span className="block truncate">{item.name}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
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
                            <Listbox value={String(data.idagencie)} onChange={(value) => setData('idagencie', value)}>
                                <div className="relative mt-1">
                                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                                        <span className="block truncate">{selectedAgency ? selectedAgency.name : 'Selecciona...'}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            <Listbox.Option className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`} value="">
                                                <span className="block truncate">Selecciona...</span>
                                            </Listbox.Option>
                                            {agencies.map((item) => (
                                                <Listbox.Option
                                                    key={item.idagencie}
                                                    value={String(item.idagencie)}
                                                    className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}
                                                >
                                                    <span className="block truncate">{item.name}</span>
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
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
                            <Combobox
                                value={selectedPerson ?? null}
                                onChange={(person) => {
                                    setData('idperson', person ? String(person.idperson) : '');
                                    setPersonQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="idperson"
                                            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(person) => (person ? `${person.name} - ${person.employment}` : '')}
                                            onChange={(event) => {
                                                setPersonQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setData('idperson', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar funcionario..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            {filteredPeople.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">
                                                    Sin coincidencias
                                                </div>
                                            ) : (
                                                filteredPeople.map((item) => (
                                                    <Combobox.Option
                                                        key={item.idperson}
                                                        value={item}
                                                        className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}
                                                    >
                                                        <span className="block truncate">{`${item.name} - ${item.employment}`}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <InputError message={errors.idperson} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="state" value="Estado" />
                            <select
                                id="state"
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
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

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeCreateModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar activo</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="4xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Modificar activo</h2>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="edit_idtypefixedasset" value="Tipo de activo" />
                            <Combobox
                                value={selectedEditType ?? null}
                                onChange={(item) => {
                                    setEditData('idtypefixedasset', item ? String(item.idtypefixedasset) : '');
                                    setEditTypeQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="edit_idtypefixedasset"
                                            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(item) => (item ? item.name : '')}
                                            onChange={(event) => {
                                                setEditTypeQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setEditData('idtypefixedasset', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar tipo de activo..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            {filteredEditTypes.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">Sin coincidencias</div>
                                            ) : (
                                                filteredEditTypes.map((item) => (
                                                    <Combobox.Option key={item.idtypefixedasset} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                                                        <span className="block truncate">{item.name}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <InputError message={editErrors.idtypefixedasset} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_datepurchase" value="Fecha de compra" />
                            <DatePickerInput
                                id="edit_datepurchase"
                                value={editData.datepurchase}
                                onChange={(value) => setEditData('datepurchase', value)}
                                placeholder="Selecciona fecha de compra"
                            />
                            <InputError message={editErrors.datepurchase} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_brand" value="Marca" />
                            <TextInput id="edit_brand" className="mt-1 block w-full" value={editData.brand} onChange={(event) => setEditData('brand', event.target.value)} required />
                            <InputError message={editErrors.brand} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_model" value="Modelo (opcional)" />
                            <TextInput id="edit_model" className="mt-1 block w-full" value={editData.model} onChange={(event) => setEditData('model', event.target.value)} />
                            <InputError message={editErrors.model} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_color" value="Color" />
                            <TextInput id="edit_color" className="mt-1 block w-full" value={editData.color} onChange={(event) => setEditData('color', event.target.value)} required />
                            <InputError message={editErrors.color} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_serial" value="Serial (opcional)" />
                            <TextInput id="edit_serial" className="mt-1 block w-full" value={editData.serial} onChange={(event) => setEditData('serial', event.target.value)} />
                            <InputError message={editErrors.serial} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idagencie" value="Agencia" />
                            <Listbox value={String(editData.idagencie)} onChange={(value) => setEditData('idagencie', value)}>
                                <div className="relative mt-1">
                                    <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                                        <span className="block truncate">{selectedEditAgency ? selectedEditAgency.name : 'Selecciona...'}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            <Listbox.Option className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`} value="">
                                                <span className="block truncate">Selecciona...</span>
                                            </Listbox.Option>
                                            {agencies.map((item) => (
                                                <Listbox.Option key={item.idagencie} value={String(item.idagencie)} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                                                    <span className="block truncate">{item.name}</span>
                                                </Listbox.Option>
                                            ))}
                                        </Listbox.Options>
                                    </Transition>
                                </div>
                            </Listbox>
                            <InputError message={editErrors.idagencie} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_location" value="Ubicación" />
                            <TextInput id="edit_location" className="mt-1 block w-full" value={editData.location} onChange={(event) => setEditData('location', event.target.value)} required />
                            <InputError message={editErrors.location} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_idperson" value="Funcionario responsable" />
                            <Combobox
                                value={selectedEditPerson ?? null}
                                onChange={(person) => {
                                    setEditData('idperson', person ? String(person.idperson) : '');
                                    setEditPersonQuery('');
                                }}
                            >
                                <div className="relative mt-1">
                                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900">
                                        <Combobox.Input
                                            id="edit_idperson"
                                            className="w-full border-none bg-transparent py-2 pl-3 pr-10 text-gray-900 focus:ring-0 dark:text-gray-100"
                                            displayValue={(person) => (person ? `${person.name} - ${person.employment}` : '')}
                                            onChange={(event) => {
                                                setEditPersonQuery(event.target.value);
                                                if (!event.target.value) {
                                                    setEditData('idperson', '');
                                                }
                                            }}
                                            placeholder="Escribe para buscar funcionario..."
                                            autoComplete="off"
                                        />
                                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                            <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </Combobox.Button>
                                    </div>
                                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-base text-gray-900 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-gray-700 dark:bg-slate-900 dark:text-white sm:text-sm">
                                            {filteredEditPeople.length === 0 ? (
                                                <div className="relative cursor-default select-none px-3 py-2 text-gray-500 dark:text-gray-300">Sin coincidencias</div>
                                            ) : (
                                                filteredEditPeople.map((item) => (
                                                    <Combobox.Option key={item.idperson} value={item} className={({ active }) => `relative cursor-default select-none py-2 pl-3 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'}`}>
                                                        <span className="block truncate">{`${item.name} - ${item.employment}`}</span>
                                                    </Combobox.Option>
                                                ))
                                            )}
                                        </Combobox.Options>
                                    </Transition>
                                </div>
                            </Combobox>
                            <InputError message={editErrors.idperson} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_state" value="Estado" />
                            <select id="edit_state" className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" value={editData.state} onChange={(event) => setEditData('state', event.target.value)} required>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <InputError message={editErrors.state} className="mt-2" />
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
