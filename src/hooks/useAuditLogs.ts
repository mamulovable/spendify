import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auditLogService } from '@/services/auditLogService';
import { AuditLogFilters } from '@/types/auditLog';
import { toast } from '@/components/ui/use-toast';

export const useAuditLogs = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
  // Get audit logs with pagination and filtering
  const {
    data: auditLogsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['auditLogs', filters, page, pageSize],
    queryFn: () => auditLogService.getAuditLogs(filters, page, pageSize),
  });
  
  // Get audit log details
  const {
    data: selectedLog,
    isLoading: isLoadingDetails,
  } = useQuery({
    queryKey: ['auditLogDetails', selectedLogId],
    queryFn: () => selectedLogId ? auditLogService.getAuditLogDetails(selectedLogId) : null,
    enabled: !!selectedLogId,
  });
  
  // Get filter options
  const {
    data: actionTypes,
    isLoading: isLoadingActionTypes,
  } = useQuery({
    queryKey: ['auditLogActionTypes'],
    queryFn: () => auditLogService.getActionTypes(),
  });
  
  const {
    data: entityTypes,
    isLoading: isLoadingEntityTypes,
  } = useQuery({
    queryKey: ['auditLogEntityTypes'],
    queryFn: () => auditLogService.getEntityTypes(),
  });
  
  const {
    data: adminUsers,
    isLoading: isLoadingAdminUsers,
  } = useQuery({
    queryKey: ['auditLogAdminUsers'],
    queryFn: () => auditLogService.getAdminUsers(),
  });
  
  // Export audit logs
  const exportLogs = async () => {
    try {
      const csvContent = await auditLogService.exportAuditLogs(filters);
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export successful',
        description: 'Audit logs have been exported to CSV.',
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export audit logs',
        variant: 'destructive',
      });
    }
  };
  
  return {
    auditLogs: auditLogsData?.logs || [],
    totalLogs: auditLogsData?.total || 0,
    isLoading,
    error,
    refetch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    selectedLogId,
    setSelectedLogId,
    selectedLog,
    isLoadingDetails,
    actionTypes: actionTypes || [],
    entityTypes: entityTypes || [],
    adminUsers: adminUsers || [],
    isLoadingFilterOptions: isLoadingActionTypes || isLoadingEntityTypes || isLoadingAdminUsers,
    exportLogs,
  };
};