import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminUser, AdminRole } from '@/types/adminUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Schema for admin user form
const adminUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional()
    .refine(val => val === undefined || val.length >= 8, {
      message: 'Password must be at least 8 characters',
    }),
  roleId: z.string().uuid({ message: 'Please select a role' }),
  isActive: z.boolean().default(true),
});

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminUser?: AdminUser;
  roles: AdminRole[];
  onSave: (data: z.infer<typeof adminUserSchema>) => void;
  isSubmitting: boolean;
}

export function AdminUserDialog({
  open,
  onOpenChange,
  adminUser,
  roles,
  onSave,
  isSubmitting,
}: AdminUserDialogProps) {
  const isEditing = !!adminUser;
  
  // Create form with validation
  const form = useForm<z.infer<typeof adminUserSchema>>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      roleId: '',
      isActive: true,
    },
  });
  
  // Update form values when editing an existing user
  useEffect(() => {
    if (adminUser) {
      form.reset({
        email: adminUser.email,
        fullName: adminUser.fullName,
        password: undefined, // Don't set password when editing
        roleId: adminUser.roleId,
        isActive: adminUser.isActive,
      });
    } else {
      form.reset({
        email: '',
        fullName: '',
        password: '',
        roleId: '',
        isActive: true,
      });
    }
  }, [adminUser, form]);
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof adminUserSchema>) => {
    onSave(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Admin User' : 'Create Admin User'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the admin user details'
              : 'Create a new admin user with appropriate permissions'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? 'New Password (optional)' : 'Password'}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {isEditing
                      ? 'Leave blank to keep the current password'
                      : 'Password must be at least 8 characters'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isEditing && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Disable to prevent this user from logging in
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}