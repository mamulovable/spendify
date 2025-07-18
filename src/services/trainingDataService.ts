import { supabase } from '@/lib/supabase';
import { AITrainingExample, ModelImprovement } from '@/types/aiFeedback';

export const trainingDataService = {
  async getTrainingExamples(): Promise<AITrainingExample[]> {
    const { data, error } = await supabase
      .from('ai_training_examples')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI training examples:', error);
      throw new Error('Failed to fetch AI training examples');
    }
    
    return data || [];
  },
  
  async getModelImprovements(): Promise<ModelImprovement[]> {
    const { data, error } = await supabase
      .from('ai_model_improvements')
      .select('*')
      .order('training_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI model improvements:', error);
      throw new Error('Failed to fetch AI model improvements');
    }
    
    return data || [];
  },
  
  async deleteTrainingExample(exampleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ai_training_examples')
      .delete()
      .eq('id', exampleId);
    
    if (error) {
      console.error('Error deleting AI training example:', error);
      throw new Error('Failed to delete AI training example');
    }
    
    return true;
  },
  
  async verifyTrainingExample(
    exampleId: string, 
    adminId: string, 
    isVerified: boolean
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc(
      'verify_ai_training_example',
      {
        example_id: exampleId,
        admin_id: adminId,
        is_verified: isVerified
      }
    );
    
    if (error) {
      console.error('Error verifying AI training example:', error);
      throw new Error('Failed to verify AI training example');
    }
    
    return data || false;
  },
  
  async exportTrainingDataset(): Promise<AITrainingExample[]> {
    // Get all verified training examples
    const { data, error } = await supabase
      .from('ai_training_examples')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error exporting AI training dataset:', error);
      throw new Error('Failed to export AI training dataset');
    }
    
    return data || [];
  },
  
  async importTrainingDataset(examples: AITrainingExample[]): Promise<boolean> {
    // This would typically be a server-side operation with proper validation
    // For now, we'll just insert the examples one by one
    
    try {
      for (const example of examples) {
        // Remove id and created_at to let the database generate them
        const { id, created_at, ...exampleData } = example;
        
        const { error } = await supabase
          .from('ai_training_examples')
          .insert([exampleData]);
        
        if (error) {
          console.error('Error importing AI training example:', error);
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error importing AI training dataset:', error);
      throw new Error('Failed to import AI training dataset');
    }
  },
  
  async getModelImprovementMetrics(modelVersionId: string): Promise<{
    accuracy_improvement: number;
    precision_improvement: number;
    recall_improvement: number;
    f1_improvement: number;
  }> {
    // Get the model improvement for the specified model version
    const { data, error } = await supabase
      .from('ai_model_improvements')
      .select('*')
      .eq('model_version', modelVersionId)
      .single();
    
    if (error) {
      console.error('Error fetching AI model improvement metrics:', error);
      throw new Error('Failed to fetch AI model improvement metrics');
    }
    
    if (!data) {
      return {
        accuracy_improvement: 0,
        precision_improvement: 0,
        recall_improvement: 0,
        f1_improvement: 0
      };
    }
    
    return {
      accuracy_improvement: data.accuracy_after - data.accuracy_before,
      precision_improvement: data.precision_after - data.precision_before,
      recall_improvement: data.recall_after - data.recall_before,
      f1_improvement: data.f1_after - data.f1_before
    };
  }
};