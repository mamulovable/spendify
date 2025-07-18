import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Filter, 
  Download, 
  Upload, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  BarChart,
  Eye,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { AppSumoMetricsChart } from '@/components/admin/AppSumoMetricsChart';
import { AppSumoRedemptionDetails, AppSumoRedemption } from '@/components/admin/AppSumoRedemptionDetails';
import { toast } from 'sonner';
import { toast } from 'sonner';

// AppSumo types
interface AppSumoCode {
  id: string;
  code: string;
  plan_type: string;
  status: 'available' | 'redeemed' | 'expired';
  redeemed_by?: string;
  redeemed_at?: string;
  created_at: string;
  expires_at?: string;
}

interface AppSumoStats {
  total_codes: number;
  redeemed_codes: number;
  available_codes: number;
  expired_codes: number;
  redemption_rate: number;
  ltd_solo_count: number;
  ltd_pro_count: number;
}

export default function AppSumo() {
  const { toast } = useToast();
  
  // State
  const [codes, setCodes] = useState<AppSumoCode[]>([]);
  const [stats, setStats] = useState<AppSumoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCodes, setTotalCodes] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importCodes, setImportCodes] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('ltd_solo');
  const [timeRange, setTimeRange] = useState('30d');
  const [redemptionData, setRedemptionData] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<AppSumoRedemption[]>([]);
  const [selectedRedemption, setSelectedRedemption] = useState<AppSumoRedemption | null>(null);
  const [isRedemptionDetailsOpen, setIsRedemptionDetailsOpen] = useState(false);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const itemsPerPage = 10;
  
  // Fetch codes
  useEffect(() => {
    fetchCodes();
  }, [currentPage, statusFilter, planFilter, searchQuery]);
  
  const fetchCodes = async () => {
    setLoading(true);
    
    try {
      // Build query
      let query = supabase
        .from('appsumo_codes')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (planFilter !== 'all') {
        query = query.eq('plan_type', planFilter);
      }
      
      if (searchQuery) {
        query = query.or(`code.ilike.%${searchQuery}%,redeemed_by.ilike.%${searchQuery}%`);
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
        setCodes(data as AppSumoCode[]);
        
        if (count !== null) {
          setTotalCodes(count);
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
      }
      
      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_appsumo_stats');
      
      if (statsError) throw statsError;
      
      if (statsData) {
        setStats(statsData as AppSumoStats);
      }
    } catch (err) {
      console.error('Error fetching AppSumo codes:', err);
      toast({
        title: 'Error',
        description: 'Failed to load AppSumo codes. Please try again.',
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
    // Mock codes
    const mockCodes: AppSumoCode[] = [
      {
        id: '1',
        code: 'SUMO-ABCD-1234',
        plan_type: 'ltd_solo',
        status: 'available',
        created_at: '2023-06-01T10:00:00Z',
        expires_at: '2024-06-01T10:00:00Z'
      },
      {
        id: '2',
        code: 'SUMO-EFGH-5678',
        plan_type: 'ltd_pro',
        status: 'redeemed',
        redeemed_by: 'john.doe@example.com',
        redeemed_at: '2023-06-15T14:30:00Z',
        created_at: '2023-06-01T10:00:00Z',
        expires_at: '2024-06-01T10:00:00Z'
      },
      {
        id: '3',
        code: 'SUMO-IJKL-9012',
        plan_type: 'ltd_solo',
        status: 'redeemed',
        redeemed_by: 'jane.smith@example.com',
        redeemed_at: '2023-06-10T09:15:00Z',
        created_at: '2023-06-01T10:00:00Z',
        expires_at: '2024-06-01T10:00:00Z'
      },
      {
        id: '4',
        code: 'SUMO-MNOP-3456',
        plan_type: 'ltd_pro',
        status: 'available',
        created_at: '2023-06-01T10:00:00Z',
        expires_at: '2024-06-01T10:00:00Z'
      },
      {
        id: '5',
        code: 'SUMO-QRST-7890',
        plan_type: 'ltd_solo',
        status: 'expired',
        created_at: '2022-06-01T10:00:00Z',
        expires_at: '2023-06-01T10:00:00Z'
      }
    ];
    
    setCodes(mockCodes);
    setTotalCodes(mockCodes.length);
    setTotalPages(Math.ceil(mockCodes.length / itemsPerPage));
    
    // Mock stats
    setStats({
      total_codes: 1000,
      redeemed_codes: 450,
      available_codes: 500,
      expired_codes: 50,
      redemption_rate: 45.0,
      ltd_solo_count: 600,
      ltd_pro_count: 400
    });
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchCodes();
  };
  
  // Handle code import
  const handleImportCodes = async () => {
    if (!importCodes.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter codes to import.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsImporting(true);
    
    try {
      // Split codes by newline
      const codeList = importCodes
        .split('\n')
        .map(code => code.trim())
        .filter(code => code.length > 0);
      
      if (codeList.length === 0) {
        throw new Error('No valid codes found');
      }
      
      // Prepare data for insertion
      const codesToInsert = codeList.map(code => ({
        code,
        plan_type: selectedPlan,
        status: 'available',
        created_at: new Date().toISOString(),
        expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
      }));
      
      // Insert codes
      const { data, error } = await supabase
        .from('appsumo_codes')
        .insert(codesToInsert);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Successfully imported ${codeList.length} codes.`,
      });
      
      // Clear form and refresh
      setImportCodes('');
      fetchCodes();
    } catch (err) {
      console.error('Error importing codes:', err);
      toast({
        title: 'Error',
        description: 'Failed to import codes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="mr-1 h-3 w-3" /> Available
          </span>
        );
      case 'redeemed':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <CheckCircle className="mr-1 h-3 w-3" /> Redeemed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="mr-1 h-3 w-3" /> Expired
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
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Render loading state
  if (loading && codes.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">AppSumo Codes</h2>
          <p className="text-muted-foreground">
            Manage and track AppSumo code redemptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchRedemptionData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.total_codes.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{stats.ltd_solo_count}</span> LTD Solo, 
                <span className="font-medium ml-1">{stats.ltd_pro_count}</span> LTD Pro
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Available Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.available_codes.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {((stats.available_codes / stats.total_codes) * 100).toFixed(1)}% of total codes
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Redeemed Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.redeemed_codes.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.redemption_rate.toFixed(1)}% redemption rate
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expired Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{stats.expired_codes.toLocaleString()}</div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {((stats.expired_codes / stats.total_codes) * 100).toFixed(1)}% of total codes
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="ltd_solo">LTD Solo</SelectItem>
              <SelectItem value="ltd_pro">LTD Pro</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchCodes}>
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
            placeholder="Search by code or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
          <Button type="submit" variant="secondary" className="ml-2">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>
      
      {/* Import Codes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Import AppSumo Codes</CardTitle>
          <CardDescription>Add new AppSumo codes to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Textarea
                placeholder="Enter codes, one per line..."
                value={importCodes}
                onChange={(e) => setImportCodes(e.target.value)}
                rows={5}
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Type</label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltd_solo">LTD Solo</SelectItem>
                    <SelectItem value="ltd_pro">LTD Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleImportCodes} 
                disabled={isImporting || !importCodes.trim()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isImporting ? 'Importing...' : 'Import Codes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Codes, Redemptions, and Analytics */}
      <Tabs defaultValue="codes" className="w-full">
        <TabsList>
          <TabsTrigger value="codes">Codes</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Codes Tab */}
        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AppSumo Codes</CardTitle>
              <CardDescription>
                Showing {codes.length} of {totalCodes} codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Redeemed By</TableHead>
                    <TableHead>Redeemed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono">{code.code}</TableCell>
                      <TableCell className="capitalize">{code.plan_type.replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(code.status)}</TableCell>
                      <TableCell>{formatDate(code.created_at)}</TableCell>
                      <TableCell>{formatDate(code.expires_at)}</TableCell>
                      <TableCell>{code.redeemed_by || '-'}</TableCell>
                      <TableCell>{formatDate(code.redeemed_at)}</TableCell>
                    </TableRow>
                  ))}
                  
                  {codes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No codes found. Try adjusting your filters or import new codes.
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
        </TabsContent>
        
        {/* Redemptions Tab */}
        <TabsContent value="redemptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>Track AppSumo code redemptions and user details</CardDescription>
              </div>
              <Button variant="outline" onClick={handleExportRedemptions}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRedemptions ? (
                <div className="flex items-center justify-center h-[300px]">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Upgrade</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No redemptions found for the selected time period.
                        </TableCell>
                      </TableRow>
                    ) : (
                      redemptions.map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>{formatDate(redemption.redeemed_at)}</TableCell>
                          <TableCell className="font-mono text-xs">{redemption.code}</TableCell>
                          <TableCell>{redemption.user_email || '-'}</TableCell>
                          <TableCell className="capitalize">{redemption.plan_type.replace('_', ' ')}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {redemption.status}
                            </span>
                          </TableCell>
                          <TableCell>{redemption.is_upgrade ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewRedemptionDetails(redemption)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewUserProfile(redemption.user_id)}>
                                  <User className="mr-2 h-4 w-4" />
                                  View User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          {/* Redemption Details Dialog */}
          <AppSumoRedemptionDetails
            redemption={selectedRedemption}
            open={isRedemptionDetailsOpen}
            onOpenChange={setIsRedemptionDetailsOpen}
            onViewUser={handleViewUserProfile}
          />
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AppSumoMetricsChart 
            redemptionData={redemptionData}
            timeRange={timeRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 

// Fetch redemption data
  useEffect(() => {
    fetchRedemptionData();
  }, [timeRange]);
  
  const fetchRedemptionData = async () => {
    setLoadingRedemptions(true);
    
    try {
      // Calculate date range based on selected time range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        default:
          startDate = subDays(now, 30);
      }
      
      // Format dates for API calls
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(now, 'yyyy-MM-dd');
      
      // Fetch redemption data
      const { data, error } = await supabase
        .from('appsumo_redemptions')
        .select(`
          id,
          code,
          user_id,
          redemption_date,
          plan_type,
          status,
          is_upgrade,
          previous_plan,
          ip_address,
          user_agent,
          auth.users!user_id(email)
        `)
        .gte('redemption_date', startDateStr)
        .lte('redemption_date', endDateStr)
        .order('redemption_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Process data for redemption list
        const processedRedemptions: AppSumoRedemption[] = data.map(item => ({
          id: item.id,
          code: item.code,
          user_id: item.user_id,
          user_email: item.users?.email,
          plan_type: item.plan_type,
          redeemed_at: item.redemption_date,
          ip_address: item.ip_address,
          user_agent: item.user_agent,
          is_upgrade: item.is_upgrade,
          previous_plan: item.previous_plan,
          status: item.status
        }));
        
        setRedemptions(processedRedemptions);
        
        // Process data for charts
        const chartData = processRedemptionDataForCharts(data);
        setRedemptionData(chartData);
      }
    } catch (err) {
      console.error('Error fetching redemption data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load redemption data. Please try again.',
        variant: 'destructive',
      });
      
      // Set mock data for demonstration
      setMockRedemptionData();
    } finally {
      setLoadingRedemptions(false);
    }
  };
  
  // Process redemption data for charts
  const processRedemptionDataForCharts = (data: any[]) => {
    // Group by date and plan type
    const groupedData: Record<string, Record<string, number>> = {};
    
    data.forEach(item => {
      const date = format(new Date(item.redemption_date), 'yyyy-MM-dd');
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      
      if (!groupedData[date][item.plan_type]) {
        groupedData[date][item.plan_type] = 0;
      }
      
      groupedData[date][item.plan_type]++;
    });
    
    // Convert to array format for charts
    const chartData = Object.entries(groupedData).map(([date, plans]) => {
      return Object.entries(plans).map(([plan_type, count]) => ({
        date,
        plan_type,
        count
      }));
    }).flat();
    
    return chartData;
  };
  
  // Set mock redemption data for demonstration
  const setMockRedemptionData = () => {
    const mockRedemptions: AppSumoRedemption[] = [];
    const mockChartData = [];
    const now = new Date();
    const planTypes = ['ltd_solo', 'ltd_pro'];
    const userEmails = [
      'john.doe@example.com',
      'jane.smith@example.com',
      'robert.johnson@example.com',
      'sarah.williams@example.com',
      'michael.brown@example.com'
    ];
    
    // Generate 20 mock redemptions
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const redemptionDate = format(subDays(now, daysAgo), 'yyyy-MM-dd');
      const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
      const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
      const isUpgrade = Math.random() > 0.7;
      
      mockRedemptions.push({
        id: `red-${i}`,
        code: `SUMO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        user_id: `user-${i}`,
        user_email: userEmail,
        plan_type: planType,
        redeemed_at: redemptionDate,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        is_upgrade: isUpgrade,
        previous_plan: isUpgrade ? 'premium' : undefined,
        status: 'active'
      });
      
      // Add to chart data
      mockChartData.push({
        date: redemptionDate,
        plan_type: planType,
        count: 1
      });
    }
    
    setRedemptions(mockRedemptions);
    setRedemptionData(mockChartData);
  };
  
  // Handle viewing redemption details
  const handleViewRedemptionDetails = (redemption: AppSumoRedemption) => {
    setSelectedRedemption(redemption);
    setIsRedemptionDetailsOpen(true);
  };
  
  // Handle viewing user profile
  const handleViewUserProfile = (userId: string) => {
    // Navigate to user profile page
    window.location.href = `/admin/users/${userId}`;
  };
  
  // Export redemption data to CSV
  const handleExportRedemptions = () => {
    if (redemptions.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no redemptions to export.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create CSV content
    const headers = ['Code', 'User Email', 'Plan Type', 'Redemption Date', 'Status', 'Is Upgrade', 'Previous Plan'];
    const csvRows = [
      headers.join(','),
      ...redemptions.map(r => [
        r.code,
        r.user_email || '',
        r.plan_type,
        r.redeemed_at,
        r.status,
        r.is_upgrade ? 'Yes' : 'No',
        r.previous_plan || ''
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `appsumo-redemptions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
