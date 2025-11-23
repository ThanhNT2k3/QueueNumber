import React, { useState, useEffect } from 'react';
import { useAuth } from '../../stores/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../config/translations';
import { API_BASE_URL } from '../../config/constants';
import * as Icons from 'lucide-react';

export const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [branchName, setBranchName] = useState<string | null>(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        const fetchBranchName = async () => {
            if (user?.branchId && (user.role === 'TELLER' || user.role === 'MANAGER')) {
                try {
                    // Try to fetch specific branch first if endpoint exists, otherwise fetch all
                    // Based on BranchManagementPage, we can use /branch/{id}
                    const response = await fetch(`${API_BASE_URL}/branch/${user.branchId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setBranchName(data.name);
                    }
                } catch (error) {
                    console.error("Failed to fetch branch info", error);
                }
            }
        };

        fetchBranchName();
    }, [user]);

    if (!user) return null;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'TELLER': return 'bg-green-100 text-green-700 border-green-200';
            case 'MANAGER': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="relative">
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
                <div className="text-left hidden md:block">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">{user.role}</p>
                        {branchName && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 truncate max-w-[120px]" title={branchName}>
                                {branchName}
                            </span>
                        )}
                    </div>
                </div>
                <Icons.ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slideDown">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-4 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{user.name}</p>
                                    <p className="text-xs text-blue-100">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)} bg-white bg-opacity-90`}>
                                    <Icons.Shield className="w-3 h-3" />
                                    {user.role}
                                </div>
                                {branchName && (
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-white/20 text-white border-white/30">
                                        <Icons.Building2 className="w-3 h-3" />
                                        {branchName}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/profile');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <Icons.User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{t.menu.profile}</p>
                                    <p className="text-xs text-gray-500">{t.menu.profileDesc}</p>
                                </div>
                            </button>
                            <div className="my-2 border-t border-gray-200"></div>

                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-left group"
                            >
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    <Icons.LogOut className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-600">{t.menu.signOut}</p>
                                    <p className="text-xs text-red-400">{t.menu.signOutDesc}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};
