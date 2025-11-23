import React, { forwardRef } from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
    label,
    error,
    className = '',
    id,
    disabled,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    disabled={disabled}
                    className={`
            w-4 h-4 text-blue-600 border-gray-300 rounded 
            focus:ring-blue-500 focus:ring-2 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${className}
          `}
                    {...props}
                />
            </div>
            {label && (
                <div className="ml-2 text-sm">
                    <label htmlFor={inputId} className={`font-medium text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                        {label}
                    </label>
                    {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
                </div>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';
