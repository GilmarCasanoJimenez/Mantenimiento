import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function MaintenanceHistory({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Historial de Mantenimientos</h2>}
        >
            <Head title="Historial de Mantenimientos" />

            <PageContainer>
                <PageCard className="dark:shadow-gray-900/30">Aquí consultarás el historial de mantenimientos.</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
