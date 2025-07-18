import { supabase } from '@/lib/supabase';
import { AdminUser, AdminRole, AdminUserFormData, AdminRoleFormData } from '@/types/adminUser';

export const adminUserService = {
  // Get all admin users
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        admin_roles(name),
        created_by_user:admin_users!admin_users_created_by_fkey(full_name)
      `)
      .order('full_name');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      email: item.email,
      fullName: item.full_name,
      roleId: item.role_id,
      roleName: item.admin_roles?.name,
      isActive: item.is_active,
      lastLoginAt: item.last_login_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      createdByName: item.created_by_user?.full_name
    })) || [];
  },
  
  // Get a specific admin user
  async getAdminUser(id: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        admin_roles(name),
        created_by_user:admin_users!admin_users_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching admin user ${id}:`, error);
      throw new Error(`Failed to fetch admin user: ${error.message}`);
    }
    
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      roleId: data.role_id,
      roleName: data.admin_roles?.name,
      isActive: data.is_active,
      lastLoginAt: data.last_login_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by,
      createdByName: data.created_by_user?.full_name
    };
  },
  
  // Create a new admin user
  async createAdminUser(userData: AdminUserFormData): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userData.password) {
      throw new Error('Password is required when creating a new admin user');
    }
    
    const { data, error } = await supabase.rpc('create_admin_user', {
      email: userData.email,
      full_name: userData.fullName,
      password: userData.password,
      role_id: userData.roleId,
      created_by: userId
    });
    
    if (error) {
      console.error('Error creating admin user:', error);
      throw new Error(`Failed to create admin user: ${error.message}`);
    }
    
    return data;
  },
  
  // Update an existing admin user
  async updateAdminUser(id: string, userData: AdminUserFormData): Promise<void> {
    const updateData: any = {
      email: userData.email,
      full_name: userData.fullName,
      role_id: userData.roleId,
      is_active: userData.isActive
    };
    
    // Only update password if provided
    if (userData.password) {
      // In a real implementation, you would use a secure method to update the password
      // For now, we'll use a direct update which isn't ideal
      const { error: passwordError } = await supabase.rpc('update_admin_password', {
        admin_id: id,
        new_password: userData.password
      });
      
      if (passwordError) {
        console.error(`Error updating admin user password ${id}:`, passwordError);
        throw new Error(`Failed to update admin user password: ${passwordError.message}`);
      }
    }
    
    const { error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating admin user ${id}:`, error);
      throw new Error(`Failed to update admin user: ${error.message}`);
    }
  },
  
  // Delete an admin user
  async deleteAdminUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting admin user ${id}:`, error);
      throw new Error(`Failed to delete admin user: ${error.message}`);
    }
  },
  
  // Get all admin roles
  async getAdminRoles(): Promise<AdminRole[]> {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching admin roles:', error);
      throw new Error(`Failed to fetch admin roles: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      permissions: item.permissions,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
  },
  
  // Get a specific admin role
  async getAdminRole(id: string): Promise<AdminRole | null> {
    const { data, error } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching admin role ${id}:`, error);
      throw new Error(`Failed to fetch admin role: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  // Create a new admin role
  async createAdminRole(roleData: AdminRoleFormData): Promise<string> {
    const { data, error } = await supabase
      .from('admin_roles')
      .insert({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error creating admin role:', error);
      throw new Error(`Failed to create admin role: ${error.message}`);
    }
    
    return data.id;
  },
  
  // Update an existing admin role
  async updateAdminRole(id: string, roleData: AdminRoleFormData): Promise<void> {
    const { error } = await supabase
      .from('admin_roles')
      .update({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating admin role ${id}:`, error);
      throw new Error(`Failed to update admin role: ${error.message}`);
    }
  },
  
  // Delete an admin role
  async deleteAdminRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_roles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting admin role ${id}:`, error);
      throw new Error(`Failed to delete admin role: ${error.message}`);
    }
  }
};