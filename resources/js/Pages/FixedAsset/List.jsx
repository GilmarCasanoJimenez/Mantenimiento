import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function FixedAssetList({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight dark:text-gray-100">Lista de Activos</h2>}
        >
            <Head title="Lista de Activos" />

            <PageContainer>
                <PageCard className="dark:shadow-gray-900/30">Aquí verás la lista de activos fijos.</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
