import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  activeSubscriptions: number;
  documentsProcessed: number;
  monthlyRevenue: number;
  userGrowth: number;
  processingQueue: number;
  errorRate: number;
  apiLoad: number;
}

interface MetricsResponse {
  metrics: DashboardMetrics;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAdminMetrics(): MetricsResponse {
  const { logActivity } = useAdmin();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    activeSubscriptions: 0,
    documentsProcessed: 0,
    monthlyRevenue: 0,
    userGrowth: 0,
    processingQueue: 0,
    errorRate: 0,
    apiLoad: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total and active users
      const { data: usersData, error: usersError } = await supabase
        .from('admin_user_view')
        .select('is_active');
      
      if (usersError) throw usersError;

      const totalUsers = usersData.length;
      const activeUsers = usersData.filter(u => u.is_active).length;

      // Get new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: newUsersData, error: newUsersError } = await supabase
        .from('admin_user_view')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (newUsersError) throw newUsersError;

      // Get active subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('admin_subscription_view')
        .select('status, amount')
        .eq('status', 'active');

      if (subsError) throw subsError;

      // Get documents processed in last 30 days
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (docsError) throw docsError;

      // Calculate monthly revenue
      const monthlyRevenue = subsData.reduce((sum, sub) => sum + (sub.amount || 0), 0);

      // Calculate user growth (compared to previous 30 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: previousPeriodData, error: prevError } = await supabase
        .from('admin_user_view')
        .select('created_at')
        .gte('created_at', sixtyDaysAgo.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (prevError) throw prevError;

      const userGrowth = ((newUsersData.length - previousPeriodData.length) / previousPeriodData.length) * 100;

      // Get processing queue length
      const { data: queueData, error: queueError } = await supabase
        .from('documents')
        .select('id')
        .eq('status', 'pending');

      if (queueError) throw queueError;

      // Calculate error rate
      const totalDocs = docsData.length;
      const failedDocs = docsData.filter(doc => doc.status === 'error').length;
      const errorRate = totalDocs > 0 ? (failedDocs / totalDocs) * 100 : 0;

      // Get API load
      const { data: apiLoadData, error: apiLoadError } = await supabase
        .rpc('calculate_api_load');

      if (apiLoadError) throw apiLoadError;

      // Update metrics
      setMetrics({
        totalUsers,
        activeUsers,
        newUsers: newUsersData.length,
        activeSubscriptions: subsData.length,
        documentsProcessed: docsData.length,
        monthlyRevenue,
        userGrowth,
        processingQueue: queueData.length,
        errorRate,
        apiLoad: apiLoadData || 0,
      });

      await logActivity('fetched', 'dashboard_metrics');
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      await logActivity('error', 'dashboard_metrics', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Set up real-time subscription for metrics updates
    const metricsChannel = supabase
      .channel('admin-metrics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_metrics',
        },
        () => {
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      metricsChannel.unsubscribe();
    };
  }, []);

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  };
}
