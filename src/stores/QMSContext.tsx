
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Counter, Ticket, TicketStatus, ServiceType, CustomerSegment, Customer } from '../types/types';
import { SERVICES } from '../constants';

const API_URL = 'http://localhost:5257/api';
const HUB_URL = 'http://localhost:5257/qmsHub';

interface QMSContextType {
  tickets: Ticket[];
  counters: Counter[];
  createTicket: (serviceType: ServiceType, customer?: Customer) => Promise<Ticket | null>;
  checkInBooking: (bookingCode: string) => Promise<boolean>;
  callNextTicket: (counterId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  transferTicket: (ticketId: string, targetService: ServiceType) => Promise<void>;
  recallTicket: (ticketId: string) => Promise<void>;
  toggleCounterStatus: (counterId: string) => Promise<void>;
  getWaitingCount: (serviceType: ServiceType) => number;
  submitFeedback: (ticketId: string, rating: number, comment?: string, tags?: string[]) => Promise<void>;
}

const QMSContext = createContext<QMSContextType | undefined>(undefined);

export const useQMS = () => {
  const context = useContext(QMSContext);
  if (!context) throw new Error('useQMS must be used within a QMSProvider');
  return context;
};

export const QMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);

  // Helper to convert Backend Ticket to Frontend Ticket
  const mapTicket = (t: any): Ticket => ({
    ...t,
    createdTime: new Date(t.createdTime).getTime(),
    calledTime: t.calledTime ? new Date(t.calledTime).getTime() : undefined,
    completedTime: t.completedTime ? new Date(t.completedTime).getTime() : undefined,
  });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from:', API_URL);
        const [ticketsRes, countersRes] = await Promise.all([
          fetch(`${API_URL}/tickets`),
          fetch(`${API_URL}/counters`)
        ]);

        console.log('Tickets response status:', ticketsRes.status);
        console.log('Counters response status:', countersRes.status);

        if (!ticketsRes.ok || !countersRes.ok) {
          throw new Error(`HTTP error! Tickets: ${ticketsRes.status}, Counters: ${countersRes.status}`);
        }

        const ticketsData = await ticketsRes.json();
        const countersData = await countersRes.json();

        console.log('Fetched tickets:', ticketsData.length);
        console.log('Fetched counters:', countersData.length);
        console.log('Counters data:', countersData);

        setTickets(ticketsData.map(mapTicket));
        setCounters(countersData.map((c: any) => ({
          ...c,
          // Convert backend string "DEPOSIT,WITHDRAWAL" into enum numbers
          serviceTags: c.serviceTags
            ? c.serviceTags
              .split(',')
              .map((s: string) => ServiceType[s as keyof typeof ServiceType] as ServiceType)
            : [],
          status: c.status === 0 ? 'ONLINE' : c.status === 1 ? 'OFFLINE' : 'PAUSED'
        })));
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        alert(`Failed to connect to backend: ${err}. Please check if backend is running on ${API_URL}`);
      }
    };

    fetchData();
  }, []);

  // SignalR Setup
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  const countersRef = React.useRef(counters);
  useEffect(() => {
    countersRef.current = counters;
  }, [counters]);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('Connected to SignalR Hub');

          connection.on('TicketCreated', (ticket) => {
            setTickets(prev => [...prev, mapTicket(ticket)]);
          });

          connection.on('TicketUpdated', (ticket) => {
            setTickets(prev => prev.map(t => t.id === ticket.id ? mapTicket(ticket) : t));
          });

          connection.on('TicketCalled', (ticket) => {
            setTickets(prev => prev.map(t => t.id === ticket.id ? mapTicket(ticket) : t));
            // Play voice
            const currentCounters = countersRef.current;
            const counter = currentCounters.find(c => c.id === ticket.counterId);
            if (counter) playVoiceAnnouncement(ticket.number, counter.name);
          });

          connection.on('CounterUpdated', (counter) => {
            setCounters(prev => {
              const exists = prev.find(c => c.id === counter.id);
              const mappedCounter = {
                ...counter,
                serviceTags: counter.serviceTags && typeof counter.serviceTags === 'string'
                  ? counter.serviceTags.split(',').map((s: string) => ServiceType[s as keyof typeof ServiceType] as ServiceType)
                  : counter.serviceTags || [],
                status: counter.status === 0 ? 'ONLINE' : counter.status === 1 ? 'OFFLINE' : 'PAUSED'
              };

              if (exists) {
                return prev.map(c => c.id === counter.id ? mappedCounter : c);
              } else {
                return [...prev, mappedCounter];
              }
            });
          });
        })
        .catch(e => console.log('Connection failed: ', e));
    }
  }, [connection]); // Removed counters dependency

  const playVoiceAnnouncement = (ticketNumber: string, counterName: string) => {
    const utterance = new SpeechSynthesisUtterance(`Number ${ticketNumber}, please go to ${counterName}`);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const createTicket = useCallback(async (serviceType: ServiceType, customer?: Customer): Promise<Ticket | null> => {
    try {
      const response = await fetch(`${API_URL}/queue/auto-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          customerName: customer?.name,
          customerSegment: customer?.segment || CustomerSegment.REGULAR,
          customerId: customer?.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Auto-assignment result:', result);

        // Show counter suggestion to user
        if (result.suggestedCounter) {
          console.log(`✅ Suggested Counter: ${result.suggestedCounter}`);
          console.log(`📊 Queue Position: ${result.estimatedQueuePosition}`);
          console.log(`⏱️ Estimated Wait: ${result.estimatedWaitTimeMinutes} minutes`);
        }

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
  }, []);

  const checkInBooking = useCallback(async (bookingCode: string) => {
    // For now, we just create a VIP ticket as a simulation since backend doesn't have booking logic yet
    // In real app, this would call a specific endpoint
    const isVip = bookingCode.toUpperCase().includes("VIP");
    const serviceType = isVip ? ServiceType.VIP : ServiceType.CONSULTATION;

    await createTicket(serviceType, {
      id: 'BOOK_' + bookingCode,
      name: isVip ? 'Booking VIP Customer' : 'Booking Customer',
      segment: isVip ? CustomerSegment.DIAMOND : CustomerSegment.REGULAR,
      avatarUrl: '',
    });
    return true;
  }, [createTicket]);

  const callNextTicket = useCallback(async (counterId: string) => {
    // Logic moved to backend? 
    // Actually backend CallTicket expects a ticketId. 
    // But the frontend 'callNextTicket' implies "find me the next ticket".
    // We need to find the next ticket here or add an endpoint "CallNext" in backend.
    // For simplicity, let's find the best ticket here and call it.

    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;

    const eligibleTickets = tickets.filter(t =>
      t.status === TicketStatus.WAITING &&
      (counter.serviceTags.includes(t.serviceType) || counter.serviceTags.includes(ServiceType.VIP))
    );

    if (eligibleTickets.length === 0) return;

    const nextTicket = eligibleTickets.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return a.createdTime - b.createdTime;
    })[0];

    await fetch(`${API_URL}/tickets/${nextTicket.id}/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ counterId })
    });

  }, [tickets, counters]);

  const updateTicketStatus = useCallback(async (ticketId: string, status: TicketStatus) => {
    if (status === TicketStatus.COMPLETED) {
      await fetch(`${API_URL}/tickets/${ticketId}/complete`, { method: 'POST' });
    } else {
      // Implement other status updates if backend supports them
      // For now only Complete is fully implemented in backend controller shown
    }
  }, []);

  const recallTicket = useCallback(async (ticketId: string) => {
    // Replay voice announcement for the ticket
    await fetch(`${API_URL}/tickets/${ticketId}/recall`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  }, []);

  const transferTicket = useCallback(async (ticketId: string, targetService: ServiceType) => {
    // Change the service type of the ticket and reset its status to WAITING
    await fetch(`${API_URL}/tickets/${ticketId}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetService }),
    });
  }, []);

  const toggleCounterStatus = useCallback(async (counterId: string) => {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;

    const newStatus = counter.status === 'ONLINE' ? 1 : 0; // 0=ONLINE, 1=OFFLINE (based on Enum)
    // Wait, Enum: ONLINE=0, OFFLINE=1. 
    // If current is ONLINE, we want to go PAUSED or OFFLINE? 
    // Frontend toggles ONLINE <-> PAUSED usually.
    // Backend Enum: ONLINE=0, OFFLINE=1, PAUSED=2.

    let targetStatus = 0;
    if (counter.status === 'ONLINE') targetStatus = 2; // PAUSED
    else targetStatus = 0; // ONLINE

    await fetch(`${API_URL}/counters/${counterId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus })
    });
  }, [counters]);

  const getWaitingCount = useCallback((serviceType: ServiceType) => {
    return tickets.filter(t => t.serviceType === serviceType && t.status === TicketStatus.WAITING).length;
  }, [tickets]);

  const submitFeedback = useCallback(async (ticketId: string, rating: number, comment?: string, tags?: string[]) => {
    // Not implemented in backend yet
    console.warn("Feedback not implemented in backend yet");
  }, []);

  return (
    <QMSContext.Provider value={{ tickets, counters, createTicket, checkInBooking, callNextTicket, updateTicketStatus, transferTicket, recallTicket, toggleCounterStatus, getWaitingCount, submitFeedback }}>
      {children}
    </QMSContext.Provider>
  );
};
