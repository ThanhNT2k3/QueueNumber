import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
    size?: 'small' | 'default' | 'large';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className = '', size = 'default' }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        default: 'max-w-2xl',
        large: 'max-w-5xl'
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export interface ModalHeaderProps {
    children: React.ReactNode;
    onClose?: () => void;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, onClose, className = '' }) => (
    <div className={`flex items-center justify-between p-6 border-b border-gray-100 ${className}`}>
        <div className="flex-1">{children}</div>
        {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors ml-4">
                <X size={20} />
            </button>
        )}
    </div>
);

export interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => (
    <div className={`p-6 overflow-y-auto ${className}`}>
        {children}
    </div>
);

export interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => (
    <div className={`p-6 border-t border-gray-100 flex justify-end gap-3 ${className}`}>
        {children}
    </div>
);
