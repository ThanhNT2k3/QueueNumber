import React, { useState } from 'react';
import { ServiceType } from '../../../../types/types';
import { SERVICES } from '../../../../config/service-definitions';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (serviceId: ServiceType) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [transferTarget, setTransferTarget] = useState<ServiceType>(ServiceType.CONSULTATION);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transfer dịch vụ</h3>
                <p className="text-gray-600 mb-6">Select the service to transfer this ticket to:</p>

                <div className="space-y-3 mb-8">
                    {SERVICES.map(service => (
                        <label
                            key={service.id}
                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${transferTarget === service.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="transferTarget"
                                value={service.id}
                                checked={transferTarget === service.id}
                                onChange={() => setTransferTarget(service.id)}
                                className="w-5 h-5 text-blue-600"
                            />
                            <span className="ml-3 font-medium text-gray-900">{service.name}</span>
                        </label>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(transferTarget)}
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
