import { useQMS } from '../../../stores/QMSContext';
import { TicketStatus, ServiceType, Counter } from '../../../types/types';

export const useQueueStats = (myCounter: Counter | undefined) => {
    const { tickets } = useQMS();

    // Get completed tickets for history (last 20)
    const completedTickets = tickets
        .filter(t => t.status === TicketStatus.COMPLETED)
        .sort((a, b) => (b.completedTime || 0) - (a.completedTime || 0))
        .slice(0, 20);

    // Get my queue
    const myQueueTickets = tickets.filter(t => {
        if (t.status !== TicketStatus.WAITING) return false;
        if (!myCounter) return false;
        if (t.branchId && myCounter.branchId && t.branchId !== myCounter.branchId) return false;

        // If ticket is assigned to a specific counter, only show it to that counter
        if (t.counterId && t.counterId !== myCounter.id) return false;

        return myCounter.serviceTags.includes(t.serviceType) || myCounter.serviceTags.includes(ServiceType.VIP);
    }).sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        return a.createdTime - b.createdTime;
    });

    return {
        completedTickets,
        myQueueTickets,
        waitingCount: myQueueTickets.length
    };
};
