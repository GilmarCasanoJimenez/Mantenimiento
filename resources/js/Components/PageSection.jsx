export function PageContainer({ children, width = '7xl', className = '' }) {
    const widthClass = {
        '7xl': 'w-full',
        '3xl': 'w-full',
    }[width] ?? 'w-full';

    return (
        <div className={`py-6 ${className}`.trim()}>
            <div className={`mx-auto ${widthClass} px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10`}>
                {children}
            </div>
        </div>
    );
}

export function PageCard({ children, className = '', contentClassName = '' }) {
    return (
        <div className={`overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800 ${className}`.trim()}>
            <div className={`p-4 text-gray-900 dark:text-gray-100 ${contentClassName}`.trim()}>
                {children}
            </div>
        </div>
    );
}
