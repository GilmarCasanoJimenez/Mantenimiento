import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageCard, PageContainer } from '@/Components/PageSection';
import { Head } from '@inertiajs/react';

export default function List() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Hardware List
                </h2>
            }
        >
            <Head title="Hardware List" />

            <PageContainer>
                <PageCard>Hardware list page</PageCard>
            </PageContainer>
        </AuthenticatedLayout>
    );
}
