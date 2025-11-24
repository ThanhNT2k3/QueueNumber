import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useQMSStore, useAuthStore } from '../../stores';

// Sub-features
import { useCounterSession } from './session-control/useCounterSession';
import { CounterHeader } from './session-control/components/CounterHeader';

import { useQueueStats } from './queue-processing/useQueueStats';
import { ServiceHistorySidebar } from './queue-processing/components/ServiceHistorySidebar';

import { useTicketActions } from './transaction-handling/useTicketActions';
import { TicketActionPanel } from './transaction-handling/components/TicketActionPanel';
import { CurrentTicketDisplay } from './transaction-handling/components/CurrentTicketDisplay';
import { TransferModal } from './transaction-handling/components/TransferModal';
import { MoveToEndModal } from './transaction-handling/components/MoveToEndModal';

import { useCustomerData } from './customer-insight/useCustomerData';
import { CustomerInfoPanel } from './customer-insight/components/CustomerInfoPanel';
import { RemarkPanel } from './customer-insight/components/RemarkPanel';

const CounterTerminalPage: React.FC = () => {
    const { tickets, isInitialized, error } = useQMSStore();

    // 1. Session Control
    const { myCounter, counters, isOnline } = useCounterSession();

    // 2. Queue Stats
    const { completedTickets, myQueueTickets, waitingCount } = useQueueStats(myCounter);

    // Derived State
    const currentTicket = tickets.find(t => t.id === myCounter?.currentTicketId);

    // 3. Customer Data (Form State)
    const {
        customerPhone, setCustomerPhone,
        customerEmail, setCustomerEmail,
        customerNote, setCustomerNote,
        remarkText, setRemarkText,
        handleAddRemark,
        clearForm
    } = useCustomerData(currentTicket);

    // 4. Ticket Actions
    const { handleCallNext, handleRecall, handleComplete, handleTransfer, handleMoveToEnd } = useTicketActions(currentTicket, myCounter?.id);

    // Modals State
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isMoveToEndModalOpen, setIsMoveToEndModalOpen] = useState(false);

    // Wrappers for actions to include form clearing/saving
    const onCompleteWrapper = async () => {
        await handleComplete({ phone: customerPhone, email: customerEmail, note: customerNote });
        clearForm();
    };

    if (!isInitialized) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading counter data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <Icons.AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Error</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (counters.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <Icons.ServerCrash className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Counters Found</h3>
                    <p className="text-gray-600">
                        The system could not find any counters. Please contact the administrator to configure counters.
                    </p>
                </div>
            </div>
        );
    }

    if (!myCounter) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Icons.AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Not assigned to counter</h2>
                <p className="text-gray-500 max-w-md">
                    Your account is not linked to any counter. Please contact administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-50 flex flex-col">
            {/* Header (Session Control) */}
            <CounterHeader waitingCount={waitingCount} />

            {/* Main Content - 2 Column Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Current Ticket + Actions */}
                <div className="flex-1 flex flex-col p-6 overflow-auto">
                    <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 flex flex-col">
                        {currentTicket ? (
                            <>
                                {/* Transaction Handling: Display */}
                                <CurrentTicketDisplay ticket={currentTicket} />

                                {/* Transaction Handling: Actions */}
                                <TicketActionPanel
                                    onRecall={handleRecall}
                                    onComplete={onCompleteWrapper}
                                    onTransfer={() => setIsTransferModalOpen(true)}
                                    onMoveToEnd={() => setIsMoveToEndModalOpen(true)}
                                />

                                {/* Customer Insight: Info Form */}
                                <CustomerInfoPanel
                                    phone={customerPhone} setPhone={setCustomerPhone}
                                    email={customerEmail} setEmail={setCustomerEmail}
                                    note={customerNote} setNote={setCustomerNote}
                                />

                                {/* Customer Insight: Remarks */}
                                <RemarkPanel
                                    remarkText={remarkText}
                                    setRemarkText={setRemarkText}
                                    onAddRemark={handleAddRemark}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <Icons.Coffee className="w-12 h-12 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-400 mb-8">Counter Available</h2>
                                <button
                                    onClick={handleCallNext}
                                    disabled={!isOnline || waitingCount === 0}
                                    className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-xl font-bold shadow-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all active:scale-95"
                                >
                                    <Icons.Megaphone className="w-6 h-6" />
                                    Call Next Customer
                                </button>
                                {waitingCount === 0 && (
                                    <p className="text-sm text-gray-400 mt-4">No customers waiting</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: History Sidebar (Queue Processing) */}
                <ServiceHistorySidebar completedTickets={completedTickets} />
            </div>

            {/* Modals */}
            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                onConfirm={(serviceId) => {
                    handleTransfer(serviceId);
                    setIsTransferModalOpen(false);
                }}
            />

            <MoveToEndModal
                isOpen={isMoveToEndModalOpen}
                onClose={() => setIsMoveToEndModalOpen(false)}
                onConfirm={async (reason) => {
                    await handleMoveToEnd(reason);
                    setIsMoveToEndModalOpen(false);
                }}
            />
        </div>
    );
};

export default CounterTerminalPage;
