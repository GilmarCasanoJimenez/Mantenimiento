import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function Details() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Hardware Details
                </h2>
            }
        >
            <Head title="Hardware Details" />

            <PageContainer>
                <PageCard>Hardware details page</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
