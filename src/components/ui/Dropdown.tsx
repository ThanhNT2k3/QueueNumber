import React, { forwardRef } from 'react';
import { Label } from './Label';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
    value: string | number;
    label: string;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options?: DropdownOption[];
    placeholder?: string;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(({
    label,
    error,
    helperText,
    options = [],
    placeholder,
    className = '',
    id,
    required,
    disabled,
    children,
    ...props
}, ref) => {
    const selectId = id || props.name;

    return (
        <div className="w-full">
            {label && <Label htmlFor={selectId} required={required}>{label}</Label>}

            <div className="relative">
                <select
                    ref={ref}
                    id={selectId}
                    disabled={disabled}
                    className={`
            w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }
            ${className}
          `}
                    {...props}
                >
                    {placeholder && <option value="" disabled selected>{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                    {children}
                </select>

                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                    <ChevronDown size={16} />
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
});

Dropdown.displayName = 'Dropdown';
