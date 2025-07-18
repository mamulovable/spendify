import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Flag, 
  MessageSquare,
  User,
  Calendar
} from 'lucide-react';
import { SupportTicket } from '@/types/supportTicket';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TicketsTableProps {
  tickets: SupportTicket[];
  isLoading: boolean;
  onViewDetails: (ticketId: string) => void;
}

export function TicketsTable({ tickets, isLoading, onViewDetails }: TicketsTableProps) {
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Open
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Resolved
          </Badge>
        );
      case 'flagged':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Flag className="mr-1 h-3 w-3" /> Flagged
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Function to render priority indicator with enhanced visualization
  const renderPriorityIndicator = (priority: string) => {
    const priorities = {
      low: {
        color: 'bg-gray-400',
        textColor: 'text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Low'
      },
      medium: {
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Medium'
      },
      high: {
        color: 'bg-amber-500',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        label: 'High'
      },
      urgent: {
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Urgent'
      }
    };

    const priorityInfo = priorities[priority as keyof typeof priorities] || priorities.low;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${priorityInfo.bgColor} ${priorityInfo.textColor} ${priorityInfo.borderColor} flex items-center gap-1.5`}
            >
              <div className={`h-2.5 w-2.5 rounded-full ${priorityInfo.color}`}></div>
              {priorityInfo.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{priorityInfo.label} Priority Ticket</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-9 w-[70px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">No tickets found</h3>
        <p className="text-muted-foreground mt-2">
          There are no support tickets matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Subject</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">
                {ticket.subject}
                {ticket.message_count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{ticket.user_name}</div>
                  <div className="text-sm text-muted-foreground">{ticket.user_email}</div>
                </div>
              </TableCell>
              <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
              <TableCell>{renderPriorityIndicator(ticket.priority)}</TableCell>
              <TableCell>{formatDate(ticket.created_at)}</TableCell>
              <TableCell>
                {ticket.assigned_admin_name || (
                  <span className="text-muted-foreground italic">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(ticket.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}