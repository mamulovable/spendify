import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ban, Eye, MoreHorizontal, Shield, Trash2, CreditCard, Edit } from 'lucide-react';

interface User {
  id: string;
  email: string;
  is_suspended: boolean;
  plan_type: string;
}

interface UserActionControlsProps {
  user: User;
  variant?: 'dropdown' | 'buttons' | 'inline';
  size?: 'sm' | 'default';
  onActionComplete?: () => void;
  showViewAction?: boolean;
  showEditAction?: boolean;
  showSuspendAction?: boolean;
  showDeleteAction?: boolean;
  showUpgradeAction?: boolean;
}

export function UserActionControls({
  user,
  variant = 'dropdown',
  size = 'default',
  onActionComplete,
  showViewAction = true,
  showEditAction = true,
  showSuspendAction = true,
  showDeleteAction = true,
  showUpgradeAction = true,
}: UserActionControlsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(user.plan_type || 'free');
  
  // Handle view user
  const handleViewUser = () => {
    navigate(`/admin/users/${user.id}`);
  };
  
  // Handle edit user
  const handleEditUser = () => {
    navigate(`/admin/users/${user.id}/edit`);
  };
  
  // Handle suspend user
  const handleSuspendUser = async () => {
    try {
      await supabase.rpc('suspend_user', {
        user_id: user.id,
        reason: suspendReason,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Suspended',
        description: `${user.email} has been suspended.`,
      });
      
      setShowSuspendDialog(false);
      setSuspendReason('');
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error('Error suspending user:', err);
      toast({
        title: 'Error',
        description: 'Failed to suspend user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle activate user
  const handleActivateUser = async () => {
    try {
      await supabase.rpc('unsuspend_user', {
        user_id: user.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Activated',
        description: `${user.email} has been activated.`,
      });
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error('Error activating user:', err);
      toast({
        title: 'Error',
        description: 'Failed to activate user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await supabase.rpc('delete_user', {
        user_id: user.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'User Deleted',
        description: `${user.email} has been permanently deleted.`,
      });
      
      setShowDeleteDialog(false);
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle upgrade user
  const handleUpgradeUser = async () => {
    try {
      await supabase.rpc('upgrade_user_plan', {
        user_id: user.id,
        new_plan: selectedPlan,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      toast({
        title: 'Plan Updated',
        description: `${user.email}'s plan has been updated to ${selectedPlan}.`,
      });
      
      setShowUpgradeDialog(false);
      
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (err) {
      console.error('Error upgrading user plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user plan. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Dropdown menu variant
  if (variant === 'dropdown') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size === 'sm' ? 'icon' : 'default'}>
              {size === 'sm' ? (
                <MoreHorizontal className="h-4 w-4" />
              ) : (
                <>Actions <MoreHorizontal className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showViewAction && (
              <DropdownMenuItem onClick={handleViewUser}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            
            {showEditAction && (
              <DropdownMenuItem onClick={handleEditUser}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
            )}
            
            {showUpgradeAction && (
              <DropdownMenuItem onClick={() => setShowUpgradeDialog(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Change Plan
              </DropdownMenuItem>
            )}
            
            {showSuspendAction && (
              <>
                <DropdownMenuSeparator />
                {user.is_suspended ? (
                  <DropdownMenuItem onClick={handleActivateUser}>
                    <Shield className="mr-2 h-4 w-4" />
                    Activate User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend User
                  </DropdownMenuItem>
                )}
              </>
            )}
            
            {showDeleteAction && (
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Dialogs */}
        <SuspendDialog 
          open={showSuspendDialog} 
          onOpenChange={setShowSuspendDialog}
          email={user.email}
          reason={suspendReason}
          onReasonChange={setSuspendReason}
          onConfirm={handleSuspendUser}
        />
        
        <DeleteDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
          email={user.email}
          onConfirm={handleDeleteUser}
        />
        
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog}
          email={user.email}
          currentPlan={user.plan_type}
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          onConfirm={handleUpgradeUser}
        />
      </>
    );
  }
  
  // Buttons variant
  if (variant === 'buttons') {
    return (
      <>
        <div className="flex items-center space-x-2">
          {showViewAction && (
            <Button variant="outline" size={size} onClick={handleViewUser}>
              <Eye className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {size !== 'sm' && "View"}
            </Button>
          )}
          
          {showEditAction && (
            <Button variant="outline" size={size} onClick={handleEditUser}>
              <Edit className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {size !== 'sm' && "Edit"}
            </Button>
          )}
          
          {showUpgradeAction && (
            <Button variant="outline" size={size} onClick={() => setShowUpgradeDialog(true)}>
              <CreditCard className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {size !== 'sm' && "Change Plan"}
            </Button>
          )}
          
          {showSuspendAction && (
            user.is_suspended ? (
              <Button variant="outline" size={size} onClick={handleActivateUser}>
                <Shield className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
                {size !== 'sm' && "Activate"}
              </Button>
            ) : (
              <Button variant="outline" size={size} onClick={() => setShowSuspendDialog(true)}>
                <Ban className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
                {size !== 'sm' && "Suspend"}
              </Button>
            )
          )}
          
          {showDeleteAction && (
            <Button 
              variant="destructive" 
              size={size} 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className={size === 'sm' ? "h-4 w-4" : "mr-2 h-4 w-4"} />
              {size !== 'sm' && "Delete"}
            </Button>
          )}
        </div>
        
        {/* Dialogs */}
        <SuspendDialog 
          open={showSuspendDialog} 
          onOpenChange={setShowSuspendDialog}
          email={user.email}
          reason={suspendReason}
          onReasonChange={setSuspendReason}
          onConfirm={handleSuspendUser}
        />
        
        <DeleteDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
          email={user.email}
          onConfirm={handleDeleteUser}
        />
        
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog}
          email={user.email}
          currentPlan={user.plan_type}
          selectedPlan={selectedPlan}
          onPlanChange={setSelectedPlan}
          onConfirm={handleUpgradeUser}
        />
      </>
    );
  }
  
  // Inline variant
  return (
    <>
      <div className="flex items-center space-x-4">
        {showViewAction && (
          <Button variant="ghost" size="sm" onClick={handleViewUser}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
        )}
        
        {showEditAction && (
          <Button variant="ghost" size="sm" onClick={handleEditUser}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
        
        {showUpgradeAction && (
          <Button variant="ghost" size="sm" onClick={() => setShowUpgradeDialog(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            Change Plan
          </Button>
        )}
        
        {showSuspendAction && (
          user.is_suspended ? (
            <Button variant="ghost" size="sm" onClick={handleActivateUser}>
              <Shield className="mr-2 h-4 w-4" />
              Activate
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowSuspendDialog(true)}>
              <Ban className="mr-2 h-4 w-4" />
              Suspend
            </Button>
          )
        )}
        
        {showDeleteAction && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
      
      {/* Dialogs */}
      <SuspendDialog 
        open={showSuspendDialog} 
        onOpenChange={setShowSuspendDialog}
        email={user.email}
        reason={suspendReason}
        onReasonChange={setSuspendReason}
        onConfirm={handleSuspendUser}
      />
      
      <DeleteDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
        email={user.email}
        onConfirm={handleDeleteUser}
      />
      
      <UpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog}
        email={user.email}
        currentPlan={user.plan_type}
        selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan}
        onConfirm={handleUpgradeUser}
      />
    </>
  );
}

// Suspend Dialog Component
interface SuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

function SuspendDialog({
  open,
  onOpenChange,
  email,
  reason,
  onReasonChange,
  onConfirm
}: SuspendDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend {email}? This will prevent them from accessing the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="suspend-reason">Suspension Reason (optional)</Label>
          <Input
            id="suspend-reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter reason for suspension"
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            <Ban className="mr-2 h-4 w-4" />
            Suspend User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Delete Dialog Component
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onConfirm: () => void;
}

function DeleteDialog({
  open,
  onOpenChange,
  email,
  onConfirm
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {email}? This action cannot be undone and will permanently remove all user data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Upgrade Dialog Component
interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  currentPlan: string;
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  onConfirm: () => void;
}

function UpgradeDialog({
  open,
  onOpenChange,
  email,
  currentPlan,
  selectedPlan,
  onPlanChange,
  onConfirm
}: UpgradeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Update the subscription plan for {email}. Current plan: <strong>{currentPlan || 'Free'}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="plan-select">Select New Plan</Label>
          <Select value={selectedPlan} onValueChange={onPlanChange}>
            <SelectTrigger id="plan-select" className="mt-2">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="ltd_solo">LTD Solo</SelectItem>
              <SelectItem value="ltd_pro">LTD Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            <CreditCard className="mr-2 h-4 w-4" />
            Update Plan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}