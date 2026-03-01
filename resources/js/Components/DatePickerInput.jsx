import { Popover, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';

const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const fromIsoDate = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
};

const isValidDateParts = (year, month, day) => {
    const candidate = new Date(year, month - 1, day);

    return candidate.getFullYear() === year
        && candidate.getMonth() === month - 1
        && candidate.getDate() === day;
};

const parseTypedDate = (typedValue) => {
    const cleanValue = typedValue.trim();

    if (!cleanValue) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
        return fromIsoDate(cleanValue) ? cleanValue : null;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleanValue)) {
        const [day, month, year] = cleanValue.split('/').map(Number);

        if (!isValidDateParts(year, month, day)) {
            return null;
        }

        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    return null;
};

const toDisplayDate = (date) => {
    if (!date) {
        return '';
    }

    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const applyDateMask = (rawValue) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 2) {
        return digits;
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

export default function DatePickerInput({ id, value, onChange, placeholder = 'Selecciona fecha' }) {
    const selectedDate = useMemo(() => fromIsoDate(value), [value]);
    const [typedValue, setTypedValue] = useState(toDisplayDate(selectedDate));

    useEffect(() => {
        setTypedValue(toDisplayDate(selectedDate));
    }, [selectedDate]);

    const commitTypedValue = () => {
        const parsedValue = parseTypedDate(typedValue);

        if (parsedValue === null) {
            setTypedValue(toDisplayDate(selectedDate));
            return;
        }

        onChange(parsedValue);
    };

    const syncIfValidDate = (candidateValue) => {
        const parsedValue = parseTypedDate(candidateValue);

        if (parsedValue && parsedValue !== value) {
            onChange(parsedValue);
        }
    };

    return (
        <Popover className="relative mt-1">
            {({ close }) => (
                <>
                    <div className="relative">
                        <input
                            id={id}
                            type="text"
                            inputMode="numeric"
                            placeholder={`${placeholder} (dd/mm/aaaa)`}
                            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-4 pr-12 text-left text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                            value={typedValue}
                            onChange={(event) => {
                                const nextValue = event.target.value;

                                if (!nextValue.trim()) {
                                    setTypedValue('');
                                    onChange('');
                                    return;
                                }

                                if (nextValue.includes('-')) {
                                    const normalizedValue = nextValue.replace(/[^\d-]/g, '').slice(0, 10);
                                    setTypedValue(normalizedValue);
                                    syncIfValidDate(normalizedValue);
                                    return;
                                }

                                const maskedValue = applyDateMask(nextValue);
                                setTypedValue(maskedValue);
                                syncIfValidDate(maskedValue);

                            }}
                            onBlur={commitTypedValue}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    commitTypedValue();
                                }
                            }}
                        />
                        <Popover.Button
                            type="button"
                            className="absolute inset-y-1 right-1 inline-flex items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="5" ry="5" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </Popover.Button>
                    </div>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Popover.Panel className="absolute z-50 mt-2 rounded-2xl border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            <DayPicker
                                mode="single"
                                locale={es}
                                selected={selectedDate}
                                onSelect={(date) => {
                                    onChange(date ? toIsoDate(date) : '');
                                    close();
                                }}
                                showOutsideDays
                                weekStartsOn={1}
                                classNames={{
                                    months: 'flex flex-col sm:flex-row gap-2',
                                    month: 'space-y-3',
                                    caption: 'flex justify-center pt-1 relative items-center',
                                    caption_label: 'text-sm font-medium text-gray-900 dark:text-gray-100',
                                    nav: 'space-x-1 flex items-center',
                                    button_previous: 'h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
                                    button_next: 'h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
                                    table: 'w-full border-collapse',
                                    head_row: 'flex',
                                    head_cell: 'w-10 rounded-full text-[0.8rem] font-normal text-gray-500 dark:text-gray-400',
                                    row: 'flex w-full mt-1',
                                    cell: 'h-10 w-10 text-center text-sm p-0 relative',
                                    day: 'h-10 w-10 rounded-full text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800',
                                    day_selected: 'bg-indigo-600 text-white hover:bg-indigo-600 rounded-full',
                                    day_today: 'border border-indigo-500 rounded-full',
                                    day_outside: 'text-gray-400 dark:text-gray-500',
                                    day_disabled: 'opacity-50',
                                }}
                            />

                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange('');
                                        close();
                                    }}
                                    className="text-xs font-semibold uppercase tracking-widest text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
