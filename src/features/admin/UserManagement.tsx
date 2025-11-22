import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { BRANCHES } from '../../config/constants';

// Mock Data
const INITIAL_USERS = [
    { id: '1', name: 'Admin User', email: 'admin@sc.com', role: 'ADMIN', status: 'Active', branchId: 'HQ' },
    { id: '2', name: 'Teller User', email: 'teller@sc.com', role: 'TELLER', status: 'Active', branchId: 'B01' },
    { id: '3', name: 'Manager User', email: 'manager@sc.com', role: 'MANAGER', status: 'Active', branchId: 'B01' },
];

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleToggleStatus = (id: string) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
        ));
    };

    const handleEdit = (user: any) => {
        setCurrentUser({ ...user });
        setIsEditModalOpen(true);
    };

    const handleSave = () => {
        if (currentUser) {
            setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
            setIsEditModalOpen(false);
            setCurrentUser(null);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
                {/* Add User button removed as requested */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
                            <th className="p-4 font-semibold text-gray-600">Branch</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'MANAGER' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {BRANCHES.find(b => b.id === user.branchId)?.name || user.branchId || '-'}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full transition-colors ${user.status === 'Active'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        {user.status}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleEdit(user)} className="text-gray-400 hover:text-blue-600 mx-2" title="Edit">
                                        <Icons.Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                                        <Icons.Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && currentUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">Edit User</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={currentUser.name}
                                    onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={currentUser.email}
                                    onChange={e => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={currentUser.role}
                                    onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="MANAGER">MANAGER</option>
                                    <option value="TELLER">TELLER</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                <select
                                    value={currentUser.branchId || ''}
                                    onChange={e => setCurrentUser({ ...currentUser, branchId: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Branch</option>
                                    {BRANCHES.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
