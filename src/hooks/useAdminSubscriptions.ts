import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface AdminSubscription {
  id: string;
  user_id: string;
  user_email: string;
  plan_name: string;
  plan_price: number;
  billing_interval: string;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionsResponse {
  subscriptions: AdminSubscription[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refresh: () => Promise<void>;
  updateStatus: (subscriptionId: string, newStatus: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  resumeSubscription: (subscriptionId: string) => Promise<void>;
}

export function useAdminSubscriptions(
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ''
): SubscriptionsResponse {
  const { logActivity } = useAdmin();
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('admin_subscription_view')
        .select('*', { count: 'exact' });

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.or(`user_email.ilike.%${searchQuery}%,plan_name.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error: dbError, count } = await query;

      if (dbError) throw dbError;

      setSubscriptions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscriptions'));
      await logActivity('error', 'subscription_management', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (subscriptionId: string, newStatus: string) => {
    try {
      const { error: dbError } = await supabase.rpc('update_subscription_status', {
        subscription_id: subscriptionId,
        new_status: newStatus,
      });

      if (dbError) throw dbError;

      await logActivity('updated', 'subscription', {
        subscription_id: subscriptionId,
        new_status: newStatus,
      });
      await fetchSubscriptions();
    } catch (err) {
      console.error('Error updating subscription:', err);
      throw err instanceof Error ? err : new Error('Failed to update subscription');
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscriptionId);

      if (dbError) throw dbError;

      await logActivity('cancelled', 'subscription', {
        subscription_id: subscriptionId,
      });
      await fetchSubscriptions();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      throw err instanceof Error ? err : new Error('Failed to cancel subscription');
    }
  };

  const resumeSubscription = async (subscriptionId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscriptionId);

      if (dbError) throw dbError;

      await logActivity('resumed', 'subscription', {
        subscription_id: subscriptionId,
      });
      await fetchSubscriptions();
    } catch (err) {
      console.error('Error resuming subscription:', err);
      throw err instanceof Error ? err : new Error('Failed to resume subscription');
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, limit, searchQuery]);

  return {
    subscriptions,
    loading,
    error,
    totalCount,
    refresh: fetchSubscriptions,
    updateStatus,
    cancelSubscription,
    resumeSubscription,
  };
}
