import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ importResult = null }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        file: null,
    });

    const submit = (mode) => {
        transform((formData) => ({
            ...formData,
            mode,
        }));

        post(route('settings.import-assets.store'), {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                transform((formData) => formData);
            },
        });
    };

    const statusClass = importResult?.status === 'imported'
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
        : importResult?.status?.includes('preview')
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800';

    const previewSucceeded = ['preview-ok', 'preview-with-warnings'].includes(importResult?.status)
        && (importResult?.errors?.length ?? 0) === 0;

    const canImportNow = !!data.file && previewSucceeded;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Importar Activos
                </h2>
            }
        >
            <Head title="Importar Activos" />

            <PageContainer>
                <PageCard>
                    <div className="space-y-5">
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
                            <p className="font-semibold">Formato Excel/CSV soportado</p>
                            <p className="mt-1">Columnas mínimas detectadas: COD. ACTIVO, AGENCIA, UBICACIÓN, FUNCIONARIO, CARGO, TIPO DE ACTIVO, MARCA.</p>
                            <p className="mt-1">Columnas opcionales: MODELO, DESCRIPCIÓN, SERIAL, FECHA COMPRA, COLOR.</p>
                            <p className="mt-1">Si no envías fecha, se usará la fecha de hoy. Si no envías color, se usará Negro.</p>
                            <p className="mt-1">Agencias y ubicaciones nuevas se crean automáticamente, igual que tipos y funcionarios inexistentes.</p>
                        </div>

                        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-3 py-2 text-left">COD. ACTIVO</th>
                                        <th className="px-3 py-2 text-left">AGENCIA</th>
                                        <th className="px-3 py-2 text-left">UBICACIÓN</th>
                                        <th className="px-3 py-2 text-left">CARGO</th>
                                        <th className="px-3 py-2 text-left">FUNCIONARIO</th>
                                        <th className="px-3 py-2 text-left">TIPO DE ACTIVO</th>
                                        <th className="px-3 py-2 text-left">MARCA</th>
                                        <th className="px-3 py-2 text-left">MODELO</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-gray-200 dark:border-gray-700">
                                        <td className="px-3 py-2">AF-000501</td>
                                        <td className="px-3 py-2">AGENCIA CENTRAL</td>
                                        <td className="px-3 py-2">Auditoría Interna</td>
                                        <td className="px-3 py-2">Auditor I</td>
                                        <td className="px-3 py-2">Juan Pérez</td>
                                        <td className="px-3 py-2">PC</td>
                                        <td className="px-3 py-2">Dell</td>
                                        <td className="px-3 py-2">OptiPlex</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="assets_csv_file">
                                Archivo CSV
                            </label>
                            <input
                                id="assets_csv_file"
                                type="file"
                                accept=".xlsx,.xls,.csv,.txt"
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:file:bg-gray-700 dark:hover:file:bg-gray-600"
                                onChange={(event) => setData('file', event.target.files?.[0] ?? null)}
                            />
                            <InputError message={errors.file} className="mt-2" />
                            <InputError message={errors.mode} className="mt-2" />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <SecondaryButton type="button" disabled={processing || !data.file} onClick={() => submit('preview')}>
                                Simular importación
                            </SecondaryButton>
                            <PrimaryButton type="button" disabled={processing || !canImportNow} onClick={() => submit('import')}>
                                Importar ahora
                            </PrimaryButton>
                            <SecondaryButton type="button" disabled={processing} onClick={() => reset()}>
                                Limpiar
                            </SecondaryButton>
                        </div>

                        {!previewSucceeded && (
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Flujo requerido: 1) subir archivo, 2) simular importación, 3) importar ahora.
                            </p>
                        )}

                        {importResult && (
                            <div className={`rounded-md border p-3 text-sm ${statusClass}`}>
                                <p className="font-semibold">{importResult.message}</p>
                                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                                    <span>Procesadas: {importResult.processed ?? 0}</span>
                                    <span>Válidas: {importResult.valid ?? 0}</span>
                                    <span>Insertadas: {importResult.inserted ?? 0}</span>
                                    <span>Errores: {(importResult.errors ?? []).length}</span>
                                    <span>Alertas: {(importResult.warnings ?? []).length}</span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-xs">
                                    <span>Agencias nuevas: {importResult.created?.agencies ?? 0}</span>
                                    <span>Ubicaciones nuevas: {importResult.created?.locations ?? 0}</span>
                                    <span>Tipos nuevos: {importResult.created?.types ?? 0}</span>
                                    <span>Funcionarios nuevos: {importResult.created?.people ?? 0}</span>
                                </div>
                            </div>
                        )}

                        {importResult?.errors?.length > 0 && (
                            <div className="overflow-x-auto rounded-md border border-red-200 dark:border-red-800">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-red-50 dark:bg-red-900/20">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Línea</th>
                                            <th className="px-3 py-2 text-left">Código</th>
                                            <th className="px-3 py-2 text-left">Detalle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.errors.map((error, index) => (
                                            <tr key={`${error.line}-${index}`} className="border-t border-red-100 dark:border-red-800/40">
                                                <td className="px-3 py-2">{error.line}</td>
                                                <td className="px-3 py-2">{error.asset_code || '-'}</td>
                                                <td className="px-3 py-2">{(error.messages || []).join(' | ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {importResult?.warnings?.length > 0 && (
                            <div className="overflow-x-auto rounded-md border border-amber-200 dark:border-amber-800">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-amber-50 dark:bg-amber-900/20">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Línea</th>
                                            <th className="px-3 py-2 text-left">Código</th>
                                            <th className="px-3 py-2 text-left">Alerta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.warnings.map((warning, index) => (
                                            <tr key={`${warning.line}-${index}`} className="border-t border-amber-100 dark:border-amber-800/40">
                                                <td className="px-3 py-2">{warning.line}</td>
                                                <td className="px-3 py-2">{warning.asset_code || '-'}</td>
                                                <td className="px-3 py-2">{(warning.messages || []).join(' | ')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
