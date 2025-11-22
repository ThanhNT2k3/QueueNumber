
export enum ServiceType {
  DEPOSIT = 0,
  WITHDRAWAL = 1,
  LOAN = 2,
  CONSULTATION = 3,
  VIP = 4
}

export enum TicketStatus {
  WAITING = 0,
  CALLED = 1,
  SERVING = 2,
  COMPLETED = 3,
  MISSED = 4,
  TRANSFERRED = 5
}

export enum CustomerSegment {
  REGULAR = 0,
  GOLD = 1,
  DIAMOND = 2
}

export interface Customer {
  id: string;
  name: string;
  segment: CustomerSegment;
  avatarUrl: string;
  historySummary?: string; // Simulated Core Banking data
}

export interface Ticket {
  id: string;
  number: string; // e.g., A001, V002
  serviceType: ServiceType;
  status: TicketStatus;
  createdTime: number;
  calledTime?: number;
  completedTime?: number;
  counterId?: string;
  customer?: Customer; // Optional if identified via eKYC
  priorityScore: number; // Calculated based on Segment + Service
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackTags?: string[];
  recallCount: number;
  suggestedCounter?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  isBooking?: boolean;
}

export interface Counter {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'PAUSED';
  currentTicketId: string | null;
  lastServedTicketId?: string | null;
  serviceTags: ServiceType[];
}

export interface ServiceDefinition {
  id: ServiceType;
  name: string; // Localized name handled in component usually, simplified here
  prefix: string;
  color: string;
  icon: string;
}
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'TELLER' | 'MANAGER';
  avatarUrl?: string;
  assignedCounterId?: string;
}
