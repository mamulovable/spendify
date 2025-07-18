import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import type { AdminUser, AdminRole, AdminPermission, AdminActivityLog } from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  permissions: Set<string>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  checkPermission: (permission: string) => Promise<boolean>;
  refreshAdminData: () => Promise<void>;
  setAdminUser: (user: AdminUser | null) => void;
  logActivity: (action: string, resource: string, details?: Record<string, any>) => Promise<void>;
  getRecentActivity: (limit?: number) => Promise<AdminActivityLog[]>;
  adminLogout: () => Promise<void>;
  sessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  // Update last activity time on user interaction
  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
    };
  }, []);

  // Check for session timeout
  useEffect(() => {
    if (!adminUser) return;

    const checkSessionTimeout = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        // Session expired
        setSessionExpired(true);
        toast({
          title: 'Session Expired',
          description: 'Your session has expired due to inactivity. Please log in again.',
          variant: 'destructive',
        });
        adminLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSessionTimeout);
  }, [adminUser, lastActivity]);

  const logActivity = async (action: string, resource: string, details?: Record<string, any>) => {
    if (!adminUser) return;

    try {
      const { error } = await supabase.from('admin_activity_logs').insert({
        admin_user_id: adminUser.id,
        action,
        resource,
        details,
        ip_address: window.location.hostname,
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to log admin activity:', err);
    }
  };

  const getRecentActivity = async (limit: number = 10): Promise<AdminActivityLog[]> => {
    if (!adminUser) return [];

    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*, admin_email:admin_users(email), role_name:admin_roles(name)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to fetch admin activity:', err);
      return [];
    }
  };

  const adminLogout = async () => {
    try {
      if (adminUser) {
        await logActivity('logout', 'auth');
      }
      
      setAdminUser(null);
      setPermissions(new Set());
      await signOut();
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
    } else {
      setAdminUser(null);
      setPermissions(new Set());
      setLoading(false);
    }
  }, [user]);

  const loadAdminData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch admin user data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles (
            *,
            permissions
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      if (adminData) {
        // Check if admin account is active
        if (!adminData.is_active) {
          toast({
            title: 'Account Deactivated',
            description: 'Your admin account has been deactivated. Please contact the system administrator.',
            variant: 'destructive',
          });
          await signOut();
          return;
        }

        setAdminUser(adminData);
        
        // Extract permissions
        const permissionSet = new Set<string>();
        if (adminData.role?.permissions) {
          // Parse the permissions JSON
          const permissionsArray = typeof adminData.role.permissions === 'string' 
            ? JSON.parse(adminData.role.permissions) 
            : adminData.role.permissions;
            
          // Add each permission to the set
          if (Array.isArray(permissionsArray)) {
            permissionsArray.forEach((permission: string) => {
              permissionSet.add(permission);
            });
          } else if (typeof permissionsArray === 'object') {
            // Handle case where permissions might be an object
            Object.entries(permissionsArray).forEach(([key, value]) => {
              if (value === true) {
                permissionSet.add(key);
              }
            });
          }
        }
        
        setPermissions(permissionSet);
        
        // Reset session expiration
        setSessionExpired(false);
        setLastActivity(Date.now());
      } else {
        // No admin data found for this user
        setAdminUser(null);
        setPermissions(new Set());
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setAdminUser(null);
      setPermissions(new Set());
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = useCallback((permission: string): boolean => {
    // Super admins have all permissions
    if (permissions.has('super_admin') || permissions.has('*')) {
      return true;
    }
    return permissions.has(permission);
  }, [permissions]);

  const hasAnyPermission = useCallback((requiredPermissions: string[]): boolean => {
    // Super admins have all permissions
    if (permissions.has('super_admin') || permissions.has('*')) {
      return true;
    }
    
    // Check if user has any of the required permissions
    return requiredPermissions.some(permission => permissions.has(permission));
  }, [permissions]);

  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!user || !adminUser) return false;

    // Check local permissions first for efficiency
    if (hasPermission(permission)) {
      return true;
    }

    try {
      // Double-check with the server
      const { data, error } = await supabase
        .rpc('check_admin_permission', {
          user_id: user.id,
          required_permission: permission
        });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  const refreshAdminData = async () => {
    await loadAdminData();
    if (adminUser) {
      await logActivity('refreshed', 'admin_data');
    }
  };

  const value = {
    adminUser,
    isAdmin: !!adminUser,
    loading,
    permissions,
    hasPermission,
    hasAnyPermission,
    checkPermission,
    refreshAdminData,
    setAdminUser,
    logActivity,
    getRecentActivity,
    adminLogout,
    sessionExpired,
    setSessionExpired,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
