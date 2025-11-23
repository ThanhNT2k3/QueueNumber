import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../../stores';
import { TicketStatus, Counter, User } from '../../../../types/types';
import { API_BASE_URL } from '../../../../config/constants';
import * as Icons from 'lucide-react';
import {
    Button,
    Dropdown,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty,
    Modal,
    ModalHeader,
    ModalBody,
    Alert
} from '../../../../components/ui';

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

export const CounterManagementPage: React.FC = () => {
    const { user } = useAuthStore();
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
                const countersRes = await fetch(`${API_BASE_URL}/counters/branch/${user.branchId}`);
                if (!countersRes.ok) throw new Error('Failed to fetch counters');
                const countersData = await countersRes.json();

                // Fetch staff
                const staffRes = await fetch(`${API_BASE_URL}/branch/${user.branchId}/staff`);
                if (!staffRes.ok) throw new Error('Failed to fetch staff');
                const staffData = await staffRes.json();

                const mappedCounters = countersData.map((c: any) => ({
                    ...c,
                    assignedUserId: c.assignedUserId,
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
            const payload = {
                userId: userId || null,
                performedByUserId: user?.id,
                performedByUserName: user?.fullName,
                reason: userId ? 'Staff assignment' : 'Staff unassignment'
            };

            const res = await fetch(`${API_BASE_URL}/counters/${counterId}/assign-staff`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setCounters(prev => prev.map(c => {
                    if (c.id === counterId) {
                        return { ...c, assignedUserId: userId || null };
                    }
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
            let url = `${API_BASE_URL}/counterassignmenthistory/branch/${user.branchId}`;
            const params = new URLSearchParams();

            if (historyFilter.fromDate) params.append('fromDate', historyFilter.fromDate);
            if (historyFilter.toDate) params.append('toDate', historyFilter.toDate);

            if (params.toString()) {
                url = `${API_BASE_URL}/counterassignmenthistory?${params.toString()}`;
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

    const getActionBadgeVariant = (action: string): 'success' | 'error' | 'info' | 'neutral' => {
        switch (action) {
            case 'ASSIGNED': return 'success';
            case 'UNASSIGNED': return 'error';
            case 'REASSIGNED': return 'info';
            default: return 'neutral';
        }
    };

    const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'neutral' => {
        switch (status) {
            case 'ONLINE': return 'success';
            case 'PAUSED': return 'warning';
            default: return 'neutral';
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Icons.Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading branch data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="error" title="Error Loading Data">
                    {error}
                </Alert>
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

                <Button onClick={openHistoryModal} leftIcon={<Icons.History size={18} />}>
                    View Assignment History
                </Button>
            </div>

            {counters.length === 0 ? (
                <TableEmpty
                    icon={<Icons.Inbox className="w-12 h-12 text-gray-300" />}
                    title="No counters found"
                    description="No counters found for this branch."
                />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Counter Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned Staff</TableHead>
                            <TableHead>Current Activity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {counters.map(counter => {
                            const assignedStaff = staff.find(s => s.id === counter.assignedUserId);
                            return (
                                <TableRow key={counter.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                                <Icons.Monitor size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{counter.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(counter.status)}>
                                            {counter.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative">
                                            <Dropdown
                                                value={counter.assignedUserId || ''}
                                                onChange={(e) => handleAssignStaff(counter.id, e.target.value)}
                                                className={counter.assignedUserId ? 'bg-white' : 'bg-gray-50 border-dashed'}
                                            >
                                                <option value="">-- Unassigned --</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.fullName} ({s.username})
                                                    </option>
                                                ))}
                                            </Dropdown>
                                        </div>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {/* Audit History Modal */}
            <Modal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} size="large">
                <ModalHeader onClose={() => setShowHistoryModal(false)}>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Counter Assignment History</h2>
                        <p className="text-sm text-gray-500 mt-1">Track all counter assignment changes</p>
                    </div>
                </ModalHeader>

                <ModalBody>
                    {/* Filters */}
                    <div className="p-4 bg-gray-50 rounded-lg mb-4">
                        <div className="grid grid-cols-4 gap-4">
                            <Dropdown
                                label="Counter"
                                value={historyFilter.counterId || ''}
                                onChange={(e) => setHistoryFilter(prev => ({ ...prev, counterId: e.target.value || undefined }))}
                            >
                                <option value="">All Counters</option>
                                {counters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </Dropdown>

                            <Dropdown
                                label="Staff"
                                value={historyFilter.userId || ''}
                                onChange={(e) => setHistoryFilter(prev => ({ ...prev, userId: e.target.value || undefined }))}
                            >
                                <option value="">All Staff</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.fullName}</option>
                                ))}
                            </Dropdown>

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
                        <Button onClick={fetchAuditHistory} className="mt-4" size="sm">
                            Apply Filters
                        </Button>
                    </div>

                    {/* History List */}
                    {historyLoading ? (
                        <div className="text-center py-12">
                            <Icons.Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading history...</p>
                        </div>
                    ) : auditHistory.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
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
                                        <Badge variant={getActionBadgeVariant(entry.action)}>
                                            {entry.action}
                                        </Badge>
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
                </ModalBody>
            </Modal>
        </div>
    );
};
