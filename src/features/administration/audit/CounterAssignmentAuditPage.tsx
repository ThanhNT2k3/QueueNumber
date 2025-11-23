import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { API_BASE_URL } from '../../../config/constants';
import {
    Button,
    Dropdown,
    Badge,
    StatCard,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Card,
    DateTimeInput
} from '../../../components/ui';

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

    const getActionBadgeVariant = (action: string): 'success' | 'info' | 'error' | 'neutral' => {
        switch (action) {
            case 'ASSIGNED': return 'success';
            case 'REASSIGNED': return 'info';
            case 'UNASSIGNED': return 'error';
            default: return 'neutral';
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

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        setFilterBranch('');
        setFilterAction('');
        fetchAuditRecords();
    };

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
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DateTimeInput
                        label="From Date"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />

                    <DateTimeInput
                        label="To Date"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />

                    <Dropdown
                        label="Branch"
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {uniqueBranches.map(branch => (
                            <option key={branch} value={branch!}>{branch}</option>
                        ))}
                    </Dropdown>

                    <Dropdown
                        label="Action"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="">All Actions</option>
                        {uniqueActions.map(action => (
                            <option key={action} value={action}>{action}</option>
                        ))}
                    </Dropdown>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button onClick={fetchAuditRecords} leftIcon={<Icons.Search className="w-4 h-4" />}>
                        Apply Filters
                    </Button>
                    <Button variant="secondary" onClick={handleClearFilters} leftIcon={<Icons.X className="w-4 h-4" />}>
                        Clear
                    </Button>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Total Records"
                    value={filteredRecords.length}
                    icon={<Icons.FileText className="w-5 h-5" />}
                    iconColor="purple"
                />
                <StatCard
                    title="Assignments"
                    value={filteredRecords.filter(r => r.action === 'ASSIGNED').length}
                    icon={<Icons.UserPlus className="w-5 h-5" />}
                    iconColor="green"
                />
                <StatCard
                    title="Reassignments"
                    value={filteredRecords.filter(r => r.action === 'REASSIGNED').length}
                    icon={<Icons.RefreshCw className="w-5 h-5" />}
                    iconColor="blue"
                />
                <StatCard
                    title="Unassignments"
                    value={filteredRecords.filter(r => r.action === 'UNASSIGNED').length}
                    icon={<Icons.UserMinus className="w-5 h-5" />}
                    iconColor="red"
                />
            </div>

            {/* Audit Table */}
            {loading ? (
                <Card className="flex items-center justify-center py-12">
                    <Icons.Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                </Card>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Counter</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Previous User</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Performed By</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                                    No audit records found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDateTime(record.timestamp)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getActionBadgeVariant(record.action)}>
                                            {record.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{record.counterName}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-gray-900">{record.userName || '-'}</p>
                                            <p className="text-xs text-gray-500">{record.userEmail || ''}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {record.previousUserName || '-'}
                                    </TableCell>
                                    <TableCell>{record.branchId || '-'}</TableCell>
                                    <TableCell>{record.performedByUserName || '-'}</TableCell>
                                    <TableCell className="max-w-xs truncate text-gray-600">
                                        {record.reason || '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-gray-600">
                                        {record.ipAddress || '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
