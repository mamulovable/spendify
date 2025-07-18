import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '@/services/adminUserService';
import { AdminUser, AdminRole, AdminUserFormData, AdminRoleFormData } from '@/types/adminUser';
import { toast } from '@/components/ui/use-toast';

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  
  // Get all admin users
  const {
    data: adminUsers,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminUserService.getAdminUsers(),
  });
  
  // Get all admin roles
  const {
    data: adminRoles,
    isLoading: isLoadingRoles,
    error: rolesError,
    refetch: refetchRoles
  } = useQuery({
    queryKey: ['adminRoles'],
    queryFn: () => adminUserService.getAdminRoles(),
  });
  
  // Create admin user
  const createAdminUserMutation = useMutation({
    mutationFn: (userData: AdminUserFormData) => adminUserService.createAdminUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Admin user created',
        description: 'The admin user has been created successfully.',
      });
      setIsCreatingUser(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating admin user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update admin user
  const updateAdminUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUserFormData }) => 
      adminUserService.updateAdminUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Admin user updated',
        description: 'The admin user has been updated successfully.',
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating admin user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete admin user
  const deleteAdminUserMutation = useMutation({
    mutationFn: (id: string) => adminUserService.deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast({
        title: 'Admin user deleted',
        description: 'The admin user has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting admin user',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Create admin role
  const createAdminRoleMutation = useMutation({
    mutationFn: (roleData: AdminRoleFormData) => adminUserService.createAdminRole(roleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({
        title: 'Admin role created',
        description: 'The admin role has been created successfully.',
      });
      setIsCreatingRole(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating admin role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update admin role
  const updateAdminRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminRoleFormData }) => 
      adminUserService.updateAdminRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({
        title: 'Admin role updated',
        description: 'The admin role has been updated successfully.',
      });
      setEditingRole(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating admin role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete admin role
  const deleteAdminRoleMutation = useMutation({
    mutationFn: (id: string) => adminUserService.deleteAdminRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRoles'] });
      toast({
        title: 'Admin role deleted',
        description: 'The admin role has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting admin role',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    // Admin users
    adminUsers,
    isLoadingUsers,
    usersError,
    refetchUsers,
    isCreatingUser,
    setIsCreatingUser,
    editingUser,
    setEditingUser,
    createAdminUser: createAdminUserMutation.mutate,
    updateAdminUser: updateAdminUserMutation.mutate,
    deleteAdminUser: deleteAdminUserMutation.mutate,
    isCreatingUserMutation: createAdminUserMutation.isPending,
    isUpdatingUser: updateAdminUserMutation.isPending,
    isDeletingUser: deleteAdminUserMutation.isPending,
    
    // Admin roles
    adminRoles,
    isLoadingRoles,
    rolesError,
    refetchRoles,
    isCreatingRole,
    setIsCreatingRole,
    editingRole,
    setEditingRole,
    createAdminRole: createAdminRoleMutation.mutate,
    updateAdminRole: updateAdminRoleMutation.mutate,
    deleteAdminRole: deleteAdminRoleMutation.mutate,
    isCreatingRoleMutation: createAdminRoleMutation.isPending,
    isUpdatingRole: updateAdminRoleMutation.isPending,
    isDeletingRole: deleteAdminRoleMutation.isPending,
  };
};