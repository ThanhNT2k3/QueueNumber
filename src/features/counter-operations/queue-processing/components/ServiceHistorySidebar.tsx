import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { Ticket, TicketStatus } from '../../../../types/types';
import { useBranchStore } from '../../../../stores';
interface ServiceHistorySidebarProps {
    completedTickets: Ticket[];
}

const statusToText = (status: TicketStatus): string => {
    switch (status) {
        case TicketStatus.SERVING:
            return 'Đang xử lý';
        case TicketStatus.COMPLETED:
            return 'Hoàn thành';
        case TicketStatus.MISSED:
            return 'Đã hủy';
        case TicketStatus.TRANSFERRED:
            return 'Đã chuyển';
        case TicketStatus.CALLED:
            return 'Đã gọi';
        case TicketStatus.WAITING:
            return 'Đang chờ';
        default:
            return 'Không xác định';
    }
};

export const ServiceHistorySidebar: React.FC<ServiceHistorySidebarProps> = ({ completedTickets }) => {
    const [selectedHistoryTicket, setSelectedHistoryTicket] = useState<Ticket | null>(null);
    const { branches } = useBranchStore();
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (start?: number, end?: number) => {
        if (!start || !end) return '-';
        const minutes = Math.floor((end - start) / 60000);
        return `${minutes}m`;
    };

    return (
        <>
            <div className="w-80 bg-white border-l flex flex-col shadow-lg">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Service History</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {completedTickets.length > 0 ? (
                        completedTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedHistoryTicket(ticket)}
                                className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-gray-900">{ticket.number}</span>
                                    <span className="text-xs text-gray-500">{formatTime(ticket.completedTime)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">{branches.find(s => s.id === ticket.branchId)?.name}</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{statusToText(ticket.status)}</span>
                                </div>
                                {ticket.customer?.name && (
                                    <p className="text-xs text-gray-500 mt-1">{ticket.customer.name}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <Icons.FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No history yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Detail Modal */}
            {selectedHistoryTicket && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedHistoryTicket(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Ticket Details {selectedHistoryTicket.number}</h3>
                            <button onClick={() => setSelectedHistoryTicket(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <Icons.X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Service</p>
                                    <p className="font-semibold">{branches.find(s => s.id === selectedHistoryTicket.serviceType)?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                                        {statusToText(selectedHistoryTicket.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Created Time</p>
                                    <p className="font-semibold">{formatTime(selectedHistoryTicket.createdTime)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Completed Time</p>
                                    <p className="font-semibold">{formatTime(selectedHistoryTicket.completedTime)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Service Duration</p>
                                <p className="font-semibold">{formatDuration(selectedHistoryTicket.createdTime, selectedHistoryTicket.completedTime)}</p>
                            </div>

                            {selectedHistoryTicket.customer?.name && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Customer Name</p>
                                    <p className="font-semibold">{selectedHistoryTicket.customer.name}</p>
                                </div>
                            )}

                            {(selectedHistoryTicket.customerPhone || selectedHistoryTicket.customerEmail || selectedHistoryTicket.customerNote) && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-xs font-bold text-blue-700 mb-2">Contact Information</p>
                                    {selectedHistoryTicket.customerPhone && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500">Phone Number</p>
                                            <p className="font-semibold text-sm">{selectedHistoryTicket.customerPhone}</p>
                                        </div>
                                    )}
                                    {selectedHistoryTicket.customerEmail && (
                                        <div className="mb-2">
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-semibold text-sm">{selectedHistoryTicket.customerEmail}</p>
                                        </div>
                                    )}
                                    {selectedHistoryTicket.customerNote && (
                                        <div>
                                            <p className="text-xs text-gray-500">Customer Note</p>
                                            <p className="font-semibold text-sm">{selectedHistoryTicket.customerNote}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedHistoryTicket.remarks && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Processing Remarks</p>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm whitespace-pre-wrap">{selectedHistoryTicket.remarks}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedHistoryTicket(null)}
                            className="w-full mt-6 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
