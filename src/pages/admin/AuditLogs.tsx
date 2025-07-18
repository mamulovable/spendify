import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { AuditLog, ENTITY_TYPE_LABELS, ACTION_TYPE_LABELS } from '@/types/auditLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, formatDistanceToNow } from 'date-fns';
import { Download, Search, CalendarIcon, X, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuditLogs() {
  const {
    auditLogs,
    totalLogs,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    selectedLogId,
    setSelectedLogId,
    selectedLog,
    isLoadingDetails,
    actionTypes,
    entityTypes,
    adminUsers,
    isLoadingFilterOptions,
    exportLogs,
  } = useAuditLogs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Apply filters
  const applyFilters = () => {
    setFilters({
      ...filters,
      searchTerm,
      startDate,
      endDate,
    });
    setPage(1); // Reset to first page when filters change
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalLogs / pageSize);
  
  // Format details for display
  const formatDetails = (details: Record<string, any>): string => {
    try {
      return JSON.stringify(details, null, 2);
    } catch (error) {
      return 'Unable to format details';
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor admin actions across the system
          </p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter audit logs by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin User</label>
              <Select
                value={filters.adminId || ''}
                onValueChange={(value) => setFilters({ ...filters, adminId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All admins</SelectItem>
                  {adminUsers?.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select
                value={filters.action || ''}
                onValueChange={(value) => setFilters({ ...filters, action: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {actionTypes?.map((action) => (
                    <SelectItem key={action} value={action}>
                      {ACTION_TYPE_LABELS[action] || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Entity Type</label>
              <Select
                value={filters.entityType || ''}
                onValueChange={(value) => setFilters({ ...filters, entityType: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All entities</SelectItem>
                  {entityTypes?.map((entity) => (
                    <SelectItem key={entity} value={entity}>
                      {ENTITY_TYPE_LABELS[entity] || entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            {totalLogs} total entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading audit logs...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching your criteria.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead className="w-[80px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(log.createdAt), 'MMM d, yyyy')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), 'h:mm a')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{log.adminName || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ACTION_TYPE_LABELS[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.entityId.length > 15
                          ? `${log.entityId.substring(0, 15)}...`
                          : log.entityId}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLogId(log.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 5) {
                          // Show all pages if 5 or fewer
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          // Near the start
                          pageNum = i + 1;
                          if (i === 4) pageNum = totalPages;
                        } else if (page >= totalPages - 2) {
                          // Near the end
                          pageNum = totalPages - 4 + i;
                          if (i === 0) pageNum = 1;
                        } else {
                          // In the middle
                          pageNum = page - 2 + i;
                          if (i === 0) pageNum = 1;
                          if (i === 4) pageNum = totalPages;
                        }
                        
                        // Show ellipsis instead of page number
                        if ((i === 1 && pageNum !== 2) || (i === 3 && pageNum !== totalPages - 1)) {
                          return (
                            <PaginationItem key={`ellipsis-${i}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={page === pageNum}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Log Details Dialog */}
      <Dialog open={!!selectedLogId} onOpenChange={(open) => !open && setSelectedLogId(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this audit log entry
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="text-center py-4">Loading details...</div>
          ) : selectedLog ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p>{format(new Date(selectedLog.createdAt), 'PPP p')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Admin User</h3>
                  <p>{selectedLog.adminName || 'System'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Action</h3>
                  <p>{ACTION_TYPE_LABELS[selectedLog.action] || selectedLog.action}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entity Type</h3>
                  <p>{ENTITY_TYPE_LABELS[selectedLog.entityType] || selectedLog.entityType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entity ID</h3>
                  <p className="font-mono text-sm">{selectedLog.entityId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                  <p>{selectedLog.ipAddress || 'Not recorded'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                  {formatDetails(selectedLog.details)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Log details not found.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}