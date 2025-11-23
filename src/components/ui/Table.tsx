import React from 'react';

export interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        <table className="w-full text-left">
            {children}
        </table>
    </div>
);

export interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => (
    <thead className={`bg-gray-50 border-b border-gray-100 ${className}`}>
        {children}
    </thead>
);

export interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => (
    <tbody className={className}>
        {children}
    </tbody>
);

export interface TableRowProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className = '', onClick }) => (
    <tr
        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        {children}
    </tr>
);

export interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '', align = 'left' }) => {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <th className={`p-4 font-semibold text-gray-600 ${alignClass} ${className}`}>
            {children}
        </th>
    );
};

export interface TableCellProps {
    children: React.ReactNode;
    className?: string;
    align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', align = 'left' }) => {
    const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[align];

    return (
        <td className={`p-4 ${alignClass} ${className}`}>
            {children}
        </td>
    );
};

// Empty state component for tables
export interface TableEmptyProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({ icon, title, description, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        {icon && <div className="flex justify-center mb-4">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-500 mb-4">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
    </div>
);
