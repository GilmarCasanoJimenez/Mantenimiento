import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function Installed() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Installed Software
                </h2>
            }
        >
            <Head title="Installed Software" />

            <PageContainer>
                <PageCard>Installed software page</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
