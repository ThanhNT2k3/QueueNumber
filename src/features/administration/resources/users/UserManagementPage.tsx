import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useAuthStore, useBranchStore } from '../../../../stores';
import { API_BASE_URL } from '../../../../config/constants';
import {
    Button,
    ButtonIcon,
    TextInput,
    Dropdown,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty
} from '../../../../components/ui';

interface User {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    role: 'ADMIN' | 'TELLER' | 'MANAGER';
    avatarUrl?: string;
    branchId?: string;
    assignedCounterId?: string;
}

export const UserManagementPage: React.FC = () => {
    const { user: authUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { branches } = useBranchStore();

    // Load users from API
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/users`);

            if (!response.ok) {
                throw new Error('Failed to load users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error loading users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Remove from local state
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user. Please try again.');
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser({ ...user });
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: editingUser.fullName,
                    email: editingUser.email || editingUser.username,
                    role: editingUser.role,
                    branchId: editingUser.branchId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();

            // Update local state
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user. Please try again.');
        }
    };

    const getRoleBadgeVariant = (role: string): 'success' | 'warning' | 'info' => {
        switch (role) {
            case 'ADMIN': return 'warning';
            case 'MANAGER': return 'info';
            default: return 'success';
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icons.Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <Icons.AlertCircle className="w-6 h-6 text-red-600" />
                        <h2 className="text-lg font-semibold text-red-900">Error Loading Users</h2>
                    </div>
                    <p className="text-red-700 mb-4">{error}</p>
                    <Button onClick={loadUsers} variant="danger">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
                <Button onClick={loadUsers} variant="outline" leftIcon={<Icons.RefreshCw size={16} />}>
                    Refresh
                </Button>
            </div>

            {users.length === 0 ? (
                <TableEmpty
                    icon={<Icons.Users className="w-16 h-16 text-gray-300" />}
                    title="No Users Found"
                    description="There are no users in the system yet."
                />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead align="right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        {user.avatarUrl ? (
                                            <img
                                                src={user.avatarUrl}
                                                alt={user.fullName}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                {user.fullName.charAt(0)}
                                            </div>
                                        )}
                                        {user.fullName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {user.email || user.username}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getRoleBadgeVariant(user.role)}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {branches.find(b => b.id === user.branchId)?.name || user.branchId || '-'}
                                </TableCell>
                                <TableCell align="right">
                                    <div className="flex justify-end gap-2">
                                        <ButtonIcon
                                            onClick={() => handleEdit(user)}
                                            icon={<Icons.Edit2 size={16} />}
                                            title="Edit"
                                            className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                        />
                                        <ButtonIcon
                                            onClick={() => handleDelete(user.id)}
                                            icon={<Icons.Trash2 size={16} />}
                                            title="Delete"
                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Edit User Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <ModalHeader onClose={() => setIsEditModalOpen(false)}>
                    Edit User
                </ModalHeader>

                {editingUser && (
                    <ModalBody className="space-y-4">
                        <TextInput
                            label="Name"
                            value={editingUser.fullName}
                            onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })}
                        />

                        <TextInput
                            label="Email"
                            type="email"
                            value={editingUser.email || editingUser.username}
                            onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                        />

                        <Dropdown
                            label="Role"
                            value={editingUser.role}
                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                            options={[
                                { value: 'ADMIN', label: 'ADMIN' },
                                { value: 'MANAGER', label: 'MANAGER' },
                                { value: 'TELLER', label: 'TELLER' }
                            ]}
                        />

                        <Dropdown
                            label="Branch"
                            value={editingUser.branchId || ''}
                            onChange={e => setEditingUser({ ...editingUser, branchId: e.target.value })}
                        >
                            <option value="">Select Branch</option>
                            {branches.map(branch => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </Dropdown>
                    </ModalBody>
                )}

                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};
