import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft, 
  RefreshCw, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Calendar,
  Clock,
  User,
  FileText,
  ReceiptText
} from 'lucide-react';
import { format } from 'date-fns';

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

interface Transaction {
  id: string;
  subscription_id: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  payment_method: string;
  created_at: string;
  receipt_url: string | null;
}

export default function SubscriptionDetails() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { toast } = useToast();
  
  // State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch subscription details
  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [subscriptionId]);
  
  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    
    try {
      // Fetch subscription details
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions_view')
        .select('*')
        .eq('id', subscriptionId)
        .single();
      
      if (subscriptionError) throw subscriptionError;
      
      if (subscriptionData) {
        setSubscription(subscriptionData as Subscription);
      }
      
      // Fetch transaction history
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });
      
      if (transactionError) throw transactionError;
      
      if (transactionData) {
        setTransactions(transactionData as Transaction[]);
      }
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      toast({
        title: 'Error',
        description: 'Failed to load subscription details. Please try again.',
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
    // Mock subscription
    setSubscription({
      id: subscriptionId || '1',
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
    });
    
    // Mock transactions
    setTransactions([
      {
        id: 'txn_1',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-06-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/1'
      },
      {
        id: 'txn_2',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-05-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/2'
      },
      {
        id: 'txn_3',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-04-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/3'
      },
      {
        id: 'txn_4',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-03-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/4'
      },
      {
        id: 'txn_5',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-02-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/5'
      },
      {
        id: 'txn_6',
        subscription_id: subscriptionId || '1',
        amount: 49.99,
        status: 'succeeded',
        payment_method: 'credit_card',
        created_at: '2023-01-15T10:30:00Z',
        receipt_url: 'https://example.com/receipt/6'
      }
    ]);
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
  
  // Get transaction status badge
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="mr-1 h-3 w-3" /> Succeeded
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
            <AlertCircle className="mr-1 h-3 w-3" /> Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
            <XCircle className="mr-1 h-3 w-3" /> Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <AlertCircle className="mr-1 h-3 w-3" /> Refunded
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
  
  // Format datetime
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  // Render loading state
  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Subscription Not Found</h2>
        <p className="text-muted-foreground mb-6">The subscription you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/admin/subscriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subscriptions
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/admin/subscriptions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Subscription Details</h2>
            <p className="text-muted-foreground">
              {subscription.plan_type} subscription for {subscription.user_name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchSubscriptionDetails}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Cancel Subscription
          </Button>
        </div>
      </div>
      
      {/* Subscription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Details about the current subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User</p>
                    <p className="font-medium">{subscription.user_name}</p>
                    <p className="text-sm text-muted-foreground">{subscription.user_email}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                      <Link to={`/admin/users/${subscription.user_id}`}>View User Profile</Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan Details</p>
                    <p className="font-medium">{subscription.plan_type}</p>
                    <p className="text-sm">
                      ${subscription.amount}
                      <span className="text-muted-foreground">
                        {subscription.interval === 'lifetime' ? ' (one-time)' : subscription.interval === 'monthly' ? '/month' : '/year'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscription Dates</p>
                    <p>Started: <span className="font-medium">{formatDate(subscription.start_date)}</span></p>
                    {subscription.end_date && (
                      <p>Ends: <span className="font-medium">{formatDate(subscription.end_date)}</span></p>
                    )}
                    {subscription.trial_end_date && (
                      <p>Trial Ends: <span className="font-medium">{formatDate(subscription.trial_end_date)}</span></p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(subscription.status)}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Schedule</p>
                    {subscription.interval !== 'lifetime' ? (
                      <>
                        <p>Last Payment: <span className="font-medium">{formatDate(subscription.last_payment_date)}</span></p>
                        <p>Next Payment: <span className="font-medium">{formatDate(subscription.next_payment_date)}</span></p>
                      </>
                    ) : (
                      <p>One-time payment on <span className="font-medium">{formatDate(subscription.start_date)}</span></p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{subscription.payment_method.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">Last updated: {formatDate(subscription.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Summary</CardTitle>
            <CardDescription>Financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">
                  ${(transactions.reduce((sum, txn) => sum + (txn.status === 'succeeded' ? txn.amount : 0), 0)).toFixed(2)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Count</p>
                <p className="text-xl font-medium">
                  {transactions.filter(txn => txn.status === 'succeeded').length} payments
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subscription Age</p>
                <p className="text-xl font-medium">
                  {Math.floor((new Date().getTime() - new Date(subscription.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <p className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</p>
            <div className="space-y-2 w-full">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                Change Plan
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="notes">Notes & Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Record of all payments for this subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="capitalize">{transaction.payment_method.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">
                        {transaction.receipt_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer">
                              <ReceiptText className="h-4 w-4" />
                              <span className="sr-only">View Receipt</span>
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No transactions found for this subscription.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Events</CardTitle>
              <CardDescription>Subscription activity and admin notes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Subscription Created</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(subscription.created_at)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subscription was created with plan: {subscription.plan_type}
                  </p>
                </div>
                
                {subscription.updated_at !== subscription.created_at && (
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Subscription Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(subscription.updated_at)}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Subscription details were updated
                    </p>
                  </div>
                )}
                
                {/* Add form for new notes here */}
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">No additional notes found</p>
                  <Button variant="outline">Add Note</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}