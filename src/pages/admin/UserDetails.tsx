import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { type AdminUser } from '@/hooks/useAdminUsers';
import { ArrowLeft, Calendar, CreditCard, FileText, Activity, User } from 'lucide-react';

interface UserActivity {
  id: string;
  created_at: string;
  activity_type: string;
  details: any;
}

interface UserDocument {
  id: string;
  created_at: string;
  name: string;
  type: string;
  status: string;
}

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);

  useEffect(() => {
    fetchUserDetails();
    fetchUserActivities();
    fetchUserDocuments();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_view')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data);
    } catch (err) {
      console.error('Error fetching user activities:', err);
    }
  };

  const fetchUserDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching user documents:', err);
    }
  };

  const handleUpdateSubscription = async (action: 'cancel' | 'reactivate') => {
    try {
      const { error } = await supabase.rpc(
        action === 'cancel' ? 'cancel_subscription' : 'reactivate_subscription',
        { target_user_id: userId }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Subscription ${action === 'cancel' ? 'cancelled' : 'reactivated'} successfully`,
      });
      
      fetchUserDetails();
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to ${action} subscription`,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{user.email}</CardTitle>
                <CardDescription>
                  Joined {format(new Date(user.created_at), 'PPP')}
                </CardDescription>
              </div>
              <Badge
                variant={user.is_suspended ? 'destructive' : 'default'}
                className="ml-2"
              >
                {user.is_suspended ? 'Suspended' : 'Active'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Subscription Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.subscription_status}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Current Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.subscription_plan || 'No plan'}
                  </p>
                </div>
                {user.trial_ends_at && (
                  <div>
                    <h4 className="text-sm font-medium">Trial Ends</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(user.trial_ends_at), 'PPP')}
                    </p>
                  </div>
                )}
                {user.current_period_end && (
                  <div>
                    <h4 className="text-sm font-medium">Billing Period Ends</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(user.current_period_end), 'PPP')}
                    </p>
                  </div>
                )}
              </div>

              {user.subscription_status === 'active' && (
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateSubscription('cancel')}
                >
                  Cancel Subscription
                </Button>
              )}
              {user.subscription_status === 'cancelled' && (
                <Button
                  variant="default"
                  onClick={() => handleUpdateSubscription('reactivate')}
                >
                  Reactivate Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {format(new Date(activity.created_at), 'PPP')}
                        </TableCell>
                        <TableCell>{activity.activity_type}</TableCell>
                        <TableCell>
                          {JSON.stringify(activity.details)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {format(new Date(doc.created_at), 'PPP')}
                        </TableCell>
                        <TableCell>{doc.name}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
