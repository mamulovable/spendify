import { AdminUser } from './auth';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'flagged';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketSource = 'email' | 'chat' | 'in_app';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to?: string;
  assigned_admin_name?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  source: TicketSource;
  message_count: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin' | 'system';
  sender_id: string;
  sender_name?: string;
  content: string;
  attachments?: string[];
  created_at: string;
}

export interface TicketFilters {
  status: TicketStatus | 'all';
  search: string;
  priority: TicketPriority | 'all';
  source: TicketSource | 'all';
}

export interface TicketAssignmentParams {
  ticketId: string;
  adminId: string;
}

export interface TicketStatusUpdateParams {
  ticketId: string;
  status: TicketStatus;
}

export interface TicketResponseParams {
  ticketId: string;
  content: string;
  attachments?: string[];
}