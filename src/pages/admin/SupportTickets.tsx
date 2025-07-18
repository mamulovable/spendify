import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, RefreshCw } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { TicketFilterControls } from '@/components/admin/TicketFilterControls';
import { TicketsTable } from '@/components/admin/TicketsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupportTickets() {
  const navigate = useNavigate();
  const {
    tickets,
    isLoading,
    filters,
    setFilters,
    refetch
  } = useSupportTickets('open', '');

  const handleViewDetails = (ticketId: string) => {
    navigate(`/admin/support/tickets/${ticketId}`);
  };

  // Calculate ticket statistics
  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    flagged: tickets.filter(t => t.status === 'flagged').length,
    urgent: tickets.filter(t => t.priority === 'urgent').length,
    high: tickets.filter(t => t.priority === 'high').length
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-6 w-6" />
          <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-4xl">{ticketStats.total}</CardTitle>
            <CardDescription>Total Tickets</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-4xl text-blue-600">{ticketStats.open}</CardTitle>
            <CardDescription>Open Tickets</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-4xl text-amber-600">{ticketStats.inProgress}</CardTitle>
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-4xl text-red-600">{ticketStats.urgent + ticketStats.high}</CardTitle>
            <CardDescription>High Priority</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6">
        <TicketFilterControls 
          filters={filters}
          onFilterChange={setFilters}
        />

        <TicketsTable 
          tickets={tickets}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
        />
      </div>
    </div>
  );
}