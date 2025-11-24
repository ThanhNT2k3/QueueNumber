import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../components/layout/MainLayout';
import { MinimalLayout } from '../components/layout/MinimalLayout';

// Feature Imports
import { LoginPage, UserProfile } from '../features/authentication';
import { KioskPage } from '../features/ticketing';
import { MainDisplay } from '../features/queue-display';
import { FeedbackTerminal } from '../features/customer-feedback';
import { CounterTerminalPage, CounterDisplay } from '../features/counter-operations';
import {
    DashboardPage,
    UserManagementPage,
    BranchManagementPage,
    ServiceManagementPage,
    CounterManagementPage,
    ReportsPage
} from '../features/administration';
import { CounterAssignmentAuditPage } from '../features/administration/audit/CounterAssignmentAuditPage';

export const AppRoutes: React.FC = () => {
    const { user, isAuthenticated } = useAuthStore();

    return (
        <Routes>
            {/* Public / Standalone Routes (Wrapped in MinimalLayout) */}
            <Route element={<MinimalLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/kiosk" element={<KioskPage />} />
                <Route path="/display" element={<MainDisplay />} />
                <Route path="/counter-display" element={<CounterDisplay />} />
                <Route path="/feedback" element={<FeedbackTerminal />} />
            </Route>

            {/* Protected Routes wrapped in MainLayout */}
            <Route element={
                <ProtectedRoute>
                    <MainLayout />
                </ProtectedRoute>
            }>
                <Route path="/profile" element={<UserProfile />} />

                {/* Teller Routes */}
                <Route path="/counter" element={
                    <ProtectedRoute roles={['TELLER']}>
                        <CounterTerminalPage />
                    </ProtectedRoute>
                } />

                {/* Manager & Admin Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/audit" element={
                    <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                        <CounterAssignmentAuditPage />
                    </ProtectedRoute>
                } />

                {/* Manager Specific Routes */}
                <Route path="/reports" element={
                    <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
                        <ReportsPage />
                    </ProtectedRoute>
                } />
                <Route path="/manager/counters" element={
                    <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
                        <CounterManagementPage />
                    </ProtectedRoute>
                } />

                {/* Admin Specific Routes */}
                <Route path="/users" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <UserManagementPage />
                    </ProtectedRoute>
                } />
                <Route path="/branches" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <BranchManagementPage />
                    </ProtectedRoute>
                } />
                <Route path="/categories" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <ServiceManagementPage />
                    </ProtectedRoute>
                } />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'TELLER' ? '/counter' : '/dashboard') : '/login'} replace />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
