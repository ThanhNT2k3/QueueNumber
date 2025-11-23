import React from 'react';
import { Ticket } from '../../../../types/types';
import { Badge } from '../../../../components/ui';
import { useCategoryStore } from '../../../../stores';

interface CurrentTicketDisplayProps {
    ticket: Ticket;
}

export const CurrentTicketDisplay: React.FC<CurrentTicketDisplayProps> = ({ ticket }) => {
    const { categories } = useCategoryStore();

    // Find the category/service name from API data
    const serviceName = categories.find(c => c.id === ticket.serviceType?.toString())?.name || 'Unknown Service';

    return (
        <div className="text-center mb-8">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">SERVING</span>
            <h2 className="text-8xl font-black text-blue-600 my-4">{ticket.number}</h2>
            <div className="flex gap-2 justify-center">
                <Badge variant="info" className="px-4 py-1.5 text-sm">
                    {serviceName}
                </Badge>
                {ticket.customer?.name && (
                    <Badge variant="neutral" className="px-4 py-1.5 text-sm">
                        {ticket.customer.name}
                    </Badge>
                )}
            </div>
        </div>
    );
};
