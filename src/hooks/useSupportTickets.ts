import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportTicketService } from '@/services/supportTicketService';
import { 
  SupportTicket, 
  TicketFilters, 
  TicketAssignmentParams,
  TicketStatusUpdateParams,
  TicketResponseParams
} from '@/types/supportTicket';
import { useToast } from '@/components/ui/use-toast';

export const useSupportTickets = (initialStatus: string = 'open', initialSearch: string = '') => {
  const [filters, setFilters] = useState<TicketFilters>({
    status: initialStatus as any,
    search: initialSearch,
    priority: 'all',
    source: 'all'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for fetching tickets
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['supportTickets', filters],
    queryFn: () => supportTicketService.getTickets(filters),
  });
  
  // Query for fetching ticket details
  const useTicketDetails = (ticketId: string | undefined) => {
    return useQuery({
      queryKey: ['ticketDetails', ticketId],
      queryFn: () => ticketId ? supportTicketService.getTicketDetails(ticketId) : Promise.reject('No ticket ID provided'),
      enabled: !!ticketId,
    });
  };
  
  // Mutation for assigning tickets
  const assignTicketMutation = useMutation({
    mutationFn: (params: TicketAssignmentParams) => supportTicketService.assignTicket(params),
    onSuccess: () => {
      toast({
        title: 'Ticket assigned successfully',
        description: 'The ticket has been assigned to the selected admin.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketDetails'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to assign ticket',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for updating ticket status
  const updateTicketStatusMutation = useMutation({
    mutationFn: (params: TicketStatusUpdateParams) => supportTicketService.updateTicketStatus(params),
    onSuccess: () => {
      toast({
        title: 'Ticket status updated',
        description: 'The ticket status has been updated successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketDetails'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update ticket status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for responding to tickets
  const respondToTicketMutation = useMutation({
    mutationFn: (params: TicketResponseParams) => supportTicketService.respondToTicket(params),
    onSuccess: () => {
      toast({
        title: 'Response sent',
        description: 'Your response has been sent successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['ticketDetails'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to send response',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Function to export chat logs
  const exportChatLogs = async (ticketId: string) => {
    try {
      const blob = await supportTicketService.exportChatLogs(ticketId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `support-ticket-${ticketId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Chat logs exported',
        description: 'The chat logs have been exported successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Failed to export chat logs',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };
  
  return {
    tickets,
    isLoading,
    isError,
    error,
    filters,
    setFilters,
    refetch,
    useTicketDetails,
    assignTicket: assignTicketMutation.mutate,
    updateTicketStatus: updateTicketStatusMutation.mutate,
    respondToTicket: respondToTicketMutation.mutate,
    exportChatLogs,
    isAssigning: assignTicketMutation.isPending,
    isUpdatingStatus: updateTicketStatusMutation.isPending,
    isResponding: respondToTicketMutation.isPending,
  };
};