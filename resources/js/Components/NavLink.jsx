import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
