import React from 'react';
import * as Icons from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    children,
    onClose,
    className = '',
    icon
}) => {
    const variants = {
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: icon || <Icons.CheckCircle className="w-5 h-5 text-green-600" />,
            title: 'text-green-900'
        },
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: icon || <Icons.XCircle className="w-5 h-5 text-red-600" />,
            title: 'text-red-900'
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            icon: icon || <Icons.AlertTriangle className="w-5 h-5 text-yellow-600" />,
            title: 'text-yellow-900'
        },
        info: {
            container: 'bg-blue-50 border-blue-200 text-blue-800',
            icon: icon || <Icons.Info className="w-5 h-5 text-blue-600" />,
            title: 'text-blue-900'
        }
    };

    const style = variants[variant];

    return (
        <div className={`${style.container} border rounded-lg p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {style.icon}
                </div>
                <div className="flex-1">
                    {title && (
                        <h3 className={`font-semibold mb-1 ${style.title}`}>
                            {title}
                        </h3>
                    )}
                    <div className="text-sm">
                        {children}
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
