import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { API_BASE_URL } from '../../../../config/constants';

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    prefix: string;
    color: string;
    icon: string;
    isActive: boolean;
    displayOrder: number;
}

export const ServiceManagementPage: React.FC = () => {
    const [services, setServices] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<ServiceCategory | null>(null);

    // Fetch services from API
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/category`);
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setServices(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: ServiceCategory) => {
        setCurrentService({ ...service });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentService({
            id: '',
            name: '',
            description: '',
            prefix: '',
            color: 'bg-blue-500',
            icon: 'Wallet',
            isActive: true,
            displayOrder: services.length + 1
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/category/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete service');
            }

            await fetchServices();
        } catch (err: any) {
            alert(err.message || 'Failed to delete service');
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!currentService) return;

        try {
            const isEdit = services.find(s => s.id === currentService.id);
            const url = isEdit
                ? `${API_BASE_URL}/category/${currentService.id}`
                : `${API_BASE_URL}/category`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentService),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save service');
            }

            await fetchServices();
            setIsModalOpen(false);
            setCurrentService(null);
        } catch (err: any) {
            alert(err.message || 'Failed to save service');
            console.error(err);
        }
    };

    // Helper to render dynamic icon
    const renderIcon = (iconName: string, size = 24) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent size={size} />;
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Icons.Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading services...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
                    <p className="text-gray-500">Configure ticket services and prefixes</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <Icons.Plus size={20} /> Add Service
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gray-200`}>
                                {service.prefix || service.name.charAt(0)}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(service)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Icons.Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Icons.Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Service ID: <span className="font-mono">{service.id}</span></p>

                        {service.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                {renderIcon(service.icon, 16)}
                                <span>{service.icon}</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && currentService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{services.find(s => s.id === currentService.id) ? 'Edit Service' : 'Add New Service'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service ID</label>
                                <input
                                    type="text"
                                    value={currentService.id}
                                    onChange={e => setCurrentService({ ...currentService, id: e.target.value })}
                                    disabled={!!services.find(s => s.id === currentService.id)}
                                    placeholder="e.g., 0, 1, VIP"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Unique identifier for the service.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                <input
                                    type="text"
                                    value={currentService.name}
                                    onChange={e => setCurrentService({ ...currentService, name: e.target.value })}
                                    placeholder="e.g., Deposit & Withdrawal"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                                <input
                                    type="text"
                                    value={currentService.prefix}
                                    onChange={e => setCurrentService({ ...currentService, prefix: e.target.value.toUpperCase() })}
                                    placeholder="e.g., A, B, V"
                                    maxLength={2}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Ticket prefix (e.g., A-001).</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={currentService.description}
                                    onChange={e => setCurrentService({ ...currentService, description: e.target.value })}
                                    placeholder="Service description..."
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Class</label>
                                    <select
                                        value={currentService.color}
                                        onChange={e => setCurrentService({ ...currentService, color: e.target.value })}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="bg-blue-500">Blue</option>
                                        <option value="bg-green-500">Green</option>
                                        <option value="bg-purple-500">Purple</option>
                                        <option value="bg-yellow-500">Yellow</option>
                                        <option value="bg-red-500">Red</option>
                                        <option value="bg-indigo-500">Indigo</option>
                                        <option value="bg-pink-500">Pink</option>
                                        <option value="bg-gray-500">Gray</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
                                    <input
                                        type="text"
                                        value={currentService.icon}
                                        onChange={e => setCurrentService({ ...currentService, icon: e.target.value })}
                                        placeholder="e.g., Wallet"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={currentService.isActive}
                                    onChange={e => setCurrentService({ ...currentService, isActive: e.target.checked })}
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
                                Save Service
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
