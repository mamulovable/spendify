import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentProcessingService } from '@/services/documentProcessingService';
import type { 
  DocumentQueueItem, 
  DocumentQueueFilter, 
  DocumentProcessingResult,
  DocumentMetadata,
  BatchActionParams
} from '@/types/documentProcessing';
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '@/contexts/AdminContext';

export function useDocumentQueue(filters: DocumentQueueFilter = {}) {
  const { toast } = useToast();
  const { logActivity } = useAdmin();
  const queryClient = useQueryClient();
  
  // Fetch document queue
  const {
    data: queueItems,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['document-queue', filters],
    queryFn: () => documentProcessingService.getQueueItems(filters),
  });
  
  // Fetch queue counts
  const {
    data: queueCounts,
    isLoading: isLoadingCounts,
  } = useQuery({
    queryKey: ['document-queue-counts'],
    queryFn: () => documentProcessingService.getQueueCountByStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Reprocess document mutation
  const reprocessMutation = useMutation({
    mutationFn: (documentId: string) => documentProcessingService.reprocessDocument(documentId),
    onSuccess: async (_, documentId) => {
      toast({
        title: 'Document Reprocessing Started',
        description: 'The document has been queued for reprocessing.',
      });
      
      await logActivity('reprocess_document', 'document', { document_id: documentId });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['document-queue'] });
      queryClient.invalidateQueries({ queryKey: ['document-queue-counts'] });
    },
    onError: (error) => {
      toast({
        title: 'Reprocessing Failed',
        description: `Failed to reprocess document: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Manually tag document mutation
  const tagDocumentMutation = useMutation({
    mutationFn: ({ documentId, metadata }: { documentId: string, metadata: DocumentMetadata }) => 
      documentProcessingService.manuallyTagDocument(documentId, metadata),
    onSuccess: async (_, { documentId }) => {
      toast({
        title: 'Document Tagged',
        description: 'The document has been manually tagged.',
      });
      
      await logActivity('tag_document', 'document', { document_id: documentId });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['document-queue'] });
      queryClient.invalidateQueries({ queryKey: ['document-result'] });
    },
    onError: (error) => {
      toast({
        title: 'Tagging Failed',
        description: `Failed to tag document: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  // Batch action mutation
  const batchActionMutation = useMutation({
    mutationFn: async (params: BatchActionParams) => {
      const { documentIds, action, metadata } = params;
      
      if (action === 'reprocess') {
        // Process documents one by one
        const results = await Promise.all(
          documentIds.map(id => documentProcessingService.reprocessDocument(id))
        );
        return results;
      } else if (action === 'tag' && metadata) {
        // Tag documents one by one
        const results = await Promise.all(
          documentIds.map(id => documentProcessingService.manuallyTagDocument(id, metadata))
        );
        return results;
      }
      
      throw new Error('Invalid batch action');
    },
    onSuccess: async (_, params) => {
      const { documentIds, action } = params;
      
      toast({
        title: 'Batch Action Completed',
        description: `Successfully performed ${action} on ${documentIds.length} documents.`,
      });
      
      await logActivity('batch_action', 'documents', { 
        action, 
        document_count: documentIds.length 
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['document-queue'] });
      queryClient.invalidateQueries({ queryKey: ['document-queue-counts'] });
    },
    onError: (error) => {
      toast({
        title: 'Batch Action Failed',
        description: `Failed to perform batch action: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    queueItems,
    queueCounts,
    isLoading: isLoading || isLoadingCounts,
    error,
    refetch,
    reprocessDocument: reprocessMutation.mutate,
    isReprocessing: reprocessMutation.isPending,
    tagDocument: tagDocumentMutation.mutate,
    isTagging: tagDocumentMutation.isPending,
    performBatchAction: batchActionMutation.mutate,
    isBatchProcessing: batchActionMutation.isPending,
  };
}

export function useDocumentDetail(documentId: string | undefined) {
  const [document, setDocument] = useState<any>(null);
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);
  
  // Fetch document result
  const {
    data: documentResult,
    isLoading: isLoadingResult,
    error: resultError,
    refetch: refetchResult
  } = useQuery({
    queryKey: ['document-result', documentId],
    queryFn: () => documentId ? documentProcessingService.getDocumentResult(documentId) : null,
    enabled: !!documentId,
  });
  
  // Fetch document details and history
  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return;
    
    try {
      const [docData, historyData] = await Promise.all([
        documentProcessingService.getDocumentById(documentId),
        documentProcessingService.getDocumentHistory(documentId)
      ]);
      
      setDocument(docData);
      setProcessingHistory(historyData);
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  }, [documentId]);
  
  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);
  
  return {
    document,
    processingHistory,
    documentResult,
    isLoading: isLoadingResult || !document,
    error: resultError,
    refetch: () => {
      fetchDocumentDetails();
      refetchResult();
    }
  };
}

export function useAIModels() {
  // Fetch AI model versions
  const {
    data: modelVersions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ai-models'],
    queryFn: () => documentProcessingService.getAIModelVersions(),
  });
  
  // Fetch active AI model
  const {
    data: activeModel,
    isLoading: isLoadingActive,
  } = useQuery({
    queryKey: ['active-ai-model'],
    queryFn: () => documentProcessingService.getActiveAIModel(),
  });
  
  return {
    modelVersions,
    activeModel,
    isLoading: isLoading || isLoadingActive,
    error,
    refetch,
  };
}

export function useProcessingMetrics(days: number = 7) {
  // Fetch processing metrics
  const {
    data: metrics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['processing-metrics', days],
    queryFn: () => documentProcessingService.getProcessingMetrics(days),
  });
  
  return {
    metrics,
    isLoading,
    error,
    refetch,
  };
}