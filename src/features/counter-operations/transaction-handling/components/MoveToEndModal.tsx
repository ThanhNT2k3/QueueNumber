import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, TextArea } from '../../../../components/ui';

interface MoveToEndModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const MoveToEndModal: React.FC<MoveToEndModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('Customer not present');

    const handleConfirm = () => {
        onConfirm(reason);
        setReason('Customer not present');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader onClose={onClose}>
                Move Customer to End
            </ModalHeader>

            <ModalBody>
                <p className="text-gray-600 mb-4">Please enter reason for customer absence:</p>

                <TextArea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Customer went to restroom, Customer went to ATM..."
                    rows={4}
                />
            </ModalBody>

            <ModalFooter>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    className="bg-yellow-600 hover:bg-yellow-700"
                >
                    Confirm
                </Button>
            </ModalFooter>
        </Modal>
    );
};
