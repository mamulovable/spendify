import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featureFlagService } from '@/services/featureFlagService';
import { FeatureFlag, FeatureFlagFormData } from '@/types/featureFlag';
import { toast } from '@/components/ui/use-toast';

export const useFeatureFlags = () => {
  const queryClient = useQueryClient();
  const [isCreatingFlag, setIsCreatingFlag] = useState(false);
  
  const {
    data: featureFlags,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['featureFlags'],
    queryFn: () => featureFlagService.getFeatureFlags(),
  });
  
  const createFeatureFlagMutation = useMutation({
    mutationFn: (flagData: FeatureFlagFormData) => featureFlagService.createFeatureFlag(flagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      toast({
        title: 'Feature flag created',
        description: 'The feature flag has been created successfully.',
      });
      setIsCreatingFlag(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating feature flag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const toggleFeatureFlagMutation = useMutation({
    mutationFn: ({ flagName, enabled }: { flagName: string; enabled: boolean }) => 
      featureFlagService.toggleFeatureFlag(flagName, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      toast({
        title: `Feature flag ${variables.enabled ? 'enabled' : 'disabled'}`,
        description: `The feature flag has been ${variables.enabled ? 'enabled' : 'disabled'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error toggling feature flag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateFeatureFlagMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FeatureFlagFormData> }) => 
      featureFlagService.updateFeatureFlag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      toast({
        title: 'Feature flag updated',
        description: 'The feature flag has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating feature flag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteFeatureFlagMutation = useMutation({
    mutationFn: (id: string) => featureFlagService.deleteFeatureFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      toast({
        title: 'Feature flag deleted',
        description: 'The feature flag has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting feature flag',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    featureFlags,
    isLoading,
    error,
    refetch,
    isCreatingFlag,
    setIsCreatingFlag,
    createFeatureFlag: createFeatureFlagMutation.mutate,
    toggleFeatureFlag: toggleFeatureFlagMutation.mutate,
    updateFeatureFlag: updateFeatureFlagMutation.mutate,
    deleteFeatureFlag: deleteFeatureFlagMutation.mutate,
    isCreating: createFeatureFlagMutation.isPending,
    isToggling: toggleFeatureFlagMutation.isPending,
    isUpdating: updateFeatureFlagMutation.isPending,
    isDeleting: deleteFeatureFlagMutation.isPending,
  };
};