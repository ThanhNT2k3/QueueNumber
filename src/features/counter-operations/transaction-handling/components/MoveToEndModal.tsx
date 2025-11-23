import React, { useState } from 'react';

interface MoveToEndModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export const MoveToEndModal: React.FC<MoveToEndModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [reason, setReason] = useState('Customer not present');

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Move Customer to End</h3>
                <p className="text-gray-600 mb-6">Please enter reason for customer absence:</p>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Customer went to restroom, Customer went to ATM..."
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none resize-none h-24 mb-6"
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm(reason);
                            setReason('Customer not present');
                        }}
                        className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 shadow-lg"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
