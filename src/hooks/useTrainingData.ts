import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingDataService } from '@/services/trainingDataService';
import { AITrainingExample, ModelImprovement } from '@/types/aiFeedback';
import { useAuth } from '@/hooks/useAuth';

export const useTrainingData = () => {
  const { adminUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch training examples
  const { 
    data: trainingExamples,
    isLoading: isLoadingExamples,
    error: examplesError,
    refetch: refetchExamples
  } = useQuery({
    queryKey: ['ai-training-examples'],
    queryFn: () => trainingDataService.getTrainingExamples(),
  });
  
  // Fetch model improvements
  const {
    data: modelImprovements,
    isLoading: isLoadingImprovements,
    error: improvementsError,
    refetch: refetchImprovements
  } = useQuery({
    queryKey: ['ai-model-improvements'],
    queryFn: () => trainingDataService.getModelImprovements(),
  });
  
  // Delete training example mutation
  const deleteExampleMutation = useMutation({
    mutationFn: (exampleId: string) => {
      return trainingDataService.deleteTrainingExample(exampleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-training-examples'] });
    },
  });
  
  // Verify training example mutation
  const verifyExampleMutation = useMutation({
    mutationFn: ({ 
      exampleId, 
      isVerified 
    }: { 
      exampleId: string; 
      isVerified: boolean; 
    }) => {
      if (!adminUser?.id) {
        throw new Error('Admin user ID is required');
      }
      return trainingDataService.verifyTrainingExample(
        exampleId, 
        adminUser.id, 
        isVerified
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-training-examples'] });
    },
  });
  
  // Delete training example
  const deleteTrainingExample = useCallback((exampleId: string) => {
    return deleteExampleMutation.mutateAsync(exampleId);
  }, [deleteExampleMutation]);
  
  // Verify training example
  const verifyTrainingExample = useCallback((exampleId: string, isVerified: boolean) => {
    return verifyExampleMutation.mutateAsync({ exampleId, isVerified });
  }, [verifyExampleMutation]);
  
  // Export dataset
  const exportDataset = useCallback(async () => {
    try {
      const data = await trainingDataService.exportTrainingDataset();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `training-dataset-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting dataset:', error);
      throw error;
    }
  }, []);
  
  // Import dataset
  const importDataset = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid dataset format. Expected an array of training examples.');
      }
      
      await trainingDataService.importTrainingDataset(data);
      
      // Refresh data after import
      queryClient.invalidateQueries({ queryKey: ['ai-training-examples'] });
      
      return true;
    } catch (error) {
      console.error('Error importing dataset:', error);
      throw error;
    }
  }, [queryClient]);
  
  // Refetch all data
  const refetchTrainingData = useCallback(() => {
    refetchExamples();
    refetchImprovements();
  }, [refetchExamples, refetchImprovements]);
  
  return {
    // Data
    trainingExamples,
    modelImprovements,
    
    // Loading states
    isLoading: isLoadingExamples || isLoadingImprovements,
    isLoadingExamples,
    isLoadingImprovements,
    
    // Errors
    error: examplesError || improvementsError,
    
    // Actions
    deleteTrainingExample,
    verifyTrainingExample,
    exportDataset,
    importDataset,
    refetchTrainingData,
    
    // Mutation states
    isDeleting: deleteExampleMutation.isPending,
    isVerifying: verifyExampleMutation.isPending
  };
};