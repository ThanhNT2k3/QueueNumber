import React from 'react';
import * as Icons from 'lucide-react';

interface TicketActionPanelProps {
    onRecall: () => void;
    onComplete: () => void;
    onTransfer: () => void;
    onMoveToEnd: () => void;
}

export const TicketActionPanel: React.FC<TicketActionPanelProps> = ({ onRecall, onComplete, onTransfer, onMoveToEnd }) => {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <button
                    onClick={onRecall}
                    className="py-5 bg-indigo-500 text-white rounded-2xl font-bold text-base hover:bg-indigo-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Icons.Volume2 className="w-5 h-5" />
                    Recall
                </button>

                <button
                    onClick={onComplete}
                    className="py-5 bg-green-500 text-white rounded-2xl font-bold text-base hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Icons.CheckCircle className="w-5 h-5" />
                    Complete
                </button>

                <button
                    onClick={onTransfer}
                    className="py-5 bg-orange-500 text-white rounded-2xl font-bold text-base hover:bg-orange-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Icons.ArrowRightLeft className="w-5 h-5" />
                    Transfer
                </button>
            </div>

            <button
                onClick={onMoveToEnd}
                className="w-full py-5 bg-yellow-500 text-white rounded-2xl font-bold text-base hover:bg-yellow-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mb-6"
            >
                <Icons.ArrowDownToLine className="w-5 h-5" />
                Customer Absent
            </button>
        </>
    );
};
