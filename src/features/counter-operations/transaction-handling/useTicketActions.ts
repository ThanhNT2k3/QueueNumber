import { useQMSStore } from '../../../stores';
import { TicketStatus, ServiceType, Ticket } from '../../../types/types';

export const useTicketActions = (currentTicket: Ticket | undefined, myCounterId: string | undefined) => {
    const { callNextTicket, updateTicketStatus, recallTicket, transferTicket, moveToEnd, updateCustomerInfo } = useQMSStore();

    const handleCallNext = () => {
        if (myCounterId) callNextTicket(myCounterId);
    };

    const handleRecall = () => {
        if (currentTicket) recallTicket(currentTicket.id);
    };

    const handleComplete = async (customerData?: { phone: string, email: string, note: string }) => {
        if (currentTicket) {
            if (customerData && (customerData.phone || customerData.email || customerData.note)) {
                await updateCustomerInfo(currentTicket.id, customerData.phone, customerData.email, customerData.note);
            }
            updateTicketStatus(currentTicket.id, TicketStatus.COMPLETED);
        }
    };

    const handleTransfer = (targetService: ServiceType) => {
        if (!currentTicket) return;
        transferTicket(currentTicket.id, targetService);
    };

    const handleMoveToEnd = async (reason: string) => {
        if (!currentTicket) return;
        await moveToEnd(currentTicket.id, reason);
    };

    return {
        handleCallNext,
        handleRecall,
        handleComplete,
        handleTransfer,
        handleMoveToEnd
    };
};
