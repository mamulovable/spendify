import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityService } from '@/services/securityService';
import { SecurityAlertFilters } from '@/types/security';
import { toast } from '@/components/ui/use-toast';

export const useSecurity = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SecurityAlertFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30); // Days for metrics
  
  // Get security alerts with pagination and filtering
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['securityAlerts', filters, page, pageSize],
    queryFn: () => securityService.getSecurityAlerts(filters, page, pageSize),
  });
  
  // Get security alert details
  const {
    data: selectedAlert,
    isLoading: isLoadingAlertDetails,
  } = useQuery({
    queryKey: ['securityAlertDetails', selectedAlertId],
    queryFn: () => selectedAlertId ? securityService.getSecurityAlertDetails(selectedAlertId) : null,
    enabled: !!selectedAlertId,
  });
  
  // Get security metrics
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['securityMetrics', timeRange],
    queryFn: () => securityService.getSecurityMetrics(timeRange),
  });
  
  // Get security settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['securitySettings'],
    queryFn: () => securityService.getSecuritySettings(),
  });
  
  // Resolve security alert
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => securityService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securityAlerts'] });
      queryClient.invalidateQueries({ queryKey: ['securityMetrics'] });
      if (selectedAlertId) {
        queryClient.invalidateQueries({ queryKey: ['securityAlertDetails', selectedAlertId] });
      }
      toast({
        title: 'Alert resolved',
        description: 'The security alert has been marked as resolved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error resolving alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update security settings
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: typeof settings) => {
      if (!newSettings) {
        throw new Error('Settings not available');
      }
      return securityService.updateSecuritySettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
      toast({
        title: 'Settings updated',
        description: 'Security settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    // Alerts
    alerts: alertsData?.alerts || [],
    totalAlerts: alertsData?.total || 0,
    isLoadingAlerts,
    alertsError,
    refetchAlerts,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    selectedAlertId,
    setSelectedAlertId,
    selectedAlert,
    isLoadingAlertDetails,
    resolveAlert: resolveAlertMutation.mutate,
    isResolvingAlert: resolveAlertMutation.isPending,
    
    // Metrics
    metrics,
    isLoadingMetrics,
    refetchMetrics,
    timeRange,
    setTimeRange,
    
    // Settings
    settings,
    isLoadingSettings,
    refetchSettings,
    updateSettings: updateSettingsMutation.mutate,
    isUpdatingSettings: updateSettingsMutation.isPending,
  };
};