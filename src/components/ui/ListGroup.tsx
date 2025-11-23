import React from 'react';

export interface ListGroupProps {
    children: React.ReactNode;
    className?: string;
}

export const ListGroup: React.FC<ListGroupProps> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
        {children}
    </div>
);

export interface ListGroupItemProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    badge?: React.ReactNode;
}

export const ListGroupItem: React.FC<ListGroupItemProps> = ({
    children,
    className = '',
    onClick,
    active = false,
    disabled = false,
    leftIcon,
    rightIcon,
    badge
}) => {
    const baseStyles = 'px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors';
    const interactiveStyles = onClick && !disabled
        ? 'cursor-pointer hover:bg-gray-50'
        : '';
    const activeStyles = active ? 'bg-blue-50 border-l-4 border-l-blue-600' : '';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

    return (
        <div
            className={`${baseStyles} ${interactiveStyles} ${activeStyles} ${disabledStyles} ${className}`}
            onClick={!disabled ? onClick : undefined}
        >
            <div className="flex items-center gap-3">
                {leftIcon && <div className="flex-shrink-0">{leftIcon}</div>}
                <div className="flex-1 min-w-0">{children}</div>
                {badge && <div className="flex-shrink-0">{badge}</div>}
                {rightIcon && <div className="flex-shrink-0">{rightIcon}</div>}
            </div>
        </div>
    );
};

export interface ListGroupHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const ListGroupHeader: React.FC<ListGroupHeaderProps> = ({ children, className = '' }) => (
    <div className={`px-4 py-2 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700 ${className}`}>
        {children}
    </div>
);
