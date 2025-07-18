import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Search, 
  RefreshCw, 
  MoreHorizontal, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Subscription types
interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_type: string;
  status: 'active' | 'canceled' | 'expired' | 'trial' | 'past_due';
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
  amount: number;
  interval: 'monthly' | 'yearly' | 'lifetime';
  payment_method: string;
  last_payment_date: string | null;
  next_payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export default function Subscriptions() {
  const { toast } = useToast();
  
  // State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const itemsPerPage = 10;
  
  // Fetch subscriptions
  useEffect(() => {
    fetchSubscriptions();
  }, [currentPage, statusFilter, planFilter, searchQuery]);
  
  const fetchSubscriptions = async () => {
    setLoading(true);
    
    try {
      // Build query
      let query = supabase
        .from('subscriptions_view')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (planFilter !== 'all') {
        query = query.eq('plan_type', planFilter);
      }
      
      if (searchQuery) {
        query = query.or(`user_email.ilike.%${searchQuery}%,user_name.ilike.%${searchQuery}%`);
      }
      
      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Execute query
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      if (data) {
        setSubscriptions(data as Subscription[]);
        
        if (count !== null) {
          setTotalSubscriptions(count);
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions. Please try again.',
        variant: 'destructive',
      });
      
      // Set mock data for demonstration
      setMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Set mock data for demonstration
  const setMockData = () => {
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        user_id: 'user1',
        user_email: 'john.doe@example.com',
        user_name: 'John Doe',
        plan_type: 'Premium',
        status: 'active',
        start_date: '2023-01-15',
        end_date: null,
        trial_end_date: null,
        amount: 49.99,
        interval: 'monthly',
        payment_method: 'credit_card',
        last_payment_date: '2023-06-15',
        next_payment_date: '2023-07-15',
        created_at: '2023-01-15T10:30:00Z',
        updated_at: '2023-06-15T10:30:00Z'
      },
      {
        id: '2',
        user_id: 'user2',
        user_email: 'jane.smith@example.com',
        user_name: 'Jane Smith',
        plan_type: 'LTD Pro',
        status: 'active',
        start_date: '2023-02-20',
        end_date: null,
        trial_end_date: null,
        amount: 149.99,
        interval: 'lifetime',
        payment_method: 'paypal',
        last_payment_date: '2023-02-20',
        next_payment_date: null,
        created_at: '2023-02-20T14:45:00Z',
        updated_at: '2023-02-20T14:45:00Z'
      },
      {
        id: '3',
        user_id: 'user3',
        user_email: 'robert.johnson@example.com',
        user_name: 'Robert Johnson',
        plan_type: 'LTD Solo',
        status: 'active',
        start_date: '2023-03-10',
        end_date: null,
        trial_end_date: null,
        amount: 79.99,
        interval: 'lifetime',
        payment_method: 'credit_card',
        last_payment_date: '2023-03-10',
        next_payment_date: null,
        created_at: '2023-03-10T09:15:00Z',
        updated_at: '2023-03-10T09:15:00Z'
      },
      {
        id: '4',
        user_id: 'user4',
        user_email: 'sarah.williams@example.com',
        user_name: 'Sarah Williams',
        plan_type: 'Premium',
        status: 'trial',
        start_date: '2023-06-25',
        end_date: null,
        trial_end_date: '2023-07-09',
        amount: 49.99,
        interval: 'monthly',
        payment_method: 'credit_card',
        last_payment_date: null,
        next_payment_date: '2023-07-09',
        created_at: '2023-06-25T16:20:00Z',
        updated_at: '2023-06-25T16:20:00Z'
      },
      {
        id: '5',
        user_id: 'user5',
        user_email: 'michael.brown@example.com',
        user_name: 'Michael Brown',
        plan_type: 'Premium',
        status: 'canceled',
        start_date: '2023-04-05',
        end_date: '2023-06-05',
        trial_end_date: null,
        amount: 49.99,
        interval: 'monthly',
        payment_method: 'credit_card',
        last_payment_date: '2023-05-05',
        next_payment_date: null,
        created_at: '2023-04-05T11:10:00Z',
        updated_at: '2023-05-20T08:45:00Z'
      }
    ];
    
    setSubscriptions(mockSubscriptions);
    setTotalSubscriptions(mockSubscriptions.length);
    setTotalPages(Math.ceil(mockSubscriptions.length / itemsPerPage));
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchSubscriptions();
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <AlertCircle className="mr-1 h-3 w-3" /> Trial
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="mr-1 h-3 w-3" /> Canceled
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
            <XCircle className="mr-1 h-3 w-3" /> Expired
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
            <AlertCircle className="mr-1 h-3 w-3" /> Past Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
            {status}
          </span>
        );
    }
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Render loading state
  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage user subscriptions and billing information
          </p>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="Free">Free</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="LTD Solo">LTD Solo</SelectItem>
              <SelectItem value="LTD Pro">LTD Pro</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchSubscriptions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button type="submit" variant="secondary" className="ml-2">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription List</CardTitle>
          <CardDescription>
            Showing {subscriptions.length} of {totalSubscriptions} subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Next Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user_name}</div>
                      <div className="text-sm text-muted-foreground">{subscription.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{subscription.plan_type}</TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{formatDate(subscription.start_date)}</TableCell>
                  <TableCell>
                    ${subscription.amount}
                    <span className="text-xs text-muted-foreground">
                      {subscription.interval === 'lifetime' ? ' (one-time)' : subscription.interval === 'monthly' ? '/mo' : '/yr'}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(subscription.next_payment_date)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/subscriptions/${subscription.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Subscription
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No subscriptions found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show first page, last page, current page, and pages around current
                    let pageToShow: number | null = null;
                    
                    if (i === 0) {
                      pageToShow = 1;
                    } else if (i === 4) {
                      pageToShow = totalPages;
                    } else if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else {
                      // Complex logic for showing pages around current
                      if (currentPage <= 3) {
                        pageToShow = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      } else {
                        pageToShow = currentPage - 1 + i;
                      }
                    }
                    
                    // Show ellipsis if needed
                    if (
                      (i === 1 && pageToShow > 2) ||
                      (i === 3 && pageToShow < totalPages - 1)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => setCurrentPage(pageToShow as number)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}