import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

const API_URL = 'http://localhost:5257/api';

interface Branch {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
}

export const BranchManagement: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch branches from API
    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/branch`);
            if (!response.ok) throw new Error('Failed to fetch branches');
            const data = await response.json();
            setBranches(data);
            setError(null);
        } catch (err) {
            setError('Failed to load branches');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (branch: Branch) => {
        setCurrentBranch({ ...branch });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentBranch({ id: '', name: '', address: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;

        try {
            const response = await fetch(`${API_URL}/branch/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete branch');
            }

            await fetchBranches();
        } catch (err: any) {
            alert(err.message || 'Failed to delete branch');
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!currentBranch) return;

        try {
            const isEdit = branches.find(b => b.id === currentBranch.id);
            const url = isEdit
                ? `${API_URL}/branch/${currentBranch.id}`
                : `${API_URL}/branch`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentBranch),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save branch');
            }

            await fetchBranches();
            setIsModalOpen(false);
            setCurrentBranch(null);
        } catch (err: any) {
            alert(err.message || 'Failed to save branch');
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icons.Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading branches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Branch Management</h1>
                    <p className="text-gray-500">Manage bank branches and locations</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Icons.Plus size={20} /> Add Branch
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 ${branch.isActive ? 'bg-blue-50' : 'bg-gray-50'} rounded-xl flex items-center justify-center ${branch.isActive ? 'text-blue-600' : 'text-gray-400'} group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                                <Icons.Building2 size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(branch)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Icons.Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(branch.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Icons.Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>

                        <div className="space-y-2 text-gray-500 text-sm">
                            <div className="flex items-center gap-2">
                                <Icons.Hash size={14} />
                                <span>ID: <span className="font-mono font-medium text-gray-700">{branch.id}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icons.MapPin size={14} />
                                <span>{branch.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span className={branch.isActive ? 'text-green-600' : 'text-gray-400'}>
                                    {branch.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && currentBranch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-6">{branches.find(b => b.id === currentBranch.id) ? 'Edit Branch' : 'Add New Branch'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch ID</label>
                                <input
                                    type="text"
                                    value={currentBranch.id}
                                    onChange={e => setCurrentBranch({ ...currentBranch, id: e.target.value.toUpperCase() })}
                                    disabled={!!branches.find(b => b.id === currentBranch.id)}
                                    placeholder="e.g., B01"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    value={currentBranch.name}
                                    onChange={e => setCurrentBranch({ ...currentBranch, name: e.target.value })}
                                    placeholder="e.g., Saigon Centre Branch"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={currentBranch.address}
                                    onChange={e => setCurrentBranch({ ...currentBranch, address: e.target.value })}
                                    placeholder="e.g., 65 Le Loi, Dist 1"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={currentBranch.isActive}
                                    onChange={e => setCurrentBranch({ ...currentBranch, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-200"
                            >
                                Save Branch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
