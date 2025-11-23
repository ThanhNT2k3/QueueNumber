import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    iconColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'gray';
    trend?: {
        value: string;
        isPositive?: boolean;
    };
    subtitle?: string;
    className?: string;
    onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    iconColor = 'blue',
    trend,
    subtitle,
    className = '',
    onClick
}) => {
    const iconColors = {
        blue: 'text-blue-500 bg-blue-50',
        green: 'text-green-500 bg-green-50',
        red: 'text-red-500 bg-red-50',
        yellow: 'text-yellow-500 bg-yellow-50',
        purple: 'text-purple-500 bg-purple-50',
        orange: 'text-orange-500 bg-orange-50',
        gray: 'text-gray-500 bg-gray-50'
    };

    return (
        <div
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Header with Icon */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 font-medium">{title}</h3>
                {icon && (
                    <div className={`${iconColors[iconColor]} p-2 rounded-lg`}>
                        {icon}
                    </div>
                )}
            </div>

            {/* Value */}
            <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>

            {/* Trend or Subtitle */}
            {trend && (
                <p className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.isPositive ? '↑' : '↓'} {trend.value}
                </p>
            )}
            {subtitle && !trend && (
                <p className="text-sm text-gray-500">{subtitle}</p>
            )}
        </div>
    );
};
