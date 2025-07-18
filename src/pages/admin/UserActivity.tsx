import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { ExportDataButton } from '@/components/admin/ExportDataButton';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter, 
  AlertCircle, 
  Calendar, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  User,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

// Activity log type
interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  activity_type: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export default function UserActivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Fetch activity logs
  const fetchActivityLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Start building the query
      let query = supabase
        .from('admin_user_activity')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (searchQuery) {
        query = query.or(`user_email.ilike.%${searchQuery}%,user_name.ilike.%${searchQuery}%`);
      }
      
      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter);
      }
      
      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and refetch on filter/pagination changes
  useEffect(() => {
    fetchActivityLogs();
  }, [searchQuery, activityFilter, page, pageSize, sortField, sortDirection]);
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format activity type for display
  const formatActivityType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // Get activity badge color
  const getActivityBadge = (type: string) => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
    
    if (type.includes('login')) {
      variant = "default";
    } else if (type.includes('upload') || type.includes('create')) {
      variant = "secondary";
    } else if (type.includes('error') || type.includes('fail')) {
      variant = "destructive";
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {formatActivityType(type)}
      </Badge>
    );
  };
  
  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Activity</h2>
          <p className="text-muted-foreground">
            Monitor user actions and system events
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="upload_document">Upload Document</SelectItem>
              <SelectItem value="view_statement">View Statement</SelectItem>
              <SelectItem value="update_profile">Update Profile</SelectItem>
              <SelectItem value="change_subscription">Change Subscription</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={fetchActivityLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <ExportDataButton 
            data={logs} 
            filename="user-activity-export" 
            buttonProps={{ variant: "outline", size: "sm" }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </ExportDataButton>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>{totalCount} total records</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('activity_type')}
                    >
                      Activity
                      {sortField === 'activity_type' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('user_email')}
                    >
                      User
                      {sortField === 'user_email' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      Timestamp
                      {sortField === 'created_at' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center text-destructive">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error.message}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          {getActivityBadge(log.activity_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.user_email}</p>
                            <p className="text-xs text-muted-foreground">{log.user_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <div className="max-w-xs truncate">
                            {Object.entries(log.details).map(([key, value]) => (
                              <span key={key} className="text-xs">
                                <span className="font-medium">{key}: </span>
                                {typeof value === 'object' 
                                  ? JSON.stringify(value).substring(0, 30) 
                                  : String(value).substring(0, 30)}
                                {' '}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No details</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.ip_address || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${log.user_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} records
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                >
                  Last
                </Button>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}