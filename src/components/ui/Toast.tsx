import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Icons from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, variant: ToastVariant = 'info', duration: number = 3000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, message, variant, duration };

        setToasts(prev => [...prev, newToast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const variants = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <Icons.CheckCircle className="w-5 h-5 text-green-600" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <Icons.XCircle className="w-5 h-5 text-red-600" />
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: <Icons.AlertTriangle className="w-5 h-5 text-yellow-600" />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: <Icons.Info className="w-5 h-5 text-blue-600" />
        }
    };

    const style = variants[toast.variant];

    return (
        <div
            className={`${style.bg} ${style.border} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-right duration-300`}
        >
            {style.icon}
            <p className={`flex-1 text-sm font-medium ${style.text}`}>{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className={`${style.text} hover:opacity-70 transition-opacity`}
            >
                <Icons.X className="w-4 h-4" />
            </button>
        </div>
    );
};
