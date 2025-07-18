import { supabase } from '@/lib/supabase';
import type { 
  DocumentQueueItem, 
  DocumentProcessingResult, 
  DocumentProcessingMetrics,
  AIModelVersion,
  DocumentQueueFilter
} from '@/types/documentProcessing';

export const documentProcessingService = {
  /**
   * Get document queue items with optional filtering
   */
  async getQueueItems(filters: DocumentQueueFilter = {}): Promise<DocumentQueueItem[]> {
    let query = supabase
      .from('admin_document_queue')
      .select('*');
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    // Apply date range filter
    if (filters.dateRange?.from) {
      query = query.gte('created_at', filters.dateRange.from.toISOString());
    }
    
    if (filters.dateRange?.to) {
      query = query.lte('created_at', filters.dateRange.to.toISOString());
    }
    
    // Apply search filter
    if (filters.search) {
      query = query.or(`file_name.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%`);
    }
    
    // Apply sorting
    const sortColumn = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching document queue:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get document processing metrics
   */
  async getProcessingMetrics(days: number = 7): Promise<DocumentProcessingMetrics[]> {
    const { data, error } = await supabase
      .from('document_processing_metrics')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(days);
    
    if (error) {
      console.error('Error fetching document metrics:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get document processing result by document ID
   */
  async getDocumentResult(documentId: string): Promise<DocumentProcessingResult | null> {
    const { data, error } = await supabase
      .from('document_processing_results')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No results found
        return null;
      }
      console.error('Error fetching document result:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Reprocess a document
   */
  async reprocessDocument(documentId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('reprocess_document', {
        document_id: documentId,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) {
      console.error('Error reprocessing document:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Manually tag a document
   */
  async manuallyTagDocument(documentId: string, metadata: Record<string, any>): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('manually_tag_document', {
        document_id: documentId,
        metadata,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      });
    
    if (error) {
      console.error('Error manually tagging document:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Get AI model versions
   */
  async getAIModelVersions(): Promise<AIModelVersion[]> {
    const { data, error } = await supabase
      .from('ai_model_versions')
      .select('*')
      .order('deployed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI model versions:', error);
      throw error;
    }
    
    return data || [];
  },
  
  /**
   * Get current active AI model version
   */
  async getActiveAIModel(): Promise<AIModelVersion | null> {
    const { data, error } = await supabase
      .from('ai_model_versions')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No active model found
        return null;
      }
      console.error('Error fetching active AI model:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Get document queue count by status
   */
  async getQueueCountByStatus(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .rpc('get_document_queue_counts');
    
    if (error) {
      console.error('Error fetching queue counts:', error);
      throw error;
    }
    
    return data || { pending: 0, processing: 0, completed: 0, failed: 0, total: 0 };
  },
  
  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<any> {
    const { data, error } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Get document processing history
   */
  async getDocumentHistory(documentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('document_processing_queue')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching document history:', error);
      throw error;
    }
    
    return data || [];
  }
};