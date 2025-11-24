import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';
import * as Icons from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactElement;
    roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <Icons.Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && user && !roles.includes(user.role)) {
        // Redirect to a safe default based on role
        if (user.role === 'TELLER') return <Navigate to="/counter" replace />;
        if (user.role === 'MANAGER') return <Navigate to="/dashboard" replace />;
        if (user.role === 'ADMIN') return <Navigate to="/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};
