import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import type { AdminUser, AdminRole, AdminPermission } from '@/types/admin';

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  permissions: Set<string>;
  hasPermission: (permission: string) => boolean;
  checkPermission: (permission: string) => Promise<boolean>;
  refreshAdminData: () => Promise<void>;
  setAdminUser: (user: AdminUser | null) => void;
  logActivity: (action: string, resource: string, details?: Record<string, any>) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const logActivity = async (action: string, resource: string, details?: Record<string, any>) => {
    if (!adminUser) return;

    try {
      const { error } = await supabase.from('admin_activity_logs').insert({
        admin_user_id: adminUser.id,
        action,
        resource,
        details,
        ip_address: window.location.hostname, // In a real app, get from server
        user_agent: navigator.userAgent,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to log admin activity:', err);
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
      // Fetch admin user data
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select(`
          *,
          role:admin_roles (
            *,
            permissions:role_permissions (
              permission:admin_permissions (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      if (adminData) {
        setAdminUser(adminData);
        
        // Extract permissions
        const permissionSet = new Set<string>();
        if (adminData.role?.permissions) {
          adminData.role.permissions.forEach((rp: any) => {
            if (rp.permission) {
              permissionSet.add(rp.permission.name);
            }
          });
        }
        setPermissions(permissionSet);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.has(permission);
  };

  const checkPermission = async (permission: string): Promise<boolean> => {
    if (!user || !adminUser) return false;

    try {
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
    await logActivity('refreshed', 'admin_data');
  };

  const value = {
    adminUser,
    isAdmin: !!adminUser,
    loading,
    permissions,
    hasPermission,
    checkPermission,
    refreshAdminData,
    setAdminUser,
    logActivity,
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
