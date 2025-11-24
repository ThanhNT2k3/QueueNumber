import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as signalR from '@microsoft/signalr';
import { Counter, Ticket, TicketStatus, ServiceType, CustomerSegment, Customer } from '../types/types';
import { API_BASE_URL, SIGNALR_HUB_URL } from '../config/constants';

interface QMSStore {
    tickets: Ticket[];
    counters: Counter[];
    connection: signalR.HubConnection | null;
    isInitialized: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    createTicket: (serviceType: ServiceType, customer?: Customer, branchId?: string) => Promise<Ticket | null>;
    checkInBooking: (bookingCode: string) => Promise<boolean>;
    callNextTicket: (counterId: string) => Promise<void>;
    updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
    transferTicket: (ticketId: string, targetService: ServiceType) => Promise<void>;
    recallTicket: (ticketId: string) => Promise<void>;
    toggleCounterStatus: (counterId: string) => Promise<void>;
    getWaitingCount: (serviceType: ServiceType) => number;
    submitFeedback: (ticketId: string, rating: number, comment?: string, tags?: string[]) => Promise<void>;
    moveToEnd: (ticketId: string, reason: string) => Promise<void>;
    updateRemarks: (ticketId: string, remark: string) => Promise<void>;
    updateCustomerInfo: (ticketId: string, phone?: string, email?: string, note?: string) => Promise<void>;
}

// Helper to convert Backend Ticket to Frontend Ticket
const mapTicket = (t: any): Ticket => ({
    ...t,
    createdTime: new Date(t.createdTime).getTime(),
    calledTime: t.calledTime ? new Date(t.calledTime).getTime() : undefined,
    completedTime: t.completedTime ? new Date(t.completedTime).getTime() : undefined,
});

const playVoiceAnnouncement = (ticketNumber: string, counterName: string) => {
    const utterance = new SpeechSynthesisUtterance(`Number ${ticketNumber}, please go to ${counterName}`);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
};

export const useQMSStore = create<QMSStore>()(
    devtools(
        immer((set, get) => ({
            tickets: [],
            counters: [],
            connection: null,
            isInitialized: false,
            error: null,

            initialize: async () => {
                // 1. Fetch Initial Data
                try {
                    const [ticketsRes, countersRes] = await Promise.all([
                        fetch(`${API_BASE_URL}/tickets`),
                        fetch(`${API_BASE_URL}/counters`)
                    ]);

                    if (ticketsRes.ok && countersRes.ok) {
                        const ticketsData = await ticketsRes.json();
                        const countersData = await countersRes.json();

                        set((state) => {
                            state.tickets = ticketsData.map(mapTicket);
                            state.counters = countersData.map((c: any) => ({
                                ...c,
                                serviceTags: c.serviceTags
                                    ? c.serviceTags.split(',').map((s: string) => ServiceType[s as keyof typeof ServiceType] as ServiceType)
                                    : [],
                                branchId: c.branchId,
                                status: c.status === 0 ? 'ONLINE' : c.status === 1 ? 'OFFLINE' : 'PAUSED'
                            }));
                            state.isInitialized = true;
                            state.error = null;
                        });
                    } else {
                        set((state) => {
                            state.error = `Failed to fetch data. Tickets: ${ticketsRes.status}, Counters: ${countersRes.status}`;
                            state.isInitialized = true; // Mark as initialized even if failed so we stop loading
                        });
                    }
                } catch (err) {
                    console.error("Failed to fetch initial data", err);
                    set((state) => {
                        state.error = err instanceof Error ? err.message : 'Unknown error occurred during initialization';
                        state.isInitialized = true;
                    });
                }

                // 2. Setup SignalR
                const newConnection = new signalR.HubConnectionBuilder()
                    .withUrl(SIGNALR_HUB_URL)
                    .withAutomaticReconnect()
                    .build();

                set({ connection: newConnection });

                try {
                    await newConnection.start();
                    console.log('Connected to SignalR Hub');

                    newConnection.on('TicketCreated', (ticket) => {
                        set((state) => {
                            state.tickets.push(mapTicket(ticket));
                        });
                    });

                    newConnection.on('TicketUpdated', (ticket) => {
                        set((state) => {
                            const index = state.tickets.findIndex(t => t.id === ticket.id);
                            if (index !== -1) {
                                state.tickets[index] = mapTicket(ticket);
                            }
                        });
                    });

                    newConnection.on('TicketCalled', (ticket) => {
                        set((state) => {
                            const index = state.tickets.findIndex(t => t.id === ticket.id);
                            if (index !== -1) {
                                state.tickets[index] = mapTicket(ticket);
                            }
                        });

                        // Play voice
                        const counter = get().counters.find(c => c.id === ticket.counterId);
                        if (counter) playVoiceAnnouncement(ticket.number, counter.name);
                    });

                    newConnection.on('CounterUpdated', (counter) => {
                        set((state) => {
                            const index = state.counters.findIndex(c => c.id === counter.id);
                            const mappedCounter = {
                                ...counter,
                                serviceTags: counter.serviceTags && typeof counter.serviceTags === 'string'
                                    ? counter.serviceTags.split(',').map((s: string) => ServiceType[s as keyof typeof ServiceType] as ServiceType)
                                    : counter.serviceTags || [],
                                status: counter.status === 0 ? 'ONLINE' : counter.status === 1 ? 'OFFLINE' : 'PAUSED',
                                branchId: counter.branchId
                            };

                            if (index !== -1) {
                                state.counters[index] = mappedCounter;
                            } else {
                                state.counters.push(mappedCounter);
                            }
                        });
                    });

                } catch (e) {
                    console.log('Connection failed: ', e);
                }
            },

            createTicket: async (serviceType, customer, branchId) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/queue/auto-assign`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            serviceType,
                            customerName: customer?.name,
                            customerSegment: customer?.segment || CustomerSegment.REGULAR,
                            customerId: customer?.id,
                            branchId
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        return {
                            ...mapTicket(result.ticket),
                            suggestedCounter: result.suggestedCounter,
                            queuePosition: result.estimatedQueuePosition,
                            estimatedWaitTime: result.estimatedWaitTimeMinutes
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Failed to create ticket:', error);
                    return null;
                }
            },

            checkInBooking: async (bookingCode) => {
                const isVip = bookingCode.toUpperCase().includes("VIP");
                const serviceType = isVip ? ServiceType.VIP : ServiceType.CONSULTATION;

                await get().createTicket(serviceType, {
                    id: 'BOOK_' + bookingCode,
                    name: isVip ? 'Booking VIP Customer' : 'Booking Customer',
                    segment: isVip ? CustomerSegment.DIAMOND : CustomerSegment.REGULAR,
                    avatarUrl: '',
                });
                return true;
            },

            callNextTicket: async (counterId) => {
                const { tickets, counters } = get();
                const counter = counters.find(c => c.id === counterId);
                if (!counter) return;

                const eligibleTickets = tickets.filter(t =>
                    t.status === TicketStatus.WAITING &&
                    (!t.branchId || !counter.branchId || t.branchId === counter.branchId) &&
                    (counter.serviceTags.includes(t.serviceType) || counter.serviceTags.includes(ServiceType.VIP)) &&
                    (!t.counterId || t.counterId === counterId)
                );

                if (eligibleTickets.length === 0) return;

                const nextTicket = eligibleTickets.sort((a, b) => {
                    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
                    return a.createdTime - b.createdTime;
                })[0];

                await fetch(`${API_BASE_URL}/tickets/${nextTicket.id}/call`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ counterId })
                });
            },

            updateTicketStatus: async (ticketId, status) => {
                if (status === TicketStatus.COMPLETED) {
                    await fetch(`${API_BASE_URL}/tickets/${ticketId}/complete`, { method: 'POST' });
                }
            },

            transferTicket: async (ticketId, targetService) => {
                await fetch(`${API_BASE_URL}/tickets/${ticketId}/transfer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetService }),
                });
            },

            recallTicket: async (ticketId) => {
                await fetch(`${API_BASE_URL}/tickets/${ticketId}/recall`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
            },

            toggleCounterStatus: async (counterId) => {
                const counter = get().counters.find(c => c.id === counterId);
                if (!counter) return;

                let targetStatus = 0;
                if (counter.status === 'ONLINE') targetStatus = 2; // PAUSED
                else targetStatus = 0; // ONLINE

                await fetch(`${API_BASE_URL}/counters/${counterId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: targetStatus })
                });
            },

            getWaitingCount: (serviceType) => {
                return get().tickets.filter(t => t.serviceType === serviceType && t.status === TicketStatus.WAITING).length;
            },

            submitFeedback: async (ticketId, rating, comment, tags) => {
                console.warn("Feedback not implemented in backend yet");
            },

            moveToEnd: async (ticketId, reason) => {
                try {
                    await fetch(`${API_BASE_URL}/queue/tickets/${ticketId}/move-to-end`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reason })
                    });
                } catch (error) {
                    console.error('Failed to move ticket to end:', error);
                }
            },

            updateRemarks: async (ticketId, remark) => {
                try {
                    await fetch(`${API_BASE_URL}/queue/tickets/${ticketId}/remarks`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ remark })
                    });
                } catch (error) {
                    console.error('Failed to update remarks:', error);
                }
            },

            updateCustomerInfo: async (ticketId, phone, email, note) => {
                try {
                    await fetch(`${API_BASE_URL}/queue/tickets/${ticketId}/customer-info`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone, email, note })
                    });
                } catch (error) {
                    console.error('Failed to update customer info:', error);
                }
            }
        })),
        { name: 'QMSStore' }
    )
);
