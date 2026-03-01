import { useEffect, useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const authUser = usePage().props?.auth?.user;
    const currentUser = user ?? authUser;
    const displayName = currentUser?.person?.name ?? currentUser?.name ?? currentUser?.email ?? 'Usuario';
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const isFixedAssetRoute = route().current('fixedasset.*');
    const isITResourcesRoute = route().current('itresources.*');
    const isMaintenanceRoute = route().current('maintenance.*');
    const isPersonRoute = route().current('person.*');
    const isSettingsRoute = route().current('settings.*');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const useDarkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

        setIsDarkMode(useDarkMode);
        document.documentElement.classList.toggle('dark', useDarkMode);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode((previous) => {
            const next = !previous;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="bg-white border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="mx-auto w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href={route('dashboard')}>
                                    <ApplicationLogo className="block h-14 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Inicio
                                </NavLink>
                                <div className="flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ' +
                                                    (isFixedAssetRoute
                                                        ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ')
                                                }
                                            >
                                                Activos fijos
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('fixedasset.list')}>Lista de Activos</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                                <div className="flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ' +
                                                    (isITResourcesRoute
                                                        ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ')
                                                }
                                            >
                                                Recursos Informáticos
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="48">
                                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">HARDWARE</div>
                                            <Dropdown.Link href={route('itresources.hardware.list')}>Lista de Hardware</Dropdown.Link>
                                            <Dropdown.Link href={route('itresources.hardware.details')}>Detalles</Dropdown.Link>
                                            <div className="border-t border-gray-100 dark:border-gray-700" />
                                            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">SOFTWARE</div>
                                            <Dropdown.Link href={route('itresources.software.list')}>Lista de Software</Dropdown.Link>
                                            <Dropdown.Link href={route('itresources.software.installed')}>Software Instalado</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                                <div className="flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ' +
                                                    (isMaintenanceRoute
                                                        ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ')
                                                }
                                            >
                                                Mantenimientos
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('maintenance.list')}>Lista de Mantenimientos</Dropdown.Link>
                                            <Dropdown.Link href={route('maintenance.history')}>Historial de Mantenimientos</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                                <div className="flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ' +
                                                    (isPersonRoute
                                                        ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ')
                                                }
                                            >
                                                Funcionario
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('person.list')}>Lista de Funcionarios</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                                <div className="flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className={
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ' +
                                                    (isSettingsRoute
                                                        ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:text-gray-100 dark:focus:border-indigo-500 '
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:border-gray-500 dark:focus:text-gray-100 dark:focus:border-gray-500 ')
                                                }
                                            >
                                                Configuraciones
                                                <svg className="ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content align="left" width="48">
                                            <Dropdown.Link href={route('settings.agencies.list')}>Agencias</Dropdown.Link>
                                            <Dropdown.Link href={route('settings.asset-types.list')}>Tipos de Activos</Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ms-6">
                            <div className="ms-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150 dark:bg-gray-800 dark:text-gray-200 dark:hover:text-white"
                                            >
                                                {displayName}

                                                <svg
                                                    className="ms-2 -me-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-1 bg-white dark:bg-gray-800">
                                        <Dropdown.Button onClick={toggleTheme}>
                                            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                                        </Dropdown.Button>
                                        <Dropdown.Link href={route('profile.edit')}>Cambiar contraseña</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Cerrar sesión
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:focus:text-gray-100"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden dark:bg-gray-800'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Inicio
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('fixedasset.list')} active={route().current('fixedasset.list')}>
                            Lista de Activos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('itresources.hardware.list')} active={route().current('itresources.hardware.list')}>
                            Lista de Hardware
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('itresources.hardware.details')} active={route().current('itresources.hardware.details')}>
                            Detalles
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('itresources.software.list')} active={route().current('itresources.software.list')}>
                            Lista de Software
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('itresources.software.installed')} active={route().current('itresources.software.installed')}>
                            Software Instalado
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('maintenance.list')} active={route().current('maintenance.list')}>
                            Lista de Mantenimientos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('maintenance.history')} active={route().current('maintenance.history')}>
                            Historial de Mantenimientos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('person.list')} active={route().current('person.list')}>
                            Lista de Funcionarios
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('settings.agencies.list')} active={route().current('settings.agencies.list')}>
                            Agencias
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('settings.asset-types.list')} active={route().current('settings.asset-types.list')}>
                            Tipos de Activos
                        </ResponsiveNavLink>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-700">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800 dark:text-gray-100">{displayName}</div>
                            <div className="font-medium text-sm text-gray-500 dark:text-gray-300">{currentUser?.email ?? ''}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Cambiar contraseña</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Cerrar sesión
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800 dark:text-gray-100">
                    <div className="mx-auto w-full py-6 px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 dark:[&_h2]:text-gray-100">{header}</div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
