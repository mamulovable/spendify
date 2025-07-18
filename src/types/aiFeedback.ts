export interface AIFeedback {
  id: string;
  feedback_type: 'helpful' | 'correct' | 'not_helpful' | 'incorrect' | 'other';
  model_version: string;
  user_comment?: string;
  reviewed: boolean;
  reviewed_by_name?: string;
  reviewed_at?: string;
  added_to_training: boolean;
  created_at: string;
  input_data?: Record<string, any>;
  actual_output?: Record<string, any>;
  expected_output?: Record<string, any>;
}

export interface AITrainingExample {
  id: string;
  feedback_id?: string;
  input_data: Record<string, any>;
  expected_output: Record<string, any>;
  category: string;
  added_by: string;
  is_verified: boolean;
  created_at: string;
}

export interface AIFeedbackMetrics {
  id: string;
  metric_date: string;
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  misclassifications: number;
  reviewed_count: number;
  added_to_training: number;
  created_at: string;
  updated_at: string;
}

export interface AIModelVersion {
  id: string;
  version_name: string;
  version_number: string;
  is_active: boolean;
  description?: string;
  deployed_at: string;
  accuracy_score?: number;
  precision_score?: number;
  recall_score?: number;
  f1_score?: number;
  created_at: string;
}

export interface AIFeedbackFilters {
  feedbackType?: string;
  modelVersion?: string;
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  reviewStatus?: 'all' | 'reviewed' | 'unreviewed';
  trainingStatus?: 'all' | 'added' | 'not_added';
}

export interface AIPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  misclassifications: number;
  reviewedCount: number;
  addedToTraining: number;
}

export interface AIFeedbackTrend {
  date: string;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  misclassifications: number;
}

export interface AIFeedbackCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ModelImprovement {
  id: string;
  model_version: string;
  previous_version: string;
  training_date: string;
  accuracy_before: number;
  accuracy_after: number;
  precision_before: number;
  precision_after: number;
  recall_before: number;
  recall_after: number;
  f1_before: number;
  f1_after: number;
  training_examples_count: number;
  notes?: string;
}