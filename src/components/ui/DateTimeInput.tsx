import React, { forwardRef } from 'react';
import { Calendar, Clock } from 'lucide-react';

export interface DateTimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    type?: 'date' | 'time' | 'datetime-local';
    showIcon?: boolean;
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(({
    label,
    error,
    helperText,
    className = '',
    id,
    required,
    disabled,
    type = 'date',
    showIcon = true,
    ...props
}, ref) => {
    const inputId = id || props.name;

    const getIcon = () => {
        if (!showIcon) return null;
        switch (type) {
            case 'time':
                return <Clock className="w-4 h-4" />;
            case 'date':
            case 'datetime-local':
            default:
                return <Calendar className="w-4 h-4" />;
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {showIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        {getIcon()}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    disabled={disabled}
                    className={`
            block w-full ${showIcon ? 'pl-10' : 'pl-3'} pr-3 py-2
            border rounded-lg
            text-sm
            transition-colors
            ${error
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }
            ${disabled
                            ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-900'
                        }
            focus:outline-none focus:ring-2
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
});

DateTimeInput.displayName = 'DateTimeInput';
