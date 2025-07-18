import { useState } from 'react';
import { FeatureFlag } from '@/types/featureFlag';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeatureFlagDialog } from './FeatureFlagDialog';

export function FeatureFlagsTable() {
  const { 
    featureFlags, 
    isLoading, 
    toggleFeatureFlag, 
    isToggling,
    deleteFeatureFlag
  } = useFeatureFlags();
  
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [flagToDelete, setFlagToDelete] = useState<string | null>(null);

  const handleToggle = (flag: FeatureFlag) => {
    toggleFeatureFlag({ 
      flagName: flag.name, 
      enabled: !flag.enabled 
    });
  };

  const handleEdit = (flag: FeatureFlag) => {
    setEditingFlag(flag);
  };

  const handleDelete = (id: string) => {
    deleteFeatureFlag(id);
    setFlagToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const confirmDelete = (id: string) => {
    setFlagToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading feature flags...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>User %</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {featureFlags?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No feature flags found. Create your first feature flag to get started.
              </TableCell>
            </TableRow>
          ) : (
            featureFlags?.map((flag) => (
              <TableRow key={flag.id}>
                <TableCell className="font-medium">{flag.name}</TableCell>
                <TableCell>{flag.description || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag)}
                      disabled={isToggling}
                    />
                    <span className={flag.enabled ? 'text-green-600' : 'text-gray-500'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{flag.user_percentage !== null ? `${flag.user_percentage}%` : '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {flag.allowed_plans?.map((plan) => (
                      <Badge key={plan} variant="outline">
                        {plan}
                      </Badge>
                    )) || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true })}
                    </span>
                    {flag.last_updated_by_name && (
                      <span className="text-xs text-gray-500">by {flag.last_updated_by_name}</span>
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
                      <DropdownMenuItem onClick={() => handleEdit(flag)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => confirmDelete(flag.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingFlag && (
        <FeatureFlagDialog
          open={!!editingFlag}
          onOpenChange={() => setEditingFlag(null)}
          featureFlag={editingFlag}
          mode="edit"
        />
      )}

      {isDeleteDialogOpen && flagToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium">Delete Feature Flag</h3>
            <p className="mt-2">
              Are you sure you want to delete this feature flag? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFlagToDelete(null);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(flagToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}