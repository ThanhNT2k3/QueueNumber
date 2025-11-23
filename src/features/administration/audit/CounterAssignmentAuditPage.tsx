import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { API_BASE_URL } from '../../../config/constants';

interface AuditRecord {
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

export const CounterAssignmentAuditPage: React.FC = () => {
    const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterBranch, setFilterBranch] = useState<string>('');
    const [filterAction, setFilterAction] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    useEffect(() => {
        fetchAuditRecords();
    }, []);

    const fetchAuditRecords = async () => {
        setLoading(true);
        try {
            let url = `${API_BASE_URL}/counterassignmenthistory`;
            const params = new URLSearchParams();

            if (fromDate) params.append('fromDate', new Date(fromDate).toISOString());
            if (toDate) params.append('toDate', new Date(toDate).toISOString());

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setAuditRecords(data);
            }
        } catch (error) {
            console.error('Failed to fetch audit records:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRecords = auditRecords.filter(record => {
        if (filterBranch && record.branchId !== filterBranch) return false;
        if (filterAction && record.action !== filterAction) return false;
        return true;
    });

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'ASSIGNED':
                return 'bg-green-100 text-green-700';
            case 'REASSIGNED':
                return 'bg-blue-100 text-blue-700';
            case 'UNASSIGNED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const uniqueBranches = Array.from(new Set(auditRecords.map(r => r.branchId).filter(Boolean)));
    const uniqueActions = Array.from(new Set(auditRecords.map(r => r.action)));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icons.History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Counter Assignment Audit</h1>
                        <p className="text-sm text-gray-500">Track all counter assignment changes</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
                        <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Branches</option>
                            {uniqueBranches.map(branch => (
                                <option key={branch} value={branch!}>{branch}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={fetchAuditRecords}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <Icons.Search className="w-4 h-4" />
                        Apply Filters
                    </button>
                    <button
                        onClick={() => {
                            setFromDate('');
                            setToDate('');
                            setFilterBranch('');
                            setFilterAction('');
                            fetchAuditRecords();
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <Icons.X className="w-4 h-4" />
                        Clear
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Icons.FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Records</p>
                            <p className="text-xl font-bold text-gray-900">{filteredRecords.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icons.UserPlus className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Assignments</p>
                            <p className="text-xl font-bold text-gray-900">
                                {filteredRecords.filter(r => r.action === 'ASSIGNED').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icons.RefreshCw className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Reassignments</p>
                            <p className="text-xl font-bold text-gray-900">
                                {filteredRecords.filter(r => r.action === 'REASSIGNED').length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <Icons.UserMinus className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Unassignments</p>
                            <p className="text-xl font-bold text-gray-900">
                                {filteredRecords.filter(r => r.action === 'UNASSIGNED').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Icons.Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Counter
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Previous User
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Branch
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Performed By
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                                            No audit records found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                {formatDateTime(record.timestamp)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(record.action)}`}>
                                                    {record.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.counterName}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <div>
                                                    <p className="font-medium text-gray-900">{record.userName || '-'}</p>
                                                    <p className="text-xs text-gray-500">{record.userEmail || ''}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {record.previousUserName || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.branchId || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {record.performedByUserName || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                {record.reason || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                                                {record.ipAddress || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
