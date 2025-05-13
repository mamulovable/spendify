import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface AdminDocument {
  id: string;
  user_id: string;
  user_email: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  error_message: string | null;
  file_size: number;
  page_count: number | null;
  content_extracted: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  field_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
}

export interface DocumentError {
  id: string;
  document_id: string;
  user_id: string;
  user_email: string;
  error_type: string;
  error_message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export interface ProcessingStats {
  total_documents: number;
  processed_last_24h: number;
  average_processing_time: number;
  success_rate: number;
  error_rate: number;
  documents_by_type: { [key: string]: number };
  processing_times: { time: string; count: number }[];
}

interface DocumentsResponse {
  documents: AdminDocument[];
  templates: DocumentTemplate[];
  errors: DocumentError[];
  stats: ProcessingStats | null;
  loading: {
    documents: boolean;
    templates: boolean;
    errors: boolean;
    stats: boolean;
  };
  error: Error | null;
  refreshDocuments: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  refreshErrors: () => Promise<void>;
  refreshStats: () => Promise<void>;
  prioritizeDocument: (documentId: string) => Promise<void>;
  cancelProcessing: (documentId: string) => Promise<void>;
  retryProcessing: (documentId: string) => Promise<void>;
  activateTemplate: (templateId: string, isActive: boolean) => Promise<void>;
  markErrorResolved: (errorId: string) => Promise<void>;
}

export function useAdminDocuments(): DocumentsResponse {
  const { logActivity } = useAdmin();
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [errors, setErrors] = useState<DocumentError[]>([]);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [loading, setLoading] = useState({
    documents: true,
    templates: true,
    errors: true,
    stats: true,
  });
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('admin_documents_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      setDocuments(data || []);
      await logActivity('fetched', 'documents');
    } catch (err) {
      console.error('Error fetching admin documents:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      await logActivity('error', 'documents', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(prev => ({ ...prev, templates: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      setTemplates(data || []);
      await logActivity('fetched', 'templates');
    } catch (err) {
      console.error('Error fetching document templates:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch templates'));
      await logActivity('error', 'templates', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, templates: false }));
    }
  };

  const fetchErrors = async () => {
    try {
      setLoading(prev => ({ ...prev, errors: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('document_processing_errors')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      setErrors(data || []);
      await logActivity('fetched', 'document_errors');
    } catch (err) {
      console.error('Error fetching document errors:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch errors'));
      await logActivity('error', 'document_errors', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, errors: false }));
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(null);

      // Call a Supabase function that returns statistics
      const { data, error: dbError } = await supabase.rpc('get_document_processing_stats');

      if (dbError) throw dbError;

      setStats(data);
      await logActivity('fetched', 'document_stats');
    } catch (err) {
      console.error('Error fetching document stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      await logActivity('error', 'document_stats', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const prioritizeDocument = async (documentId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('prioritize_document', {
        target_document_id: documentId,
      });

      if (dbError) throw dbError;

      await logActivity('prioritized', 'document', { document_id: documentId });
      await fetchDocuments();
    } catch (err) {
      console.error('Error prioritizing document:', err);
      throw err instanceof Error ? err : new Error('Failed to prioritize document');
    }
  };

  const cancelProcessing = async (documentId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('cancel_document_processing', {
        target_document_id: documentId,
      });

      if (dbError) throw dbError;

      await logActivity('cancelled', 'document_processing', { document_id: documentId });
      await fetchDocuments();
    } catch (err) {
      console.error('Error cancelling document processing:', err);
      throw err instanceof Error ? err : new Error('Failed to cancel processing');
    }
  };

  const retryProcessing = async (documentId: string) => {
    try {
      const { error: dbError } = await supabase.rpc('retry_document_processing', {
        target_document_id: documentId,
      });

      if (dbError) throw dbError;

      await logActivity('retried', 'document_processing', { document_id: documentId });
      await fetchDocuments();
    } catch (err) {
      console.error('Error retrying document processing:', err);
      throw err instanceof Error ? err : new Error('Failed to retry processing');
    }
  };

  const activateTemplate = async (templateId: string, isActive: boolean) => {
    try {
      const { error: dbError } = await supabase
        .from('document_templates')
        .update({ is_active: isActive })
        .eq('id', templateId);

      if (dbError) throw dbError;

      await logActivity(isActive ? 'activated' : 'deactivated', 'template', { template_id: templateId });
      await fetchTemplates();
    } catch (err) {
      console.error('Error updating template status:', err);
      throw err instanceof Error ? err : new Error('Failed to update template');
    }
  };

  const markErrorResolved = async (errorId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('document_processing_errors')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', errorId);

      if (dbError) throw dbError;

      await logActivity('resolved', 'document_error', { error_id: errorId });
      await fetchErrors();
    } catch (err) {
      console.error('Error marking error as resolved:', err);
      throw err instanceof Error ? err : new Error('Failed to mark error as resolved');
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
    fetchErrors();
    fetchStats();

    // Set up real-time subscriptions for documents
    const documentsChannel = supabase
      .channel('admin-documents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    // Set up real-time subscription for errors
    const errorsChannel = supabase
      .channel('admin-document-errors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_processing_errors',
        },
        () => {
          fetchErrors();
        }
      )
      .subscribe();

    return () => {
      documentsChannel.unsubscribe();
      errorsChannel.unsubscribe();
    };
  }, []);

  return {
    documents,
    templates,
    errors,
    stats,
    loading,
    error,
    refreshDocuments: fetchDocuments,
    refreshTemplates: fetchTemplates,
    refreshErrors: fetchErrors,
    refreshStats: fetchStats,
    prioritizeDocument,
    cancelProcessing,
    retryProcessing,
    activateTemplate,
    markErrorResolved,
  };
}
