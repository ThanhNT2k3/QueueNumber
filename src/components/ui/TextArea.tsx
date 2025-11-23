import React, { forwardRef } from 'react';
import { Label } from './Label';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
    label,
    error,
    helperText,
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

            <textarea
                ref={ref}
                id={inputId}
                disabled={disabled}
                className={`
          w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
          ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }
          ${className}
        `}
                {...props}
            />

            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
        </div>
    );
});

TextArea.displayName = 'TextArea';
