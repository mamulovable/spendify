import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiFeedbackService } from '@/services/aiFeedbackService';
import { 
  AIFeedback, 
  AIFeedbackFilters, 
  AIModelVersion, 
  AIPerformanceMetrics,
  AIFeedbackTrend,
  AIFeedbackCategory
} from '@/types/aiFeedback';
import { useAuth } from '@/hooks/useAuth';

export const useAIFeedback = (initialFilters?: AIFeedbackFilters) => {
  const [filters, setFilters] = useState<AIFeedbackFilters>(initialFilters || {});
  const { adminUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch feedback list with filters
  const { 
    data: feedbackList,
    isLoading: isLoadingFeedback,
    error: feedbackError,
    refetch: refetchFeedback
  } = useQuery({
    queryKey: ['ai-feedback', filters],
    queryFn: () => aiFeedbackService.getFeedbackList(filters),
  });
  
  // Fetch performance metrics
  const {
    data: performanceMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['ai-performance-metrics'],
    queryFn: () => aiFeedbackService.getPerformanceMetrics(),
  });
  
  // Fetch feedback trends
  const {
    data: feedbackTrends,
    isLoading: isLoadingTrends,
    error: trendsError
  } = useQuery({
    queryKey: ['ai-feedback-trends'],
    queryFn: () => aiFeedbackService.getFeedbackTrends(30),
  });
  
  // Fetch feedback categories
  const {
    data: feedbackCategories,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['ai-feedback-categories'],
    queryFn: () => aiFeedbackService.getFeedbackCategories(),
  });
  
  // Fetch model versions
  const {
    data: modelVersions,
    isLoading: isLoadingModels,
    error: modelsError
  } = useQuery({
    queryKey: ['ai-model-versions'],
    queryFn: () => aiFeedbackService.getModelVersions(),
  });
  
  // Fetch current model version
  const {
    data: currentModel,
    isLoading: isLoadingCurrentModel,
    error: currentModelError
  } = useQuery({
    queryKey: ['ai-current-model'],
    queryFn: () => aiFeedbackService.getCurrentModelVersion(),
  });
  
  // Review feedback mutation
  const reviewFeedbackMutation = useMutation({
    mutationFn: ({ 
      feedbackId, 
      addToTraining 
    }: { 
      feedbackId: string; 
      addToTraining: boolean; 
    }) => {
      if (!adminUser?.id) {
        throw new Error('Admin user ID is required');
      }
      return aiFeedbackService.reviewFeedback(
        feedbackId, 
        adminUser.id, 
        addToTraining
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['ai-performance-metrics'] });
    },
  });
  
  // Add training example mutation
  const addTrainingExampleMutation = useMutation({
    mutationFn: ({ 
      inputData, 
      expectedOutput, 
      category, 
      feedbackId 
    }: { 
      inputData: Record<string, any>; 
      expectedOutput: Record<string, any>; 
      category: string; 
      feedbackId?: string; 
    }) => {
      if (!adminUser?.id) {
        throw new Error('Admin user ID is required');
      }
      return aiFeedbackService.addTrainingExample(
        inputData, 
        expectedOutput, 
        category, 
        adminUser.id, 
        feedbackId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-training-examples'] });
    },
  });
  
  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AIFeedbackFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Review feedback
  const reviewFeedback = useCallback((feedbackId: string, addToTraining: boolean) => {
    return reviewFeedbackMutation.mutateAsync({ feedbackId, addToTraining });
  }, [reviewFeedbackMutation]);
  
  // Add training example
  const addTrainingExample = useCallback((
    inputData: Record<string, any>,
    expectedOutput: Record<string, any>,
    category: string,
    feedbackId?: string
  ) => {
    return addTrainingExampleMutation.mutateAsync({
      inputData,
      expectedOutput,
      category,
      feedbackId
    });
  }, [addTrainingExampleMutation]);
  
  return {
    // Data
    feedbackList,
    performanceMetrics,
    feedbackTrends,
    feedbackCategories,
    modelVersions,
    currentModel,
    filters,
    
    // Loading states
    isLoading: isLoadingFeedback || isLoadingMetrics || isLoadingTrends || 
               isLoadingCategories || isLoadingModels || isLoadingCurrentModel,
    isLoadingFeedback,
    isLoadingMetrics,
    isLoadingTrends,
    isLoadingCategories,
    isLoadingModels,
    isLoadingCurrentModel,
    
    // Errors
    error: feedbackError || metricsError || trendsError || 
           categoriesError || modelsError || currentModelError,
    
    // Actions
    updateFilters,
    refetchFeedback,
    reviewFeedback,
    addTrainingExample,
    
    // Mutation states
    isReviewing: reviewFeedbackMutation.isPending,
    isAddingExample: addTrainingExampleMutation.isPending
  };
};