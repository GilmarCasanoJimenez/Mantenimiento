import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AgenciesList({ auth, agencies = [] }) {
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [filters, setFilters] = useState({
        name: '',
        localitation: '',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        localitation: '',
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
        name: '',
        localitation: '',
    });

    const filteredAgencies = agencies.filter((agency) => (
        (agency.name ?? '').toLowerCase().includes(filters.name.toLowerCase())
        && (agency.localitation ?? '').toLowerCase().includes(filters.localitation.toLowerCase())
    ));

    const openCreateModal = () => setShowCreateModal(true);

    const closeCreateModal = () => {
        setShowCreateModal(false);
        clearErrors();
        reset();
    };

    const openEditModal = (agency) => {
        setEditingId(agency.idagencie);
        setEditData('name', agency.name ?? '');
        setEditData('localitation', agency.localitation ?? '');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingId(null);
        clearEditErrors();
        resetEdit();
    };

    const submitCreate = (event) => {
        event.preventDefault();

        post(route('settings.agencies.store'), {
            preserveScroll: true,
            onSuccess: () => closeCreateModal(),
        });
    };

    const submitEdit = (event) => {
        event.preventDefault();

        if (!editingId) {
            return;
        }

        patch(route('settings.agencies.update', editingId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const copyTableToClipboard = async () => {
        if (filteredAgencies.length === 0) {
            setCopiedRowsCount(0);
            setShowCopyModal(true);
            return;
        }

        const headers = ['#', 'Nombre', 'Ubicación'];
        const rows = filteredAgencies.map((agency, index) => [
            String(index + 1),
            agency.name ?? '-',
            agency.localitation ?? '-',
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

        setCopiedRowsCount(filteredAgencies.length);
        setShowCopyModal(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Configuraciones - Agencias</h2>}
        >
            <Head title="Configuraciones - Agencias" />

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
                                    Nueva agencia
                                </button>
                            </div>

                            {filteredAgencies.length === 0 ? (
                                <p>No hay agencias registradas.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nombre</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Ubicación</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Acciones</th>
                                            </tr>
                                            <tr>
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar nombre"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.name}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, name: event.target.value }))}
                                                    />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar ubicación"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.localitation}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, localitation: event.target.value }))}
                                                    />
                                                </th>
                                                <th className="px-4 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredAgencies.map((agency, index) => (
                                                <tr key={agency.idagencie}>
                                                    <td className="px-4 py-3 text-sm align-top">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{agency.name}</td>
                                                    <td className="px-4 py-3 text-sm align-top break-words">{agency.localitation ?? '-'}</td>
                                                    <td className="px-4 py-3 text-sm align-top">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(agency)}
                                                            className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                                        >
                                                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M12 20h9" />
                                                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                            </svg>
                                                            Modificar
                                                        </button>
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

            <Modal show={showCreateModal} onClose={closeCreateModal} maxWidth="2xl">
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nueva agencia</h2>

                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre" />
                            <TextInput
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="localitation" value="Ubicación (opcional)" />
                            <TextInput
                                id="localitation"
                                className="mt-1 block w-full"
                                value={data.localitation}
                                onChange={(event) => setData('localitation', event.target.value)}
                            />
                            <InputError message={errors.localitation} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton type="button" onClick={closeCreateModal}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar agencia</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="2xl">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Modificar agencia</h2>

                    <div className="mt-4 space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="Nombre" />
                            <TextInput
                                id="edit_name"
                                className="mt-1 block w-full"
                                value={editData.name}
                                onChange={(event) => setEditData('name', event.target.value)}
                                required
                            />
                            <InputError message={editErrors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_localitation" value="Ubicación (opcional)" />
                            <TextInput
                                id="edit_localitation"
                                className="mt-1 block w-full"
                                value={editData.localitation}
                                onChange={(event) => setEditData('localitation', event.target.value)}
                            />
                            <InputError message={editErrors.localitation} className="mt-2" />
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
