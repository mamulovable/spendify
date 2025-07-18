import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  AlertCircle, 
  Download, 
  Filter, 
  RefreshCw, 
  UserPlus, 
  Eye, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  CreditCard
} from 'lucide-react';
import { UserActionControls } from '@/components/admin/UserActionControls';
import { format } from 'date-fns';
import { ExportDataButton } from '@/components/admin/ExportDataButton';

// User type definition
interface User {
  id: string;
  email: string;
  full_name: string;
  plan_type: string;
  is_suspended: boolean;
  signup_date: string;
  last_active_at: string;
  document_count: number;
  subscription_status: string;
  is_appsumo_user: boolean;
}

export default function Users() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('last_active_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Start building the query
      let query = supabase
        .from('admin_user_list')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      if (planFilter !== 'all') {
        query = query.eq('plan_type', planFilter);
      }
      
      if (statusFilter === 'active') {
        query = query.eq('is_suspended', false);
      } else if (statusFilter === 'suspended') {
        query = query.eq('is_suspended', true);
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
      
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and refetch on filter/pagination changes
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, planFilter, statusFilter, page, pageSize, sortField, sortDirection]);
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle user selection
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
    setSelectAll(!selectAll);
  };
  
  // Reset selection when users change
  useEffect(() => {
    setSelectedUsers(new Set());
    setSelectAll(false);
  }, [users]);
  
  // User actions
  const handleUserAction = async (action: 'view' | 'suspend' | 'activate' | 'delete', user: User) => {
    setSelectedUser(user);
    
    switch (action) {
      case 'view':
        navigate(`/admin/users/${user.id}`);
        break;
      case 'suspend':
        setShowSuspendDialog(true);
        break;
      case 'activate':
        try {
          await supabase.rpc('unsuspend_user', {
            user_id: user.id,
            admin_id: (await supabase.auth.getUser()).data.user?.id
          });
          
          toast({
            title: 'User Activated',
            description: `${user.email} has been activated successfully.`,
          });
          
          fetchUsers();
        } catch (err) {
          console.error('Error activating user:', err);
          toast({
            title: 'Error',
            description: 'Failed to activate user. Please try again.',
            variant: 'destructive',
          });
        }
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Handle suspend user
  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    try {
      await supabase.rpc('suspend_user', {
        user_id: selectedUser.id,
        reason: suspendReason,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Suspended',
        description: `${selectedUser.email} has been suspended.`,
      });
      
      setShowSuspendDialog(false);
      setSuspendReason('');
      fetchUsers();
    } catch (err) {
      console.error('Error suspending user:', err);
      toast({
        title: 'Error',
        description: 'Failed to suspend user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await supabase.rpc('delete_user', {
        user_id: selectedUser.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Deleted',
        description: `${selectedUser.email} has been permanently deleted.`,
      });
      
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUsers.size === 0) return;
    
    try {
      const userIds = Array.from(selectedUsers);
      const adminId = (await supabase.auth.getUser()).data.user?.id;
      
      switch (action) {
        case 'suspend':
          // In a real app, you would implement a bulk suspend function
          toast({
            title: 'Bulk Action',
            description: `${selectedUsers.size} users would be suspended.`,
          });
          break;
        case 'activate':
          // In a real app, you would implement a bulk activate function
          toast({
            title: 'Bulk Action',
            description: `${selectedUsers.size} users would be activated.`,
          });
          break;
        case 'delete':
          // In a real app, you would implement a bulk delete function
          toast({
            title: 'Bulk Action',
            description: `${selectedUsers.size} users would be deleted.`,
          });
          break;
      }
      
      setSelectedUsers(new Set());
      setSelectAll(false);
      fetchUsers();
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${action} users. Please try again.`,
        variant: 'destructive',
      });
    }
  };
  
  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  // Render plan badge
  const renderPlanBadge = (plan: string) => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
    
    if (plan.includes('ltd')) {
      variant = "secondary";
    } else if (plan === 'premium') {
      variant = "default";
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {plan || "Free"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage user accounts, view activity, and control access.
          </p>
        </div>
        <Button onClick={() => navigate('/admin/users/new')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-xs font-medium mb-2">Plan Type</p>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="ltd_solo">LTD Solo</SelectItem>
                    <SelectItem value="ltd_pro">LTD Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium mb-2">Status</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <ExportDataButton 
            data={users} 
            filename="users-export" 
            buttonProps={{ variant: "outline", size: "sm" }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </ExportDataButton>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="appsumo">AppSumo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle>Users</CardTitle>
                <CardDescription>{totalCount} total users</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUsers.size > 0 && (
                <div className="bg-muted/50 p-2 rounded-md mb-4 flex items-center justify-between">
                  <span className="text-sm">{selectedUsers.size} users selected</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleBulkAction('activate')}
                    >
                      Activate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleBulkAction('suspend')}
                    >
                      Suspend
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleBulkAction('delete')}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          checked={selectAll} 
                          onCheckedChange={handleSelectAll} 
                          aria-label="Select all users"
                        />
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          Email
                          {sortField === 'email' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort('full_name')}
                        >
                          Name
                          {sortField === 'full_name' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort('plan_type')}
                        >
                          Plan
                          {sortField === 'plan_type' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort('signup_date')}
                        >
                          Signup Date
                          {sortField === 'signup_date' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSort('last_active_at')}
                        >
                          Last Active
                          {sortField === 'last_active_at' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          <div className="flex items-center justify-center text-destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {error.message}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className={user.is_suspended ? "bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedUsers.has(user.id)} 
                              onCheckedChange={() => toggleUserSelection(user.id)} 
                              aria-label={`Select ${user.email}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.full_name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.is_suspended ? "destructive" : "outline"} 
                              className="capitalize"
                            >
                              {user.is_suspended ? "Suspended" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              {renderPlanBadge(user.plan_type)}
                              {user.is_appsumo_user && (
                                <Badge variant="secondary" className="ml-1">AppSumo</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(user.signup_date), 'MMM d, yyyy')}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.last_active_at ? (
                              format(new Date(user.last_active_at), 'MMM d, yyyy')
                            ) : (
                              "Never"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUserAction('view', user)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              <UserActionControls 
                                user={user}
                                variant="dropdown"
                                size="sm"
                                onActionComplete={fetchUsers}
                                showViewAction={false} // We already have a view button
                              />
                            </div>
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
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} users
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
                        <SelectValue placeholder="10" />
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
        </TabsContent>
        
        <TabsContent value="active">
          {/* Similar content as "all" tab but with pre-filtered active users */}
          <Card>
            <CardHeader>
              <CardTitle>Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would show only active users with the same functionality as the All Users tab.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="suspended">
          {/* Similar content as "all" tab but with pre-filtered suspended users */}
          <Card>
            <CardHeader>
              <CardTitle>Suspended Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would show only suspended users with the same functionality as the All Users tab.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appsumo">
          {/* Similar content as "all" tab but with pre-filtered AppSumo users */}
          <Card>
            <CardHeader>
              <CardTitle>AppSumo Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This tab would show only AppSumo LTD users with the same functionality as the All Users tab.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Suspend User Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUser?.email}? This will prevent them from accessing the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label htmlFor="suspend-reason" className="text-sm font-medium">
              Suspension Reason (optional)
            </label>
            <Input
              id="suspend-reason"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter reason for suspension"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspendUser}>
              <Ban className="mr-2 h-4 w-4" />
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone and will permanently remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}