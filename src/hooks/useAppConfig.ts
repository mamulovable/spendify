import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appConfigService } from '@/services/appConfigService';
import { AppConfig, ConfigHistoryEntry } from '@/types/appConfig';
import { toast } from '@/components/ui/use-toast';

export const useAppConfig = () => {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>('System Limits');
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  
  // Get all configuration categories
  const configCategories = appConfigService.getConfigCategories();
  
  // Get all app configurations
  const {
    data: appConfigs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['appConfigs'],
    queryFn: () => appConfigService.getAppConfigs(),
  });
  
  // Get configuration history
  const {
    data: configHistory,
    isLoading: isLoadingHistory,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['configHistory', selectedConfig],
    queryFn: () => selectedConfig ? appConfigService.getConfigHistory(selectedConfig) : Promise.resolve([]),
    enabled: !!selectedConfig,
  });
  
  // Update app configuration
  const updateAppConfigMutation = useMutation({
    mutationFn: ({ configKey, configValue }: { configKey: string; configValue: any }) => 
      appConfigService.updateAppConfig(configKey, configValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appConfigs'] });
      if (selectedConfig) {
        queryClient.invalidateQueries({ queryKey: ['configHistory', selectedConfig] });
      }
      toast({
        title: 'Configuration updated',
        description: 'The configuration has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating configuration',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get app configuration by key
  const getAppConfigByKey = (configKey: string): AppConfig | undefined => {
    return appConfigs?.find(config => config.configKey === configKey);
  };
  
  // Get configuration definition by key
  const getConfigDefinition = (configKey: string) => {
    for (const category of configCategories) {
      const config = category.configs.find(c => c.key === configKey);
      if (config) {
        return config;
      }
    }
    return undefined;
  };
  
  return {
    configCategories,
    appConfigs,
    configHistory,
    isLoading,
    isLoadingHistory,
    error,
    refetch,
    refetchHistory,
    activeCategory,
    setActiveCategory,
    selectedConfig,
    setSelectedConfig,
    updateAppConfig: updateAppConfigMutation.mutate,
    isUpdating: updateAppConfigMutation.isPending,
    getAppConfigByKey,
    getConfigDefinition,
  };
};