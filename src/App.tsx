import React from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './stores/AuthContext';
import { LoginPage, UserProfile } from './features/authentication';
import { UserMenu } from './components/ui/UserMenu';
import { KioskPage } from './features/ticketing';
import { MainDisplay } from './features/queue-display';
import { FeedbackTerminal } from './features/customer-feedback';
import { CounterTerminalPage, CounterDisplay } from './features/counter-operations';
import {
  DashboardPage,
  UserManagementPage,
  BranchManagementPage,
  ServiceManagementPage,
  CounterManagementPage,
  ReportsPage
} from './features/administration';
import { CounterAssignmentAuditPage } from './features/administration/audit/CounterAssignmentAuditPage';
import * as Icons from 'lucide-react';

const ProtectedRoute = ({ children, roles }: { children: React.ReactElement, roles?: string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
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

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Hide nav on specific routes (Kiosk, Displays, Login)
  const hideNav = location.pathname === '/kiosk' ||
    location.pathname === '/display' ||
    location.pathname === '/counter-display' ||
    location.pathname === '/login' ||
    location.pathname === '/feedback';

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      {!hideNav && (
        <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between z-50 shrink-0 shadow-sm">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Icons.Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Standard Chartered</h1>
              <p className="text-xs text-gray-500">Queue Management System</p>
            </div>
          </div>

          {/* View Switcher - Role Based */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-2xl">

            {/* ADMIN & MANAGER: Dashboard */}
            {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Icons.BarChart3 size={14} /> <span className="hidden md:inline">DASHBOARD</span>
              </NavLink>
            )}

            {/* MANAGER: Reports & Counters */}
            {user?.role === 'MANAGER' && (
              <>
                <NavLink to="/reports" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.FileBarChart size={14} /> <span className="hidden md:inline">REPORTS</span>
                </NavLink>
                <NavLink to="/manager/counters" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Settings2 size={14} /> <span className="hidden md:inline">COUNTERS</span>
                </NavLink>
              </>
            )}

            {/* ADMIN: Users, Branches & Categories */}
            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/users" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Users size={14} /> <span className="hidden md:inline">USERS</span>
                </NavLink>
                <NavLink to="/branches" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Building2 size={14} /> <span className="hidden md:inline">BRANCHES</span>
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Tags size={14} /> <span className="hidden md:inline">CATEGORIES</span>
                </NavLink>
                <NavLink to="/audit" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.History size={14} /> <span className="hidden md:inline">AUDIT</span>
                </NavLink>
              </>
            )}

            {/* TELLER: Counter Terminal & Counter Display */}
            {user?.role === 'TELLER' && (
              <>
                <NavLink to="/counter" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.MonitorSpeaker size={14} /> <span className="hidden md:inline">COUNTER</span>
                </NavLink>
                <NavLink to="/counter-display" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Monitor size={14} /> <span className="hidden md:inline">COUNTER DISPLAY</span>
                </NavLink>
              </>
            )}

            {/* Common Display Link (Visible to all except maybe purely back-office, keeping for now) */}
            <NavLink to="/display" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.Tv size={14} /> <span className="hidden md:inline">MAIN DISPLAY</span>
            </NavLink>

            {/* Kiosk Link - Hide for TELLER as requested */}
            {user?.role !== 'TELLER' && (
              <NavLink to="/kiosk" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                <Icons.TabletSmartphone size={14} /> <span className="hidden md:inline">KIOSK (DEMO)</span>
              </NavLink>
            )}

          </div>

          {/* User Menu */}
          <UserMenu />
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Public / Standalone Routes */}
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="/display" element={<MainDisplay />} />
          <Route path="/counter-display" element={<CounterDisplay />} />
          <Route path="/feedback" element={<FeedbackTerminal />} />

          {/* Protected Routes */}
          <Route path="/counter" element={
            <ProtectedRoute roles={['TELLER']}>
              <CounterTerminalPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Manager Routes */}
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

          {/* Admin Routes */}
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
          <Route path="/audit" element={
            <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
              <CounterAssignmentAuditPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'TELLER' ? '/counter' : '/dashboard') : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
