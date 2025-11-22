import { ServiceDefinition, ServiceType, Counter } from '../types/types';

export const SERVICES: ServiceDefinition[] = [
  { id: ServiceType.DEPOSIT, name: 'Deposit & Withdrawal', prefix: 'A', color: 'bg-blue-500', icon: 'Wallet' },
  { id: ServiceType.LOAN, name: 'Loans & Credit', prefix: 'L', color: 'bg-green-500', icon: 'Banknote' },
  { id: ServiceType.CONSULTATION, name: 'Advisory Services', prefix: 'C', color: 'bg-purple-500', icon: 'Users' },
  { id: ServiceType.VIP, name: 'VIP Priority', prefix: 'V', color: 'bg-yellow-500', icon: 'Crown' },
];

export const INITIAL_COUNTERS: Counter[] = [
  { id: '1', name: 'Counter 01', status: 'ONLINE', currentTicketId: null, lastServedTicketId: null, serviceTags: [ServiceType.DEPOSIT, ServiceType.WITHDRAWAL] },
  { id: '2', name: 'Counter 02', status: 'ONLINE', currentTicketId: null, lastServedTicketId: null, serviceTags: [ServiceType.DEPOSIT, ServiceType.WITHDRAWAL] },
  { id: '3', name: 'Counter 03', status: 'PAUSED', currentTicketId: null, lastServedTicketId: null, serviceTags: [ServiceType.LOAN, ServiceType.CONSULTATION] },
  { id: '4', name: 'VIP Counter', status: 'ONLINE', currentTicketId: null, lastServedTicketId: null, serviceTags: [ServiceType.VIP, ServiceType.DEPOSIT, ServiceType.LOAN] },
];