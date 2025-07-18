import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  FileText, 
  Mail, 
  MapPin, 
  Phone, 
  RefreshCw, 
  Shield, 
  User as UserIcon,
  AlertTriangle,
  Clock,
  Activity,
  BarChart,
  FileUp,
  MessageSquare,
  Ban,
  Trash2,
  Edit,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// User type definition
interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  plan_type: string;
  is_suspended: boolean;
  suspension_reason?: string;
  signup_date: string;
  last_active_at: string;
  document_count: number;
  subscription_status: string;
  is_appsumo_user: boolean;
  subscription_start_date?: string;
  subscription_end_date?: string;
  total_uploads: number;
  total_statements: number;
  total_receipts: number;
  total_logins: number;
  last_login_at?: string;
}

// Activity log type
interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Document type
interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  status: string;
  uploaded_at: string;
  processed_at?: string;
  transaction_count?: number;
}

export default function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [user, setUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('admin_user_details')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (userError) throw userError;
        if (!userData) throw new Error('User not found');
        
        setUser(userData);
        
        // Fetch user activity logs
        const { data: logsData, error: logsError } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (logsError) throw logsError;
        setActivityLogs(logsData || []);
        
        // Fetch user documents
        const { data: docsData, error: docsError } = await supabase
          .from('document_uploads')
          .select('*')
          .eq('user_id', userId)
          .order('uploaded_at', { ascending: false })
          .limit(20);
        
        if (docsError) throw docsError;
        setDocuments(docsData || []);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
        toast({
          title: 'Error',
          description: 'Failed to load user data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  // Handle suspend user
  const handleSuspendUser = async () => {
    if (!user) return;
    
    try {
      await supabase.rpc('suspend_user', {
        user_id: user.id,
        reason: suspendReason,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Suspended',
        description: `${user.email} has been suspended.`,
      });
      
      setShowSuspendDialog(false);
      setSuspendReason('');
      
      // Update local state
      setUser({
        ...user,
        is_suspended: true,
        suspension_reason: suspendReason
      });
      
    } catch (err) {
      console.error('Error suspending user:', err);
      toast({
        title: 'Error',
        description: 'Failed to suspend user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle activate user
  const handleActivateUser = async () => {
    if (!user) return;
    
    try {
      await supabase.rpc('unsuspend_user', {
        user_id: user.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Activated',
        description: `${user.email} has been activated.`,
      });
      
      // Update local state
      setUser({
        ...user,
        is_suspended: false,
        suspension_reason: undefined
      });
      
    } catch (err) {
      console.error('Error activating user:', err);
      toast({
        title: 'Error',
        description: 'Failed to activate user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      await supabase.rpc('delete_user', {
        user_id: user.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Deleted',
        description: `${user.email} has been permanently deleted.`,
      });
      
      setShowDeleteDialog(false);
      navigate('/admin/users');
      
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Format activity type for display
  const formatActivityType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Lock className="h-4 w-4" />;
      case 'logout':
        return <Unlock className="h-4 w-4" />;
      case 'upload_document':
        return <FileUp className="h-4 w-4" />;
      case 'view_statement':
        return <FileText className="h-4 w-4" />;
      case 'update_profile':
        return <UserIcon className="h-4 w-4" />;
      case 'change_subscription':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  // Get document status badge
  const getDocumentStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "outline";
    
    switch (status.toLowerCase()) {
      case 'completed':
        variant = "default";
        break;
      case 'processing':
        variant = "secondary";
        break;
      case 'failed':
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }
    
    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    );
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || "The requested user could not be found."}
        </p>
        <Button onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/admin/users/${userId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {user.is_suspended ? (
            <Button variant="outline" onClick={handleActivateUser}>
              <Shield className="mr-2 h-4 w-4" />
              Activate User
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setShowSuspendDialog(true)}>
              <Ban className="mr-2 h-4 w-4" />
              Suspend User
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.full_name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              {user.is_suspended && (
                <Badge variant="destructive" className="mt-2">
                  Account Suspended
                </Badge>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={user.is_suspended ? "destructive" : "outline"}>
                  {user.is_suspended ? "Suspended" : "Active"}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant={user.is_appsumo_user ? "secondary" : "outline"} className="capitalize">
                  {user.plan_type || "Free"}
                  {user.is_appsumo_user && " (AppSumo)"}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span>{format(new Date(user.signup_date), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span>
                  {user.last_active_at 
                    ? format(new Date(user.last_active_at), 'MMM d, yyyy')
                    : "Never"}
                </span>
              </div>
              
              {user.phone_number && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.address}</span>
                </div>
              )}
            </div>
            
            {user.suspension_reason && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Suspension Reason</h4>
                  <p className="text-sm">{user.suspension_reason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* User Stats Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>Activity and usage metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Uploads</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.total_uploads || 0}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Statements</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.total_statements || 0}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Total Logins</span>
                </div>
                <p className="text-2xl font-bold mt-2">{user.total_logins || 0}</p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <p className="text-lg font-medium mt-2">
                  {user.last_login_at 
                    ? format(new Date(user.last_login_at), 'MMM d, yyyy')
                    : "Never"}
                </p>
              </div>
            </div>
            
            {user.subscription_status !== 'free' && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Subscription Details</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{user.subscription_status}</p>
                    </div>
                    
                    {user.subscription_start_date && (
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">
                          {format(new Date(user.subscription_start_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {user.subscription_end_date && !user.is_appsumo_user && (
                      <div>
                        <p className="text-sm text-muted-foreground">Renewal Date</p>
                        <p className="font-medium">
                          {format(new Date(user.subscription_end_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {user.is_appsumo_user && (
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">Lifetime Deal (AppSumo)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Admin Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>Recent user activity and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity logs found for this user.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-4">
                        <div className="bg-muted p-2 rounded-full">
                          {getActivityIcon(log.activity_type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{formatActivityType(log.activity_type)}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium capitalize">{key.replace('_', ' ')}: </span>
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value) 
                                    : String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                          {log.ip_address && (
                            <div className="text-xs text-muted-foreground">
                              IP: {log.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Documents uploaded by this user</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents found for this user.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Transactions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.file_name}</TableCell>
                          <TableCell>{doc.file_type}</TableCell>
                          <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                          <TableCell>{getDocumentStatusBadge(doc.status)}</TableCell>
                          <TableCell>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{doc.transaction_count || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>Internal notes about this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Admin notes feature not implemented yet.
              </div>
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
              Are you sure you want to suspend {user.email}? This will prevent them from accessing the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="suspend-reason">Suspension Reason (optional)</Label>
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
              Are you sure you want to delete {user.email}? This action cannot be undone and will permanently remove all user data.
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