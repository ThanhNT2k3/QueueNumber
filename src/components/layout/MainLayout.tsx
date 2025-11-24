import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { UserMenu } from '../ui/UserMenu';
import * as Icons from 'lucide-react';

export const MainLayout: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <div className="h-screen flex flex-col">
            {/* Top Navigation */}
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

                    {/* Common Display Link */}
                    <NavLink to="/display" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Icons.Tv size={14} /> <span className="hidden md:inline">MAIN DISPLAY</span>
                    </NavLink>

                    {/* Kiosk Link - Hide for TELLER */}
                    {user?.role !== 'TELLER' && (
                        <NavLink to="/kiosk" className={({ isActive }) => `px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                            <Icons.TabletSmartphone size={14} /> <span className="hidden md:inline">KIOSK (DEMO)</span>
                        </NavLink>
                    )}

                </div>

                {/* User Menu */}
                <UserMenu />
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};
