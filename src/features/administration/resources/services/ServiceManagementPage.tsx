import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
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
    Card,
    Badge,
    TextArea,
    Checkbox
} from '../../../../components/ui';

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
                <Button onClick={handleAdd} leftIcon={<Icons.Plus size={20} />}>
                    Add Service
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <Card key={service.id} className="hover:shadow-md transition-all group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gray-200`}>
                                    {service.prefix || service.name.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    <ButtonIcon
                                        onClick={() => handleEdit(service)}
                                        icon={<Icons.Edit2 size={18} />}
                                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    />
                                    <ButtonIcon
                                        onClick={() => handleDelete(service.id)}
                                        icon={<Icons.Trash2 size={18} />}
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    />
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
                                <Badge variant={service.isActive ? 'success' : 'neutral'}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ModalHeader onClose={() => setIsModalOpen(false)}>
                    {currentService && services.find(s => s.id === currentService.id) ? 'Edit Service' : 'Add New Service'}
                </ModalHeader>

                {currentService && (
                    <ModalBody className="space-y-4">
                        <TextInput
                            label="Service ID"
                            value={currentService.id}
                            onChange={e => setCurrentService({ ...currentService, id: e.target.value })}
                            disabled={!!services.find(s => s.id === currentService.id)}
                            placeholder="e.g., 0, 1, VIP"
                            helperText="Unique identifier for the service."
                        />

                        <TextInput
                            label="Service Name"
                            value={currentService.name}
                            onChange={e => setCurrentService({ ...currentService, name: e.target.value })}
                            placeholder="e.g., Deposit & Withdrawal"
                        />

                        <TextInput
                            label="Prefix"
                            value={currentService.prefix}
                            onChange={e => setCurrentService({ ...currentService, prefix: e.target.value.toUpperCase() })}
                            placeholder="e.g., A, B, V"
                            maxLength={2}
                            helperText="Ticket prefix (e.g., A-001)."
                        />

                        <TextArea
                            label="Description"
                            value={currentService.description}
                            onChange={e => setCurrentService({ ...currentService, description: e.target.value })}
                            placeholder="Service description..."
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Dropdown
                                label="Color Class"
                                value={currentService.color}
                                onChange={e => setCurrentService({ ...currentService, color: e.target.value })}
                                options={[
                                    { value: 'bg-blue-500', label: 'Blue' },
                                    { value: 'bg-green-500', label: 'Green' },
                                    { value: 'bg-purple-500', label: 'Purple' },
                                    { value: 'bg-yellow-500', label: 'Yellow' },
                                    { value: 'bg-red-500', label: 'Red' },
                                    { value: 'bg-indigo-500', label: 'Indigo' },
                                    { value: 'bg-pink-500', label: 'Pink' },
                                    { value: 'bg-gray-500', label: 'Gray' },
                                ]}
                            />

                            <TextInput
                                label="Icon Name"
                                value={currentService.icon}
                                onChange={e => setCurrentService({ ...currentService, icon: e.target.value })}
                                placeholder="e.g., Wallet"
                            />
                        </div>

                        <Checkbox
                            label="Active"
                            checked={currentService.isActive}
                            onChange={e => setCurrentService({ ...currentService, isActive: e.target.checked })}
                        />
                    </ModalBody>
                )}

                <ModalFooter>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Service
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};
