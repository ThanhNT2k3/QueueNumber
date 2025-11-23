import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon: React.ReactNode;
}

export const ButtonIcon: React.FC<ButtonIconProps> = ({
    variant = 'ghost',
    size = 'md',
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
        ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
        outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    };

    const sizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
        </button>
    );
};
