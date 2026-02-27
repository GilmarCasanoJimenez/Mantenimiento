import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function FixedAssetIndex({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Activos fijos</h2>}
        >
            <Head title="Activos fijos" />

            <PageContainer>
                <PageCard className="dark:shadow-gray-900/30" contentClassName="text-gray-900 dark:text-gray-100">
                    Módulo de activos fijos listo para empezar.
                </PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
