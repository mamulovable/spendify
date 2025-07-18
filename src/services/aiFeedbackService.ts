import { supabase } from '@/lib/supabase';
import { 
  AIFeedback, 
  AIFeedbackFilters, 
  AIFeedbackMetrics, 
  AIModelVersion, 
  AITrainingExample,
  AIFeedbackTrend,
  AIPerformanceMetrics
} from '@/types/aiFeedback';

export const aiFeedbackService = {
  async getFeedbackList(filters?: AIFeedbackFilters): Promise<AIFeedback[]> {
    let query = supabase
      .from('admin_ai_feedback')
      .select('*');
    
    if (filters) {
      if (filters.feedbackType) {
        query = query.eq('feedback_type', filters.feedbackType);
      }
      
      if (filters.modelVersion) {
        query = query.eq('model_version', filters.modelVersion);
      }
      
      if (filters.dateRange?.start && filters.dateRange?.end) {
        query = query.gte('created_at', filters.dateRange.start.toISOString())
                     .lte('created_at', filters.dateRange.end.toISOString());
      }
      
      if (filters.reviewStatus === 'reviewed') {
        query = query.eq('reviewed', true);
      } else if (filters.reviewStatus === 'unreviewed') {
        query = query.eq('reviewed', false);
      }
      
      if (filters.trainingStatus === 'added') {
        query = query.eq('added_to_training', true);
      } else if (filters.trainingStatus === 'not_added') {
        query = query.eq('added_to_training', false);
      }
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI feedback:', error);
      throw new Error('Failed to fetch AI feedback');
    }
    
    return data || [];
  },
  
  async getFeedbackDetail(id: string): Promise<AIFeedback> {
    // First get the basic feedback info
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('admin_ai_feedback')
      .select('*')
      .eq('id', id)
      .single();
    
    if (feedbackError) {
      console.error('Error fetching AI feedback detail:', feedbackError);
      throw new Error('Failed to fetch AI feedback detail');
    }
    
    if (!feedbackData) {
      throw new Error('Feedback not found');
    }
    
    // Then get the detailed data from the ai_feedback table
    const { data: detailData, error: detailError } = await supabase
      .from('ai_feedback')
      .select('input_data, actual_output, expected_output')
      .eq('id', id)
      .single();
    
    if (detailError) {
      console.error('Error fetching AI feedback detailed data:', detailError);
      throw new Error('Failed to fetch AI feedback detailed data');
    }
    
    return {
      ...feedbackData,
      ...(detailData || {})
    };
  },
  
  async getFeedbackMetrics(days: number = 30): Promise<AIFeedbackMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('ai_feedback_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching AI feedback metrics:', error);
      throw new Error('Failed to fetch AI feedback metrics');
    }
    
    return data || [];
  },
  
  async getModelVersions(): Promise<AIModelVersion[]> {
    const { data, error } = await supabase
      .from('ai_model_versions')
      .select('*')
      .order('deployed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI model versions:', error);
      throw new Error('Failed to fetch AI model versions');
    }
    
    return data || [];
  },
  
  async getCurrentModelVersion(): Promise<AIModelVersion> {
    const { data, error } = await supabase
      .from('ai_model_versions')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Error fetching current AI model version:', error);
      throw new Error('Failed to fetch current AI model version');
    }
    
    if (!data) {
      throw new Error('No active model version found');
    }
    
    return data;
  },
  
  async reviewFeedback(
    feedbackId: string, 
    adminId: string, 
    addToTraining: boolean
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc(
      'review_ai_feedback',
      {
        feedback_id: feedbackId,
        admin_id: adminId,
        add_to_training: addToTraining
      }
    );
    
    if (error) {
      console.error('Error reviewing AI feedback:', error);
      throw new Error('Failed to review AI feedback');
    }
    
    return data || false;
  },
  
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
  
  async addTrainingExample(
    inputData: Record<string, any>,
    expectedOutput: Record<string, any>,
    category: string,
    adminId: string,
    feedbackId?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc(
      'add_ai_training_example',
      {
        input_data: inputData,
        expected_output: expectedOutput,
        category: category,
        admin_id: adminId,
        feedback_id: feedbackId
      }
    );
    
    if (error) {
      console.error('Error adding AI training example:', error);
      throw new Error('Failed to add AI training example');
    }
    
    return data || '';
  },
  
  async getFeedbackTrends(days: number = 30): Promise<AIFeedbackTrend[]> {
    const metrics = await this.getFeedbackMetrics(days);
    
    return metrics.map(metric => ({
      date: metric.metric_date,
      totalFeedback: metric.total_feedback,
      positiveFeedback: metric.positive_feedback,
      negativeFeedback: metric.negative_feedback,
      misclassifications: metric.misclassifications
    }));
  },
  
  async getPerformanceMetrics(): Promise<AIPerformanceMetrics> {
    // Get current model version
    const currentModel = await this.getCurrentModelVersion();
    
    // Get latest metrics
    const { data: latestMetric, error: metricsError } = await supabase
      .from('ai_feedback_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(1)
      .single();
    
    if (metricsError) {
      console.error('Error fetching latest AI metrics:', metricsError);
      throw new Error('Failed to fetch latest AI metrics');
    }
    
    // Calculate totals for last 30 days
    const thirtyDayMetrics = await this.getFeedbackMetrics(30);
    const totals = thirtyDayMetrics.reduce(
      (acc, metric) => {
        acc.totalFeedback += metric.total_feedback;
        acc.positiveFeedback += metric.positive_feedback;
        acc.negativeFeedback += metric.negative_feedback;
        acc.misclassifications += metric.misclassifications;
        acc.reviewedCount += metric.reviewed_count;
        acc.addedToTraining += metric.added_to_training;
        return acc;
      },
      { 
        totalFeedback: 0, 
        positiveFeedback: 0, 
        negativeFeedback: 0, 
        misclassifications: 0,
        reviewedCount: 0,
        addedToTraining: 0
      }
    );
    
    return {
      accuracy: currentModel.accuracy_score || 0,
      precision: currentModel.precision_score || 0,
      recall: currentModel.recall_score || 0,
      f1Score: currentModel.f1_score || 0,
      ...totals
    };
  },
  
  async getFeedbackCategories(): Promise<AIFeedbackCategory[]> {
    const { data, error } = await supabase
      .from('ai_feedback')
      .select('feedback_type, count')
      .order('count', { ascending: false })
      .group('feedback_type');
    
    if (error) {
      console.error('Error fetching AI feedback categories:', error);
      throw new Error('Failed to fetch AI feedback categories');
    }
    
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    
    return data.map(item => ({
      category: item.feedback_type,
      count: item.count,
      percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0
    }));
  }
};