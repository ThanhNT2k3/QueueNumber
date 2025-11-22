import React from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from './stores/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { UserProfile } from './features/auth/UserProfile';
import { UserMenu } from './components/ui/UserMenu';
import { Kiosk } from './features/queue/Kiosk';
import { MainDisplay } from './features/queue/MainDisplay';
import { FeedbackTerminal } from './features/queue/FeedbackTerminal';
import { CounterTerminal } from './features/counter/CounterTerminal';
import { CounterDisplay } from './features/counter/CounterDisplay';
import { Dashboard } from './features/dashboard/Dashboard';
import { UserManagement } from './features/admin/UserManagement';
import { CategoryManagement } from './features/admin/CategoryManagement';
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
    return <Navigate to="/" replace />;
  }

  return children;
};

const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide nav on specific routes if needed (e.g., Display, Login)
  const hideNav = location.pathname === '/display' || location.pathname === '/counter-display' || location.pathname === '/login';

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
              <h1 className="text-lg font-bold text-gray-900">BankNext QMS</h1>
              <p className="text-xs text-gray-500">Queue Management System</p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-2xl">
            <NavLink to="/kiosk" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.TabletSmartphone size={14} /> <span className="hidden md:inline">KIOSK</span>
            </NavLink>
            <NavLink to="/display" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.Tv size={14} /> <span className="hidden md:inline">DISPLAY</span>
            </NavLink>
            <NavLink to="/counter" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.MonitorSpeaker size={14} /> <span className="hidden md:inline">COUNTER</span>
            </NavLink>
            <NavLink to="/counter-display" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.Monitor size={14} /> <span className="hidden md:inline">COUNTER_DISP</span>
            </NavLink>
            <NavLink to="/feedback" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.Smile size={14} /> <span className="hidden md:inline">FEEDBACK</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              <Icons.BarChart3 size={14} /> <span className="hidden md:inline">DASHBOARD</span>
            </NavLink>

            {/* Admin Only Views */}
            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/users" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Users size={14} /> <span className="hidden md:inline">USERS</span>
                </NavLink>
                <NavLink to="/categories" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                  <Icons.Tags size={14} /> <span className="hidden md:inline">CATEGORIES</span>
                </NavLink>
              </>
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

          {/* Public Routes (or semi-public) */}
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/display" element={<MainDisplay />} />
          <Route path="/counter-display" element={<CounterDisplay />} />
          <Route path="/feedback" element={<FeedbackTerminal />} />

          {/* Protected Routes */}
          <Route path="/counter" element={
            <ProtectedRoute>
              <CounterTerminal />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute roles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute roles={['ADMIN']}>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/kiosk" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
