import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function FixedAssetAssignment({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Asignación de Activo</h2>}
        >
            <Head title="Asignación de Activo" />

            <PageContainer>
                <PageCard className="dark:shadow-gray-900/30">Aquí gestionarás la asignación de activos.</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
