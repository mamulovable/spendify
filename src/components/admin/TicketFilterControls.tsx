import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TicketFilters, TicketPriority } from '@/types/supportTicket';

interface TicketFilterControlsProps {
  filters: TicketFilters;
  onFilterChange: (filters: TicketFilters) => void;
}

export function TicketFilterControls({ filters, onFilterChange }: TicketFilterControlsProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value as any,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value,
    });
  };

  const handlePriorityChange = (value: string) => {
    onFilterChange({
      ...filters,
      priority: value as TicketPriority | 'all',
    });
  };

  const handleSourceChange = (value: string) => {
    onFilterChange({
      ...filters,
      source: value as any,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already applied on change, but this prevents form submission
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: 'all',
      search: '',
      priority: 'all',
      source: 'all',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.status !== 'all' || 
    filters.search !== '' || 
    filters.priority !== 'all' || 
    filters.source !== 'all';

  return (
    <div className="space-y-4">
      <Tabs
        value={filters.status}
        onValueChange={handleStatusChange}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tickets by subject, user email or name..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </form>

        <div className="flex gap-2">
          <Select
            value={filters.priority}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.source}
            onValueChange={handleSourceChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="in_app">In-App</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClearFilters}
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Status: {filters.status.replace('_', ' ')}
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Priority: {filters.priority}
            </Badge>
          )}
          {filters.source !== 'all' && (
            <Badge variant="secondary" className="capitalize">
              Source: {filters.source.replace('_', ' ')}
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary">
              Search: {filters.search}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}