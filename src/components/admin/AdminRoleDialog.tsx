import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminRole, AVAILABLE_PERMISSIONS, Permission } from '@/types/adminUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Schema for admin role form
const adminRoleSchema = z.object({
  name: z.string().min(3, { message: 'Role name must be at least 3 characters' }),
  description: z.string().optional(),
  permissions: z.record(z.boolean()).default({}),
});

interface AdminRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminRole?: AdminRole;
  onSave: (data: z.infer<typeof adminRoleSchema>) => void;
  isSubmitting: boolean;
}

export function AdminRoleDialog({
  open,
  onOpenChange,
  adminRole,
  onSave,
  isSubmitting,
}: AdminRoleDialogProps) {
  const isEditing = !!adminRole;
  
  // Group permissions by category
  const permissionsByCategory = AVAILABLE_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  // Create form with validation
  const form = useForm<z.infer<typeof adminRoleSchema>>({
    resolver: zodResolver(adminRoleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: {},
    },
  });
  
  // Update form values when editing an existing role
  useEffect(() => {
    if (adminRole) {
      form.reset({
        name: adminRole.name,
        description: adminRole.description || '',
        permissions: adminRole.permissions,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        permissions: {},
      });
    }
  }, [adminRole, form]);
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof adminRoleSchema>) => {
    onSave(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Admin Role' : 'Create Admin Role'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the admin role details and permissions'
              : 'Create a new admin role with appropriate permissions'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Role description"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Permissions</h3>
              <p className="text-sm text-gray-500">
                Select the permissions for this role
              </p>
              
              <Accordion type="multiple" className="w-full">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-base font-medium">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {permissions.map((permission) => (
                          <FormField
                            key={permission.key}
                            control={form.control}
                            name={`permissions.${permission.key}`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    {permission.label}
                                  </FormLabel>
                                  <FormDescription>
                                    {permission.description}
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
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