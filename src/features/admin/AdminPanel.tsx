
import React, { useState } from 'react';
import { useQMS } from '../../stores/QMSContext';
import { useAuth } from '../../stores/AuthContext';
import { TicketStatus, ServiceType } from '../../types/types';
import { SERVICES } from '../../config/service-definitions';
import * as Icons from 'lucide-react';

type AdminTab = 'dashboard' | 'staff' | 'services' | 'counters' | 'history' | 'reports';

export const AdminPanel: React.FC = () => {
    const { user } = useAuth();
    const { tickets, counters, callNextTicket } = useQMS();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    // Check if user is admin
    if (user?.role !== 'ADMIN') {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Icons.ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
                    <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const today = new Date().setHours(0, 0, 0, 0);
    const todayTickets = tickets.filter(t => new Date(t.createdTime).setHours(0, 0, 0, 0) === today);
    const completedToday = todayTickets.filter(t => t.status === TicketStatus.COMPLETED).length;
    const waitingNow = tickets.filter(t => t.status === TicketStatus.WAITING).length;
    const servingNow = tickets.filter(t => t.status === TicketStatus.SERVING).length;
    const avgWaitTime = todayTickets.length > 0
        ? Math.round(todayTickets.reduce((sum, t) => {
            if (t.calledTime && t.createdTime) {
                return sum + (t.calledTime - t.createdTime) / 60000;
            }
            return sum;
        }, 0) / todayTickets.length)
        : 0;

    const tabs = [
        { id: 'dashboard' as AdminTab, name: 'Dashboard', icon: Icons.LayoutDashboard },
        { id: 'staff' as AdminTab, name: 'Nhân viên', icon: Icons.Users },
        { id: 'services' as AdminTab, name: 'Dịch vụ', icon: Icons.Briefcase },
        { id: 'counters' as AdminTab, name: 'Quầy', icon: Icons.Monitor },
        { id: 'history' as AdminTab, name: 'Lịch sử', icon: Icons.History },
        { id: 'reports' as AdminTab, name: 'Báo cáo', icon: Icons.FileText },
    ];

    return (
        <div className="h-full flex bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    <p className="text-sm text-gray-500">Quản trị hệ thống</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'dashboard' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Icons.Ticket className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Hôm nay</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{todayTickets.length}</h3>
                                <p className="text-sm text-gray-600">Tổng số ticket</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Icons.CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Hoàn thành</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{completedToday}</h3>
                                <p className="text-sm text-gray-600">Đã phục vụ</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Icons.Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Đang chờ</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{waitingNow}</h3>
                                <p className="text-sm text-gray-600">Khách hàng</p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Icons.Timer className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Trung bình</span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{avgWaitTime}</h3>
                                <p className="text-sm text-gray-600">Phút chờ</p>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* Service Distribution */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Phân bố dịch vụ</h3>
                                <div className="space-y-3">
                                    {SERVICES.map((service) => {
                                        const count = todayTickets.filter(t => t.serviceType === service.id).length;
                                        const percentage = todayTickets.length > 0 ? (count / todayTickets.length) * 100 : 0;
                                        return (
                                            <div key={service.id}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                                                    <span className="text-sm text-gray-500">{count}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${service.color}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Counter Status */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Trạng thái quầy</h3>
                                <div className="space-y-3">
                                    {counters.map((counter) => (
                                        <div key={counter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${counter.status === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="font-medium text-gray-900">{counter.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">
                                                    {counter.currentTicketId ? 'Đang phục vụ' : 'Rảnh'}
                                                </span>
                                                <button
                                                    className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                                    onClick={() => callNextTicket(counter.id)}
                                                >
                                                    Gọi tiếp
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
                            <div className="space-y-2">
                                {tickets
                                    .filter(t => t.status === TicketStatus.COMPLETED)
                                    .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
                                    .slice(0, 10)
                                    .map((ticket) => (
                                        <div key={ticket.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono font-bold text-gray-900">{ticket.number}</span>
                                                <span className="text-sm text-gray-600">{SERVICES.find(s => s.id === ticket.serviceType)?.name}</span>
                                                {ticket.customerName && (
                                                    <span className="text-sm text-gray-500">{ticket.customerName}</span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(ticket.completedTime || 0).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h2>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Icons.Plus className="w-5 h-5" />
                                Thêm nhân viên
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { name: 'Admin User', email: 'admin@banknext.com', role: 'ADMIN', status: 'active' },
                                        { name: 'Teller User', email: 'teller@banknext.com', role: 'TELLER', status: 'active' },
                                        { name: 'Manager User', email: 'manager@banknext.com', role: 'MANAGER', status: 'active' },
                                    ].map((staff, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random`}
                                                        alt={staff.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <span className="font-medium text-gray-900">{staff.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{staff.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-1 hover:bg-gray-100 rounded">
                                                        <Icons.Edit className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                    <button className="p-1 hover:bg-gray-100 rounded">
                                                        <Icons.Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử giao dịch</h2>

                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-4">
                            <input
                                type="date"
                                className="px-4 py-2 border rounded-lg"
                                defaultValue={new Date().toISOString().split('T')[0]}
                            />
                            <select className="px-4 py-2 border rounded-lg">
                                <option value="">Tất cả dịch vụ</option>
                                {SERVICES.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <select className="px-4 py-2 border rounded-lg">
                                <option value="">Tất cả trạng thái</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="missed">Bỏ lỡ</option>
                            </select>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Lọc
                            </button>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dịch vụ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian tạo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian hoàn thành</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {tickets
                                        .filter(t => t.status === TicketStatus.COMPLETED)
                                        .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
                                        .slice(0, 50)
                                        .map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono font-bold text-gray-900">{ticket.number}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {SERVICES.find(s => s.id === ticket.serviceType)?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{ticket.customerName || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(ticket.createdTime).toLocaleString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {ticket.completedTime ? new Date(ticket.completedTime).toLocaleString('vi-VN') : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                                        Hoàn thành
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Placeholder for other tabs */}
                {(activeTab === 'services' || activeTab === 'counters' || activeTab === 'reports') && (
                    <div className="p-8">
                        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                            <Icons.Construction className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Đang phát triển</h3>
                            <p className="text-gray-600">Tính năng này sẽ được bổ sung trong phiên bản tiếp theo</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
