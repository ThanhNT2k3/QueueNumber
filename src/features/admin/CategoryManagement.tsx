import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { ServiceType } from '../../types/types';

// Mock Data based on ServiceType enum
const INITIAL_SERVICES = [
    { id: ServiceType.DEPOSIT, name: 'Deposit', prefix: 'D', color: 'bg-green-500' },
    { id: ServiceType.WITHDRAWAL, name: 'Withdrawal', prefix: 'W', color: 'bg-red-500' },
    { id: ServiceType.LOAN, name: 'Loan Consultation', prefix: 'L', color: 'bg-blue-500' },
    { id: ServiceType.CONSULTATION, name: 'General Inquiry', prefix: 'C', color: 'bg-purple-500' },
    { id: ServiceType.VIP, name: 'VIP Service', prefix: 'V', color: 'bg-yellow-500' },
];

export const CategoryManagement: React.FC = () => {
    const [services, setServices] = useState(INITIAL_SERVICES);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Service Categories</h1>
                    <p className="text-gray-500">Configure ticket services and prefixes</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Icons.Plus size={20} /> Add Service
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-gray-200`}>
                                {service.prefix}
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors">
                                    <Icons.Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-500">Service ID: {service.id}</p>

                        <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal Placeholder */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Service</h2>
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
