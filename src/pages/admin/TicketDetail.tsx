import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Tag, 
  MessageSquare, 
  Clock,
  Download,
  UserPlus,
  CheckCircle,
  Flag,
  AlertCircle
} from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { MessageThread } from '@/components/admin/MessageThread';
import { TicketResponseForm } from '@/components/admin/TicketResponseForm';
import { TicketAssignmentDialog } from '@/components/admin/TicketAssignmentDialog';
import { TicketNotificationSettings } from '@/components/admin/TicketNotificationSettings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketStatus } from '@/types/supportTicket';

export default function TicketDetail() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const {
    useTicketDetails,
    respondToTicket,
    isResponding,
    updateTicketStatus,
    isUpdatingStatus,
    assignTicket,
    isAssigning,
    exportChatLogs
  } = useSupportTickets();

  const { data, isLoading, isError } = useTicketDetails(ticketId);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | ''>('');

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (!ticketId) return;
    
    setSelectedStatus(status as TicketStatus);
    updateTicketStatus({
      ticketId,
      status: status as TicketStatus
    });
  };

  // Handle ticket response
  const handleSubmitResponse = (params: { ticketId: string; content: string; attachments?: string[] }) => {
    respondToTicket(params);
  };

  // Handle export chat logs
  const handleExportLogs = () => {
    if (ticketId) {
      exportChatLogs(ticketId);
    }
  };

  // Render status badge
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

  // Render priority indicator
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
      <Badge 
        variant="outline" 
        className={`${priorityInfo.bgColor} ${priorityInfo.textColor} ${priorityInfo.borderColor} flex items-center gap-1.5`}
      >
        <div className={`h-2.5 w-2.5 rounded-full ${priorityInfo.color}`}></div>
        {priorityInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="px-4 pb-4 pt-0">
                <Skeleton className="h-9 w-32 ml-auto" />
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Ticket Details</h1>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Ticket</h2>
            <p className="text-muted-foreground mb-6">
              There was a problem loading this support ticket. It may have been deleted or you may not have permission to view it.
            </p>
            <Button onClick={() => navigate('/admin/support')}>
              Return to Support Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { ticket, messages } = data;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/support')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Ticket #{ticket.id.slice(0, 8)}</h1>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content - ticket conversation */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{ticket.subject}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>Created {formatDate(ticket.created_at)}</span>
                <span>•</span>
                <span>{messages.length} messages</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageThread messages={messages} />
            </CardContent>
          </Card>
          
          <TicketResponseForm 
            ticketId={ticket.id}
            onSubmit={handleSubmitResponse}
            isSubmitting={isResponding}
          />
        </div>
        
        {/* Sidebar - ticket details and actions */}
        <div className="space-y-6">
          {/* Ticket information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{ticket.user_name}</p>
                  <p className="text-sm text-muted-foreground">{ticket.user_email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">Created: {formatDate(ticket.created_at)}</p>
                  {ticket.resolved_at && (
                    <p className="text-sm">Resolved: {formatDate(ticket.resolved_at)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  <div>Status: {renderStatusBadge(ticket.status)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>Priority: {renderPriorityIndicator(ticket.priority)}</div>
              </div>
              
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>Source: <Badge variant="outline" className="capitalize">{ticket.source.replace('_', ' ')}</Badge></div>
              </div>
              
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm">
                    Assigned to: {ticket.assigned_admin_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ticket actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Update Status</label>
                <Select
                  value={selectedStatus || ticket.status}
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <TicketAssignmentDialog
                ticketId={ticket.id}
                currentAssignee={ticket.assigned_to}
                onAssign={assignTicket}
                isAssigning={isAssigning}
              />
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleExportLogs}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Chat Log
              </Button>
              
              <TicketNotificationSettings ticketId={ticket.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}