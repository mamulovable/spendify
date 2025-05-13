import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, AlertCircle, FileText } from 'lucide-react';
import { useAdminSubscriptions, type AdminSubscription } from '@/hooks/useAdminSubscriptions';
import { formatCurrency } from '@/lib/utils';

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: AdminSubscription;
}

function CancelDialog({ isOpen, onClose, onConfirm, subscription }: CancelDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel the subscription for {subscription.user_email}?
            Their access will continue until the end of the current billing period
            ({new Date(subscription.current_period_end).toLocaleDateString()}).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Cancel Subscription</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Subscriptions() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);
  const { toast } = useToast();

  const {
    subscriptions,
    loading,
    error,
    totalCount,
    updateStatus,
    cancelSubscription,
    resumeSubscription,
  } = useAdminSubscriptions(page, 10, searchQuery);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSubscriptionAction = async (
    action: 'cancel' | 'resume' | 'activate' | 'deactivate',
    subscription: AdminSubscription
  ) => {
    try {
      switch (action) {
        case 'cancel':
          setSelectedSubscription(subscription);
          setShowCancelDialog(true);
          break;
        case 'resume':
          await resumeSubscription(subscription.id);
          toast({
            title: 'Subscription Resumed',
            description: `Subscription for ${subscription.user_email} has been resumed.`,
          });
          break;
        case 'activate':
          await updateStatus(subscription.id, 'active');
          toast({
            title: 'Subscription Activated',
            description: `Subscription for ${subscription.user_email} has been activated.`,
          });
          break;
        case 'deactivate':
          await updateStatus(subscription.id, 'inactive');
          toast({
            title: 'Subscription Deactivated',
            description: `Subscription for ${subscription.user_email} has been deactivated.`,
          });
          break;
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedSubscription) return;

    try {
      await cancelSubscription(selectedSubscription.id);
      toast({
        title: 'Subscription Cancelled',
        description: `Subscription for ${selectedSubscription.user_email} will end on ${new Date(
          selectedSubscription.current_period_end
        ).toLocaleDateString()}.`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setShowCancelDialog(false);
      setSelectedSubscription(null);
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subscriptions</CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalCount} total subscriptions
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search subscriptions..."
                className="max-w-sm"
                type="search"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Trial Ends</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-red-500">
                        <div className="flex items-center justify-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {error.message}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">
                          {subscription.user_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {subscription.plan_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subscription.status === 'active' ? 'default' : 'secondary'}
                            className="capitalize">
                            {subscription.status}
                          </Badge>
                          {subscription.cancel_at_period_end && (
                            <Badge variant="destructive" className="ml-2">
                              Cancelling
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(subscription.plan_price)} /{' '}
                          {subscription.billing_interval}
                        </TableCell>
                        <TableCell>
                          {subscription.trial_ends_at
                            ? new Date(subscription.trial_ends_at).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            className="hover:bg-transparent p-0 mr-2"
                            onClick={() => navigate(`/admin/subscriptions/${subscription.id}`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {subscription.status === 'active' ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSubscriptionAction('deactivate', subscription)
                                  }>
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSubscriptionAction('activate', subscription)
                                  }>
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {subscription.cancel_at_period_end ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSubscriptionAction('resume', subscription)
                                  }>
                                  Resume Subscription
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleSubscriptionAction('cancel', subscription)
                                  }>
                                  Cancel Subscription
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalCount > 10 && (
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * 10 >= totalCount}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedSubscription && (
        <CancelDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false);
            setSelectedSubscription(null);
          }}
          onConfirm={handleConfirmCancel}
          subscription={selectedSubscription}
        />
      )}
    </div>
  );
}
