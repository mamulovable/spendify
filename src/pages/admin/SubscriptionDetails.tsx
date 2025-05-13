import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { AdminSubscription } from '@/hooks/useAdminSubscriptions';
import { ArrowLeft, Calendar, CreditCard, AlertTriangle, History, User } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InvoiceHistory {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  invoice_pdf: string | null;
}

interface SubscriptionEvent {
  id: string;
  created_at: string;
  event_type: string;
  details: any;
}

export default function SubscriptionDetails() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<AdminSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceHistory[]>([]);
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
    fetchInvoiceHistory();
    fetchSubscriptionEvents();
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_subscription_view')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (err) {
      console.error('Error fetching subscription details:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_history')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoice history:', err);
    }
  };

  const fetchSubscriptionEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_events')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching subscription events:', err);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Log activity
      await supabase.from('admin_activities').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: 'cancelled',
        resource_type: 'subscription',
        resource_id: subscriptionId,
        details: { user_id: subscription?.user_id },
      });

      toast({
        title: 'Subscription Cancelled',
        description: 'The subscription will end at the current billing period',
      });
      
      setShowCancelDialog(false);
      fetchSubscriptionDetails();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  const handleResumeSubscription = async () => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscriptionId);

      if (error) throw error;

      // Log activity
      await supabase.from('admin_activities').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: 'resumed',
        resource_type: 'subscription',
        resource_id: subscriptionId,
        details: { user_id: subscription?.user_id },
      });

      toast({
        title: 'Subscription Resumed',
        description: 'The subscription will continue after the current billing period',
      });
      
      fetchSubscriptionDetails();
    } catch (err) {
      console.error('Error resuming subscription:', err);
      toast({
        title: 'Error',
        description: 'Failed to resume subscription',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!subscription) {
    return <div>Subscription not found</div>;
  }

  const isCancellationAvailable = subscription.status === 'active' && !subscription.cancel_at_period_end;
  const isResumeAvailable = subscription.status === 'active' && subscription.cancel_at_period_end;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/subscriptions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscriptions
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {subscription.plan_name}
                </CardTitle>
                <CardDescription>
                  {subscription.user_email}
                </CardDescription>
              </div>
              <Badge
                variant={
                  subscription.status === 'active'
                    ? subscription.cancel_at_period_end
                      ? 'outline'
                      : 'default'
                    : 'destructive'
                }
                className="ml-2"
              >
                {subscription.status === 'active' && subscription.cancel_at_period_end 
                  ? 'Cancelling' 
                  : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(subscription.created_at), 'PPP')}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Price</h4>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(subscription.plan_price)} / {subscription.billing_interval}
                </p>
              </div>
              {subscription.trial_ends_at && (
                <div>
                  <h4 className="text-sm font-medium">Trial Ends</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(subscription.trial_ends_at), 'PPP')}
                  </p>
                </div>
              )}
              {subscription.current_period_end && (
                <div>
                  <h4 className="text-sm font-medium">Current Period Ends</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(subscription.current_period_end), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate(`/admin/users/${subscription.user_id}`)}>
              <User className="h-4 w-4 mr-2" />
              View User
            </Button>
            <div className="space-x-2">
              {isCancellationAvailable && (
                <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                  Cancel Subscription
                </Button>
              )}
              {isResumeAvailable && (
                <Button variant="default" onClick={handleResumeSubscription}>
                  Resume Subscription
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">
              <CreditCard className="h-4 w-4 mr-2" />
              Invoice History
            </TabsTrigger>
            <TabsTrigger value="events">
              <History className="h-4 w-4 mr-2" />
              Event Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No invoices found for this subscription
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            {format(new Date(invoice.created_at), 'PPP')}
                          </TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {invoice.invoice_pdf && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={invoice.invoice_pdf} target="_blank" rel="noreferrer">
                                  View Invoice
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Log</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No events found for this subscription
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            {format(new Date(event.created_at), 'PPP')}
                          </TableCell>
                          <TableCell className="capitalize">
                            {event.event_type.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            {JSON.stringify(event.details)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this subscription? The user will continue to have access until the end of their current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>Cancel Subscription</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
