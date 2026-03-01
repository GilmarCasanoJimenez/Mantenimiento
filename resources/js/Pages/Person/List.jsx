import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PersonList({ auth, persons = [], assignedAssets = {} }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignedAssetsModal, setShowAssignedAssetsModal] = useState(false);
    const [editingPersonId, setEditingPersonId] = useState(null);
    const [selectedPersonForAssets, setSelectedPersonForAssets] = useState(null);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copiedRowsCount, setCopiedRowsCount] = useState(0);
    const [filters, setFilters] = useState({
        name: '',
        employment: '',
        hasUser: '',
        state: 'Activo',
    });

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            employment: '',
            create_user: false,
            email: '',
            password: '',
            password_confirmation: '',
        });

    const openCreateModal = () => {
        setShowCreateModal(true);
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        clearErrors();
        reset();
    };

    const toggleCreateUser = () => {
        const nextValue = !data.create_user;
        setData('create_user', nextValue);

        if (!nextValue) {
            setData('email', '');
            setData('password', '');
            setData('password_confirmation', '');
        }
    };

    const submitCreate = (event) => {
        event.preventDefault();

        post(route('person.store'), {
            preserveScroll: true,
            onSuccess: () => closeCreateModal(),
        });
    };

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
        employment: '',
        create_user: false,
        email: '',
        password: '',
        password_confirmation: '',
    });

    const openEditModal = (person) => {
        const hasUser = Boolean(person.user_id);

        setEditingPersonId(person.idperson);
        setEditData('name', person.name ?? '');
        setEditData('employment', person.employment ?? '');
        setEditData('create_user', hasUser);
        setEditData('email', person.user_email ?? '');
        setEditData('password', '');
        setEditData('password_confirmation', '');
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingPersonId(null);
        clearEditErrors();
        resetEdit();
    };

    const toggleEditCreateUser = () => {
        const nextValue = !editData.create_user;
        setEditData('create_user', nextValue);

        if (!nextValue) {
            setEditData('email', '');
            setEditData('password', '');
            setEditData('password_confirmation', '');
        }
    };

    const submitEdit = (event) => {
        event.preventDefault();

        if (!editingPersonId) {
            return;
        }

        patch(route('person.update', editingPersonId), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const openAssignedAssetsModal = (person) => {
        setSelectedPersonForAssets(person);
        setShowAssignedAssetsModal(true);
    };

    const closeAssignedAssetsModal = () => {
        setShowAssignedAssetsModal(false);
        setSelectedPersonForAssets(null);
    };

    const handleToggleState = (person) => {
        const actionLabel = person.state === 1 ? 'desactivar' : 'activar';

        if (!window.confirm(`¿Seguro que deseas ${actionLabel} este funcionario?`)) {
            return;
        }

        router.patch(route('person.toggle-state', person.idperson), {}, { preserveScroll: true });
    };

    const filteredPersons = persons.filter((person) => {
        const personState = person.state === 1 ? 'Activo' : 'Inactivo';
        const hasUserValue = person.user_id ? 'Sí' : 'No';

        return (
            person.name.toLowerCase().includes(filters.name.toLowerCase())
            && person.employment.toLowerCase().includes(filters.employment.toLowerCase())
            && (filters.hasUser === '' || hasUserValue === filters.hasUser)
            && (filters.state === '' || personState === filters.state)
        );
    });

    const formatDateOnly = (value) => {
        if (!value) {
            return '-';
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

    const copyTableToClipboard = async () => {
        if (filteredPersons.length === 0) {
            setCopiedRowsCount(0);
            setShowCopyModal(true);
            return;
        }

        const headers = ['#', 'Nombre', 'Cargo', 'Tiene Usuario', 'Estado', 'Últ. modif.'];
        const rows = filteredPersons.map((person, index) => {
            const stateLabel = person.state === 1 ? 'Activo' : 'Inactivo';
            const hasUserLabel = person.user_id ? 'Sí' : 'No';

            return [
                String(index + 1),
                person.name ?? '',
                person.employment ?? '',
                hasUserLabel,
                stateLabel,
                formatDateOnly(person.updated_at),
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

        setCopiedRowsCount(filteredPersons.length);
        setShowCopyModal(true);
    };

    const selectedPersonAssets = selectedPersonForAssets
        ? assignedAssets[String(selectedPersonForAssets.idperson)] ?? []
        : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Lista de Funcionarios</h2>}
        >
            <Head title="Lista de Funcionarios" />

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
                                    Nuevo funcionario
                                </button>
                            </div>

                            {filteredPersons.length === 0 ? (
                                <p>No hay funcionarios registrados.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nombre</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Cargo</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Tiene Usuario</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Últ. modif.</th>
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
                                                        placeholder="Filtrar cargo"
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.employment}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, employment: event.target.value }))}
                                                    />
                                                </th>
                                                <th className="px-4 py-2">
                                                    <select
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.hasUser}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, hasUser: event.target.value }))}
                                                    >
                                                        <option value="">Todos</option>
                                                        <option value="Sí">Sí</option>
                                                        <option value="No">No</option>
                                                    </select>
                                                </th>
                                                <th className="px-4 py-2">
                                                    <select
                                                        className="w-full rounded-md border-gray-300 py-1.5 text-xs shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                                        value={filters.state}
                                                        onChange={(event) => setFilters((prev) => ({ ...prev, state: event.target.value }))}
                                                    >
                                                        <option value="">Todos</option>
                                                        <option value="Activo">Activo</option>
                                                        <option value="Inactivo">Inactivo</option>
                                                    </select>
                                                </th>
                                                <th className="px-4 py-2" />
                                                <th className="px-4 py-2" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredPersons.map((person, index) => (
                                                <tr key={person.idperson}>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">{index + 1}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">{person.name}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">{person.employment}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">{person.user_id ? 'Sí' : 'No'}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                        {person.state === 1 ? 'Activo' : 'Inactivo'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">{formatDateOnly(person.updated_at)}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openAssignedAssetsModal(person)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                                            >
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <rect x="3" y="4" width="18" height="14" rx="2" />
                                                                    <path d="M7 20h10" />
                                                                </svg>
                                                                Activos asignados
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(person)}
                                                                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                                            >
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M12 20h9" />
                                                                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                                                </svg>
                                                                Modificar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleState(person)}
                                                                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white ${person.state === 1 ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                                            >
                                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    {person.state === 1 ? (
                                                                        <path d="M18 6L6 18M6 6l12 12" />
                                                                    ) : (
                                                                        <path d="M20 6L9 17l-5-5" />
                                                                    )}
                                                                </svg>
                                                                {person.state === 1 ? 'Desactivar' : 'Activar'}
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

            <Modal show={showCreateModal} onClose={closeCreateModal} maxWidth="lg">
                <form onSubmit={submitCreate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Crear funcionario
                    </h2>

                    <div className="mt-3">
                        <InputLabel htmlFor="name" value="Nombre" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full py-1.5 text-sm"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            isFocused
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="mt-3">
                        <InputLabel htmlFor="employment" value="Cargo" />
                        <TextInput
                            id="employment"
                            className="mt-1 block w-full py-1.5 text-sm"
                            value={data.employment}
                            onChange={(event) => setData('employment', event.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={errors.employment} />
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                            <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Crear usuario</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Activa para registrar correo y contraseña.</p>
                            </div>
                            <button
                                type="button"
                                onClick={toggleCreateUser}
                                className={`relative inline-flex h-8 w-20 items-center rounded-full px-1.5 transition ${data.create_user ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`pointer-events-none inline-flex h-6 w-6 transform rounded-full bg-white shadow transition ${data.create_user ? 'translate-x-12' : 'translate-x-0'}`} />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90">
                                    {data.create_user ? 'ON' : 'OFF'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {data.create_user && (
                        <>
                            <div className="mt-3">
                                <InputLabel htmlFor="email" value="Correo" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={data.email}
                                    onChange={(event) => setData('email', event.target.value)}
                                    required={data.create_user}
                                />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="mt-3">
                                <InputLabel htmlFor="password" value="Contraseña" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    required={data.create_user}
                                />
                                <InputError className="mt-2" message={errors.password} />
                            </div>

                            <div className="mt-3">
                                <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={data.password_confirmation}
                                    onChange={(event) => setData('password_confirmation', event.target.value)}
                                    required={data.create_user}
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={closeCreateModal} className="inline-flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="inline-flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Guardar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showEditModal} onClose={closeEditModal} maxWidth="lg">
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Modificar funcionario
                    </h2>

                    <div className="mt-3">
                        <InputLabel htmlFor="edit_name" value="Nombre" />
                        <TextInput
                            id="edit_name"
                            className="mt-1 block w-full py-1.5 text-sm"
                            value={editData.name}
                            onChange={(event) => setEditData('name', event.target.value)}
                            required
                            isFocused
                        />
                        <InputError className="mt-2" message={editErrors.name} />
                    </div>

                    <div className="mt-3">
                        <InputLabel htmlFor="edit_employment" value="Cargo" />
                        <TextInput
                            id="edit_employment"
                            className="mt-1 block w-full py-1.5 text-sm"
                            value={editData.employment}
                            onChange={(event) => setEditData('employment', event.target.value)}
                            required
                        />
                        <InputError className="mt-2" message={editErrors.employment} />
                    </div>

                    <div className="mt-5">
                        <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                            <div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Crear usuario</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">Activa para asignar o actualizar la cuenta.</p>
                            </div>
                            <button
                                type="button"
                                onClick={toggleEditCreateUser}
                                className={`relative inline-flex h-8 w-20 items-center rounded-full px-1.5 transition ${editData.create_user ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                                <span className={`pointer-events-none inline-flex h-6 w-6 transform rounded-full bg-white shadow transition ${editData.create_user ? 'translate-x-12' : 'translate-x-0'}`} />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/90">
                                    {editData.create_user ? 'ON' : 'OFF'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {editData.create_user && (
                        <>
                            <div className="mt-3">
                                <InputLabel htmlFor="edit_email" value="Correo" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={editData.email}
                                    onChange={(event) => setEditData('email', event.target.value)}
                                    required={editData.create_user}
                                />
                                <InputError className="mt-2" message={editErrors.email} />
                            </div>

                            <div className="mt-3">
                                <InputLabel htmlFor="edit_password" value="Contraseña" />
                                <TextInput
                                    id="edit_password"
                                    type="password"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={editData.password}
                                    onChange={(event) => setEditData('password', event.target.value)}
                                />
                                <InputError className="mt-2" message={editErrors.password} />
                            </div>

                            <div className="mt-3">
                                <InputLabel htmlFor="edit_password_confirmation" value="Confirmar contraseña" />
                                <TextInput
                                    id="edit_password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full py-1.5 text-sm"
                                    value={editData.password_confirmation}
                                    onChange={(event) => setEditData('password_confirmation', event.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={closeEditModal} className="inline-flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={editProcessing} className="inline-flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Guardar cambios
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal show={showCopyModal} onClose={() => setShowCopyModal(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Tabla copiada</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {copiedRowsCount > 0
                            ? `Se copiaron ${copiedRowsCount} filas al portapapeles.`
                            : 'No hay filas visibles para copiar.'}
                    </p>

                    <div className="mt-6 flex justify-end">
                        <PrimaryButton type="button" onClick={() => setShowCopyModal(false)} className="inline-flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Aceptar
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            <Modal show={showAssignedAssetsModal} onClose={closeAssignedAssetsModal} maxWidth="4xl">
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {selectedPersonForAssets
                            ? `Activos asignados a ${selectedPersonForAssets.name}`
                            : 'Activos asignados'}
                    </h2>

                    {selectedPersonAssets.length === 0 ? (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                            Este funcionario no tiene activos asignados.
                        </p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Marca</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Modelo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Serial</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Agencia</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Ubicación</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-900 dark:divide-gray-700 dark:text-gray-100">
                                    {selectedPersonAssets.map((asset, index) => (
                                        <tr key={asset.idfixedasset}>
                                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.type_name ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.brand ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.model ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.serial ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.agencie_name ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm break-words">{asset.location ?? '-'}</td>
                                            <td className="px-4 py-3 text-sm">{asset.state === 1 ? 'Alta' : 'Baja'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton type="button" onClick={closeAssignedAssetsModal}>Cerrar</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
