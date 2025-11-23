import React, { useState } from 'react';
import { ServiceType } from '../../../../types/types';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '../../../../components/ui';
import { useCategoryStore } from '../../../../stores';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (serviceId: ServiceType) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { categories, loading } = useCategoryStore();
    const [transferTarget, setTransferTarget] = useState<ServiceType>(ServiceType.CONSULTATION);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                Transfer dịch vụ
            </ModalHeader>

            <ModalBody>
                <p className="text-gray-600 mb-6">Select the service to transfer this ticket to:</p>

                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Loading services...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {categories
                            .filter(category => category.isActive)
                            .map(category => (
                                <label
                                    key={category.id}
                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${transferTarget === parseInt(category.id)
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="transferTarget"
                                        value={category.id}
                                        checked={transferTarget === parseInt(category.id)}
                                        onChange={() => setTransferTarget(parseInt(category.id) as ServiceType)}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <span className="ml-3 font-medium text-gray-900">{category.name}</span>
                                </label>
                            ))}
                    </div>
                )}
            </ModalBody>

            <ModalFooter>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={() => onConfirm(transferTarget)} disabled={loading}>
                    Confirm
                </Button>
            </ModalFooter>
        </Modal>
    );
};
