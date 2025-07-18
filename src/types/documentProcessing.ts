export interface DocumentQueueItem {
  queue_id: string;
  document_id: string;
  user_name: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_duration: number | null;
  error_message: string | null;
  retry_count: number;
  model_version: string | null;
  created_at: string;
}

export interface DocumentProcessingResult {
  result_id: string;
  document_id: string;
  user_name: string;
  bank_name: string | null;
  currency: string | null;
  transaction_count: number | null;
  start_date: string | null;
  end_date: string | null;
  account_number: string | null;
  confidence_score: number | null;
  model_version: string | null;
  processing_duration: number | null;
  created_at: string;
}

export interface DocumentProcessingMetrics {
  id: string;
  metric_date: string;
  total_documents: number;
  pending_documents: number;
  processing_documents: number;
  completed_documents: number;
  failed_documents: number;
  avg_processing_time: number | null;
  success_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface AIModelVersion {
  id: string;
  version_name: string;
  model_type: string;
  description: string | null;
  is_active: boolean;
  accuracy_score: number | null;
  training_data_size: number | null;
  deployed_at: string | null;
  deployed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentQueueFilter {
  status?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface DocumentProcessingHistory {
  id: string;
  status: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_duration: number | null;
  error_message: string | null;
  retry_count: number;
  model_version_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  bank_name?: string;
  currency?: string;
  transaction_count?: number;
  start_date?: string;
  end_date?: string;
  account_number?: string;
  account_holder?: string;
  total_deposits?: number;
  total_withdrawals?: number;
  confidence_score?: number;
}

export interface BatchActionParams {
  documentIds: string[];
  action: 'reprocess' | 'delete' | 'tag';
  metadata?: Record<string, any>;
}