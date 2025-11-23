import React from 'react';
import * as Icons from 'lucide-react';
import { Button } from '../../../../components/ui';

interface TicketActionPanelProps {
    onRecall: () => void;
    onComplete: () => void;
    onTransfer: () => void;
    onMoveToEnd: () => void;
}

export const TicketActionPanel: React.FC<TicketActionPanelProps> = ({
    onRecall,
    onComplete,
    onTransfer,
    onMoveToEnd
}) => {
    return (
        <>
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Button
                    onClick={onRecall}
                    className="py-5 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg active:scale-95"
                    leftIcon={<Icons.Volume2 className="w-5 h-5" />}
                    fullWidth
                >
                    Recall
                </Button>

                <Button
                    onClick={onComplete}
                    className="py-5 bg-green-500 hover:bg-green-600 text-white shadow-lg active:scale-95"
                    leftIcon={<Icons.CheckCircle className="w-5 h-5" />}
                    fullWidth
                >
                    Complete
                </Button>

                <Button
                    onClick={onTransfer}
                    className="py-5 bg-orange-500 hover:bg-orange-600 text-white shadow-lg active:scale-95"
                    leftIcon={<Icons.ArrowRightLeft className="w-5 h-5" />}
                    fullWidth
                >
                    Transfer
                </Button>
            </div>

            <Button
                onClick={onMoveToEnd}
                className="py-5 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg active:scale-95 mb-6"
                leftIcon={<Icons.ArrowDownToLine className="w-5 h-5" />}
                fullWidth
            >
                Customer Absent
            </Button>
        </>
    );
};
