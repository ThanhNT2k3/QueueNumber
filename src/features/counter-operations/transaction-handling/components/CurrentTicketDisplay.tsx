import React from 'react';
import { Ticket } from '../../../../types/types';
import { SERVICES } from '../../../../config/service-definitions';

interface CurrentTicketDisplayProps {
    ticket: Ticket;
}

export const CurrentTicketDisplay: React.FC<CurrentTicketDisplayProps> = ({ ticket }) => {
    return (
        <div className="text-center mb-8">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">SERVING</span>
            <h2 className="text-8xl font-black text-blue-600 my-4">{ticket.number}</h2>
            <div className="flex gap-2 justify-center">
                <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {SERVICES.find(s => s.id === ticket.serviceType)?.name}
                </span>
                {ticket.customer?.name && (
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                        {ticket.customer.name}
                    </span>
                )}
            </div>
        </div>
    );
};
