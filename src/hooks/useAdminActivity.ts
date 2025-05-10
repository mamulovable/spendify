import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AdminActivityLog } from '@/types/admin';

interface ActivityResponse {
  logs: AdminActivityLog[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAdminActivity(limit: number = 10): ActivityResponse {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase.rpc(
        'get_recent_activity_logs',
        {
          p_limit: limit,
          p_offset: 0,
        }
      );

      if (dbError) throw dbError;

      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching admin activity:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activity'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();

    // Set up real-time subscription for activity updates
    const activityChannel = supabase
      .channel('admin-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_activity_logs',
        },
        () => {
          fetchActivity();
        }
      )
      .subscribe();

    return () => {
      activityChannel.unsubscribe();
    };
  }, [limit]);

  return {
    logs,
    loading,
    error,
    refresh: fetchActivity,
  };
}
