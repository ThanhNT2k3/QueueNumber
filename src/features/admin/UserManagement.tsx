import React, { useState } from 'react';
import * as Icons from 'lucide-react';

// Mock Data
const INITIAL_USERS = [
    { id: '1', name: 'Admin User', email: 'admin@banknext.com', role: 'ADMIN', status: 'Active' },
    { id: '2', name: 'Teller User', email: 'teller@banknext.com', role: 'TELLER', status: 'Active' },
    { id: '3', name: 'Manager User', email: 'manager@banknext.com', role: 'MANAGER', status: 'Active' },
];

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage system access and roles</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Icons.Plus size={20} /> Add User
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Name</th>
                            <th className="p-4 font-semibold text-gray-600">Email</th>
                            <th className="p-4 font-semibold text-gray-600">Role</th>
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
                                <td className="p-4">
                                    <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-gray-400 hover:text-blue-600 mx-2"><Icons.Edit2 size={16} /></button>
                                    <button className="text-gray-400 hover:text-red-600"><Icons.Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Simple Modal Placeholder */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New User</h2>
                        <p className="text-gray-500 mb-6 text-sm">This feature requires backend implementation.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
