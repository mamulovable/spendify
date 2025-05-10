import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  subscription_status: string;
  subscription_plan: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  document_count: number;
  processed_documents: number;
  is_suspended?: boolean;
}

interface UsersResponse {
  users: AdminUser[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  refresh: () => Promise<void>;
  suspendUser: (userId: string) => Promise<void>;
  activateUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export function useAdminUsers(
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ''
): UsersResponse {
  const { logActivity } = useAdmin();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('admin_user_view')
        .select('*', { count: 'exact' });

      // Apply search filter if query exists
      if (searchQuery) {
        query = query.ilike('email', `%${searchQuery}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error: dbError, count } = await query;

      if (dbError) throw dbError;

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
      await logActivity('error', 'user_management', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const suspendUser = async (userId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('suspend_user', {
        target_user_id: userId,
      });

      if (dbError) throw dbError;

      await logActivity('suspended', 'user', { user_id: userId });
      await fetchUsers();
    } catch (err) {
      console.error('Error suspending user:', err);
      throw err instanceof Error ? err : new Error('Failed to suspend user');
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('activate_user', {
        target_user_id: userId,
      });

      if (dbError) throw dbError;

      await logActivity('activated', 'user', { user_id: userId });
      await fetchUsers();
    } catch (err) {
      console.error('Error activating user:', err);
      throw err instanceof Error ? err : new Error('Failed to activate user');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('delete_user', {
        target_user_id: userId,
      });

      if (dbError) throw dbError;

      await logActivity('deleted', 'user', { user_id: userId });
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err instanceof Error ? err : new Error('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, searchQuery]);

  return {
    users,
    loading,
    error,
    totalCount,
    refresh: fetchUsers,
    suspendUser,
    activateUser,
    deleteUser,
  };
}
