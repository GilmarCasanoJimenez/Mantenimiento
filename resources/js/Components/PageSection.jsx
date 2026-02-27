export function PageContainer({ children, width = '7xl', className = '' }) {
    const widthClass = {
        '7xl': 'max-w-7xl',
        '3xl': 'max-w-3xl',
    }[width] ?? 'max-w-7xl';

    return (
        <div className={`py-6 ${className}`.trim()}>
            <div className={`mx-auto ${widthClass} sm:px-6 lg:px-8`}>
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
