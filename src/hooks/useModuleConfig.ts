import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleConfigService } from '@/services/moduleConfigService';
import { ModuleConfig, ModuleConfigFormData, ModuleDefinition } from '@/types/moduleConfig';
import { toast } from '@/components/ui/use-toast';

export const useModuleConfig = () => {
  const queryClient = useQueryClient();
  const [isEditingModule, setIsEditingModule] = useState<string | null>(null);
  
  // Get all module definitions
  const moduleDefinitions = moduleConfigService.getModuleDefinitions();
  
  // Get all module configurations
  const {
    data: moduleConfigs,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['moduleConfigs'],
    queryFn: () => moduleConfigService.getModuleConfigs(),
  });
  
  // Save module configuration
  const saveModuleConfigMutation = useMutation({
    mutationFn: ({ moduleId, configData }: { moduleId: string; configData: ModuleConfigFormData }) => 
      moduleConfigService.saveModuleConfig(moduleId, configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moduleConfigs'] });
      toast({
        title: 'Module configuration saved',
        description: 'The module configuration has been saved successfully.',
      });
      setIsEditingModule(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving module configuration',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle module enabled status
  const toggleModuleEnabledMutation = useMutation({
    mutationFn: ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => 
      moduleConfigService.toggleModuleEnabled(moduleId, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['moduleConfigs'] });
      toast({
        title: `Module ${variables.enabled ? 'enabled' : 'disabled'}`,
        description: `The module has been ${variables.enabled ? 'enabled' : 'disabled'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error toggling module',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Get module definition by ID
  const getModuleDefinition = (moduleId: string): ModuleDefinition | undefined => {
    return moduleDefinitions.find(def => def.id === moduleId);
  };
  
  // Get module configuration by ID
  const getModuleConfig = (moduleId: string): ModuleConfig | undefined => {
    return moduleConfigs?.find(config => config.id === moduleId);
  };
  
  // Merge module definition with configuration
  const getMergedModuleData = (moduleId: string) => {
    const definition = getModuleDefinition(moduleId);
    const config = getModuleConfig(moduleId);
    
    if (!definition) return null;
    
    // If no configuration exists, create a default one based on the definition
    if (!config) {
      return {
        ...definition,
        enabled: false,
        requiredPlan: [],
        settings: definition.settings.reduce((acc, setting) => {
          acc[setting.key] = setting.defaultValue;
          return acc;
        }, {} as Record<string, any>),
        lastUpdatedBy: null,
        updatedAt: new Date().toISOString(),
      };
    }
    
    // Merge existing configuration with definition
    return {
      ...definition,
      enabled: config.enabled,
      requiredPlan: config.requiredPlan,
      settings: config.settings,
      lastUpdatedBy: config.lastUpdatedBy,
      updatedAt: config.updatedAt,
    };
  };
  
  return {
    moduleDefinitions,
    moduleConfigs,
    isLoading,
    error,
    refetch,
    isEditingModule,
    setIsEditingModule,
    saveModuleConfig: saveModuleConfigMutation.mutate,
    toggleModuleEnabled: toggleModuleEnabledMutation.mutate,
    getModuleDefinition,
    getModuleConfig,
    getMergedModuleData,
    isSaving: saveModuleConfigMutation.isPending,
    isToggling: toggleModuleEnabledMutation.isPending,
  };
};