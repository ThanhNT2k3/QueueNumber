import React, { useEffect, useState } from 'react';
import { useAuth } from '../../stores/AuthContext';
import { Counter, User } from '../../types/types';
import * as Icons from 'lucide-react';

interface AuditHistoryEntry {
    id: string;
    counterId: string;
    counterName: string;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    previousUserId: string | null;
    previousUserName: string | null;
    action: string;
    branchId: string | null;
    performedByUserId: string | null;
    performedByUserName: string | null;
    timestamp: string;
    reason: string | null;
    ipAddress: string | null;
}

export const CounterManagement: React.FC = () => {
    const { user } = useAuth();
    const [counters, setCounters] = useState<Counter[]>([]);
    const [staff, setStaff] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Audit History State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [auditHistory, setAuditHistory] = useState<AuditHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<{
        counterId?: string;
        userId?: string;
        fromDate?: string;
        toDate?: string;
    }>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.branchId) return;

            try {
                setLoading(true);
                // Fetch counters
                const countersRes = await fetch(`http://localhost:5257/api/counters/branch/${user.branchId}`);
                if (!countersRes.ok) throw new Error('Failed to fetch counters');
                const countersData = await countersRes.json();

                // Fetch staff
                const staffRes = await fetch(`http://localhost:5257/api/branch/${user.branchId}/staff`);
                if (!staffRes.ok) throw new Error('Failed to fetch staff');
                const staffData = await staffRes.json();

                // Map backend counter data to frontend Counter interface if needed
                // Note: Backend returns ServiceTags as string, frontend expects array. 
                // But for this view we might not need service tags, or we should parse them.
                // Let's parse them to be safe, similar to QMSContext.
                const mappedCounters = countersData.map((c: any) => ({
                    ...c,
                    assignedUserId: c.assignedUserId, // Ensure this is mapped
                    status: c.status === 0 ? 'ONLINE' : c.status === 1 ? 'OFFLINE' : 'PAUSED'
                }));

                setCounters(mappedCounters);
                setStaff(staffData);
            } catch (error: any) {
                console.error("Failed to fetch data", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.branchId]);

    const handleAssignStaff = async (counterId: string, userId: string) => {
        try {
            // If userId is empty string, it means unassign (send null)
            const payload = {
                userId: userId || null,
                performedByUserId: user?.id,
                performedByUserName: user?.fullName,
                reason: userId ? 'Staff assignment' : 'Staff unassignment'
            };

            const res = await fetch(`http://localhost:5257/api/counters/${counterId}/assign-staff`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Update local state
                setCounters(prev => prev.map(c => {
                    if (c.id === counterId) {
                        return { ...c, assignedUserId: userId || null };
                    }
                    // If we assigned a user who was assigned elsewhere, clear their previous assignment
                    if (userId && c.assignedUserId === userId) {
                        return { ...c, assignedUserId: null };
                    }
                    return c;
                }));
            } else {
                alert("Failed to assign staff. Please try again.");
            }
        } catch (error) {
            console.error("Failed to assign staff", error);
            alert("Error connecting to server.");
        }
    };

    const fetchAuditHistory = async () => {
        if (!user?.branchId) return;

        setHistoryLoading(true);
        try {
            let url = `http://localhost:5257/api/counterassignmenthistory/branch/${user.branchId}`;
            const params = new URLSearchParams();

            if (historyFilter.fromDate) params.append('fromDate', historyFilter.fromDate);
            if (historyFilter.toDate) params.append('toDate', historyFilter.toDate);

            if (params.toString()) {
                url = `http://localhost:5257/api/counterassignmenthistory?${params.toString()}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                let data = await res.json();

                // Apply client-side filters
                if (historyFilter.counterId) {
                    data = data.filter((h: AuditHistoryEntry) => h.counterId === historyFilter.counterId);
                }
                if (historyFilter.userId) {
                    data = data.filter((h: AuditHistoryEntry) =>
                        h.userId === historyFilter.userId || h.previousUserId === historyFilter.userId
                    );
                }

                setAuditHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch audit history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const openHistoryModal = () => {
        setShowHistoryModal(true);
        fetchAuditHistory();
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'ASSIGNED': return 'bg-green-100 text-green-700 border-green-200';
            case 'UNASSIGNED': return 'bg-red-100 text-red-700 border-red-200';
            case 'REASSIGNED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading branch data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <Icons.AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Error Loading Data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 p-8 overflow-y-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Counter Management</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Icons.Building2 size={16} />
                        <span>Branch: <span className="font-semibold text-gray-900">{user?.branchId}</span></span>
                    </div>
                </div>

                <button
                    onClick={openHistoryModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Icons.History size={18} />
                    View Assignment History
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Counter Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Assigned Staff</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Current Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {counters.length > 0 ? (
                                counters.map(counter => {
                                    const assignedStaff = staff.find(s => s.id === counter.assignedUserId);
                                    return (
                                        <tr key={counter.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                        <Icons.Monitor size={20} />
                                                    </div>
                                                    <span className="font-bold text-gray-900">{counter.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${counter.status === 'ONLINE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    counter.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {counter.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        className={`appearance-none w-full pl-10 pr-8 py-2.5 rounded-xl border text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer ${counter.assignedUserId ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-50 border-dashed border-gray-300 text-gray-500'
                                                            }`}
                                                        value={counter.assignedUserId || ''}
                                                        onChange={(e) => handleAssignStaff(counter.id, e.target.value)}
                                                    >
                                                        <option value="">-- Unassigned --</option>
                                                        {staff.map(s => (
                                                            <option key={s.id} value={s.id}>
                                                                {s.fullName} ({s.username})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Icons.User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${counter.assignedUserId ? 'text-gray-700' : 'text-gray-400'}`} />
                                                    <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {assignedStaff ? (
                                                    <div className="flex items-center gap-2">
                                                        {assignedStaff.avatarUrl ? (
                                                            <img src={assignedStaff.avatarUrl} alt="" className="w-6 h-6 rounded-full" />
                                                        ) : (
                                                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {assignedStaff.fullName.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-600">{assignedStaff.fullName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No active staff</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Icons.Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>No counters found for this branch.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Counter Assignment History</h2>
                                <p className="text-sm text-gray-500 mt-1">Track all counter assignment changes</p>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Icons.X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Counter</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={historyFilter.counterId || ''}
                                        onChange={(e) => setHistoryFilter(prev => ({ ...prev, counterId: e.target.value || undefined }))}
                                    >
                                        <option value="">All Counters</option>
                                        {counters.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Staff</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={historyFilter.userId || ''}
                                        onChange={(e) => setHistoryFilter(prev => ({ ...prev, userId: e.target.value || undefined }))}
                                    >
                                        <option value="">All Staff</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.fullName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">From Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={historyFilter.fromDate || ''}
                                        onChange={(e) => setHistoryFilter(prev => ({ ...prev, fromDate: e.target.value || undefined }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">To Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={historyFilter.toDate || ''}
                                        onChange={(e) => setHistoryFilter(prev => ({ ...prev, toDate: e.target.value || undefined }))}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={fetchAuditHistory}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                                Apply Filters
                            </button>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {historyLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading history...</p>
                                </div>
                            ) : auditHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {auditHistory.map((entry) => (
                                        <div key={entry.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Icons.Monitor className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{entry.counterName}</h4>
                                                        <p className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionBadgeColor(entry.action)}`}>
                                                    {entry.action}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {entry.action === 'REASSIGNED' && (
                                                    <>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Previous Staff</p>
                                                            <p className="font-medium text-gray-700">{entry.previousUserName || 'N/A'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">New Staff</p>
                                                            <p className="font-medium text-gray-700">{entry.userName || 'N/A'}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {entry.action === 'ASSIGNED' && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                                                        <p className="font-medium text-gray-700">{entry.userName || 'N/A'}</p>
                                                    </div>
                                                )}
                                                {entry.action === 'UNASSIGNED' && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Unassigned From</p>
                                                        <p className="font-medium text-gray-700">{entry.previousUserName || 'N/A'}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Performed By</p>
                                                    <p className="font-medium text-gray-700">{entry.performedByUserName || 'System'}</p>
                                                </div>
                                            </div>

                                            {entry.reason && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                                                    <p className="text-sm text-gray-700">{entry.reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Icons.FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500">No assignment history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
