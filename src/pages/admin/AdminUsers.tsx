import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { AdminUserDialog } from '@/components/admin/AdminUserDialog';
import { AdminRoleDialog } from '@/components/admin/AdminRoleDialog';
import { AdminUser, AdminRole, AdminUserFormData, AdminRoleFormData } from '@/types/adminUser';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, UserPlus, ShieldPlus } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function AdminUsers() {
  const {
    // Admin users
    adminUsers,
    isLoadingUsers,
    isCreatingUser,
    setIsCreatingUser,
    editingUser,
    setEditingUser,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    isCreatingUserMutation,
    isUpdatingUser,
    isDeletingUser,
    
    // Admin roles
    adminRoles,
    isLoadingRoles,
    isCreatingRole,
    setIsCreatingRole,
    editingRole,
    setEditingRole,
    createAdminRole,
    updateAdminRole,
    deleteAdminRole,
    isCreatingRoleMutation,
    isUpdatingRole,
    isDeletingRole,
  } = useAdminUsers();
  
  const [activeTab, setActiveTab] = useState('users');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  
  // Handle admin user operations
  const handleCreateUser = (data: AdminUserFormData) => {
    createAdminUser(data);
  };
  
  const handleUpdateUser = (data: AdminUserFormData) => {
    if (editingUser) {
      updateAdminUser({ id: editingUser.id, data });
    }
  };
  
  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteAdminUser(userToDelete);
      setUserToDelete(null);
    }
  };
  
  // Handle admin role operations
  const handleCreateRole = (data: AdminRoleFormData) => {
    createAdminRole(data);
  };
  
  const handleUpdateRole = (data: AdminRoleFormData) => {
    if (editingRole) {
      updateAdminRole({ id: editingRole.id, data });
    }
  };
  
  const handleDeleteRole = () => {
    if (roleToDelete) {
      deleteAdminRole(roleToDelete);
      setRoleToDelete(null);
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground">
            Manage admin users and roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreatingUser(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Admin User
          </Button>
          <Button variant="outline" onClick={() => setIsCreatingRole(true)}>
            <ShieldPlus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Admin Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage administrator accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="text-center py-4">Loading admin users...</div>
              ) : adminUsers?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No admin users found. Create your first admin user to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.roleName}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'success' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLoginAt ? (
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </span>
                            {user.createdByName && (
                              <span className="text-xs text-gray-500">
                                by {user.createdByName}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setUserToDelete(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage admin roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="text-center py-4">Loading admin roles...</div>
              ) : adminRoles?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No admin roles found. Create your first role to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminRoles?.map((role) => {
                      const permissionCount = Object.values(role.permissions).filter(Boolean).length;
                      const userCount = adminUsers?.filter(user => user.roleId === role.id).length || 0;
                      
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.description || '-'}</TableCell>
                          <TableCell>
                            <Badge>{permissionCount} permissions</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{userCount} users</Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingRole(role)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setRoleToDelete(role.id)}
                                  className="text-red-600"
                                  disabled={userCount > 0}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Admin User Dialog */}
      {(isCreatingUser || editingUser) && (
        <AdminUserDialog
          open={isCreatingUser || !!editingUser}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreatingUser(false);
              setEditingUser(null);
            }
          }}
          adminUser={editingUser || undefined}
          roles={adminRoles || []}
          onSave={editingUser ? handleUpdateUser : handleCreateUser}
          isSubmitting={isCreatingUserMutation || isUpdatingUser}
        />
      )}
      
      {/* Admin Role Dialog */}
      {(isCreatingRole || editingRole) && (
        <AdminRoleDialog
          open={isCreatingRole || !!editingRole}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreatingRole(false);
              setEditingRole(null);
            }
          }}
          adminRole={editingRole || undefined}
          onSave={editingRole ? handleUpdateRole : handleCreateRole}
          isSubmitting={isCreatingRoleMutation || isUpdatingRole}
        />
      )}
      
      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this admin user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Role Confirmation Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}