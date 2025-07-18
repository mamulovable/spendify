import { supabase } from '@/lib/supabase';
import { 
  SupportTicket, 
  TicketMessage, 
  TicketFilters,
  TicketAssignmentParams,
  TicketStatusUpdateParams,
  TicketResponseParams
} from '@/types/supportTicket';

export const supportTicketService = {
  async getTickets(filters: TicketFilters): Promise<SupportTicket[]> {
    let query = supabase
      .from('admin_support_tickets')
      .select('*');
    
    // Apply status filter if not 'all'
    if (filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    // Apply priority filter if not 'all'
    if (filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }
    
    // Apply source filter if not 'all'
    if (filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }
    
    // Apply search filter if provided
    if (filters.search) {
      query = query.or(`subject.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%`);
    }
    
    // Sort by priority (high to low) and then by creation date (newest first)
    query = query.order('priority', { ascending: false }).order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching support tickets:', error);
      throw new Error(`Failed to fetch support tickets: ${error.message}`);
    }
    
    return data as SupportTicket[];
  },
  
  async getTicketDetails(ticketId: string): Promise<{ ticket: SupportTicket; messages: TicketMessage[] }> {
    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('admin_support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    
    if (ticketError) {
      console.error('Error fetching ticket details:', ticketError);
      throw new Error(`Failed to fetch ticket details: ${ticketError.message}`);
    }
    
    // Get ticket messages
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select(`
        id,
        ticket_id,
        sender_type,
        sender_id,
        content,
        attachments,
        created_at
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching ticket messages:', messagesError);
      throw new Error(`Failed to fetch ticket messages: ${messagesError.message}`);
    }
    
    // Fetch sender names for messages
    const enhancedMessages = await Promise.all(messages.map(async (message) => {
      let senderName = '';
      
      if (message.sender_type === 'user') {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', message.sender_id)
          .single();
        
        senderName = data?.full_name || 'Unknown User';
      } else if (message.sender_type === 'admin') {
        const { data } = await supabase
          .from('admin_users')
          .select('full_name')
          .eq('id', message.sender_id)
          .single();
        
        senderName = data?.full_name || 'Admin';
      } else {
        senderName = 'System';
      }
      
      return {
        ...message,
        sender_name: senderName
      };
    }));
    
    return {
      ticket: ticket as SupportTicket,
      messages: enhancedMessages as TicketMessage[]
    };
  },
  
  async assignTicket({ ticketId, adminId }: TicketAssignmentParams): Promise<void> {
    const { error } = await supabase.rpc('assign_support_ticket', {
      ticket_id: ticketId,
      admin_id: adminId
    });
    
    if (error) {
      console.error('Error assigning ticket:', error);
      throw new Error(`Failed to assign ticket: ${error.message}`);
    }
  },
  
  async updateTicketStatus({ ticketId, status }: TicketStatusUpdateParams): Promise<void> {
    const { error } = await supabase.rpc('update_ticket_status', {
      ticket_id: ticketId,
      new_status: status
    });
    
    if (error) {
      console.error('Error updating ticket status:', error);
      throw new Error(`Failed to update ticket status: ${error.message}`);
    }
  },
  
  async respondToTicket({ ticketId, content, attachments }: TicketResponseParams): Promise<void> {
    const { data: adminUser } = await supabase.auth.getUser();
    
    if (!adminUser?.user?.id) {
      throw new Error('No authenticated admin user found');
    }
    
    const { error } = await supabase.rpc('add_ticket_message', {
      ticket_id: ticketId,
      sender_type: 'admin',
      sender_id: adminUser.user.id,
      content: content,
      attachments: attachments || []
    });
    
    if (error) {
      console.error('Error responding to ticket:', error);
      throw new Error(`Failed to respond to ticket: ${error.message}`);
    }
  },
  
  async exportChatLogs(ticketId: string): Promise<Blob> {
    const { ticket, messages } = await this.getTicketDetails(ticketId);
    
    // Format the chat logs
    let chatLog = `Support Ticket: ${ticket.subject}\n`;
    chatLog += `User: ${ticket.user_name} (${ticket.user_email})\n`;
    chatLog += `Status: ${ticket.status}\n`;
    chatLog += `Created: ${new Date(ticket.created_at).toLocaleString()}\n\n`;
    chatLog += `--- CONVERSATION LOG ---\n\n`;
    
    messages.forEach((message) => {
      const timestamp = new Date(message.created_at).toLocaleString();
      const sender = message.sender_name || 
        (message.sender_type === 'system' ? 'System' : 
        (message.sender_type === 'admin' ? 'Admin' : 'User'));
      
      chatLog += `[${timestamp}] ${sender}:\n${message.content}\n\n`;
    });
    
    // Create a blob from the chat log
    const blob = new Blob([chatLog], { type: 'text/plain' });
    return blob;
  }
};