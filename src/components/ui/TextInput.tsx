import React, { forwardRef } from 'react';
import { Label } from './Label';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    className = '',
    id,
    required,
    disabled,
    ...props
}, ref) => {
    const inputId = id || props.name;

    return (
        <div className="w-full">
            {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    disabled={disabled}
                    className={`
            w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                        }
            ${className}
          `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
});

TextInput.displayName = 'TextInput';
