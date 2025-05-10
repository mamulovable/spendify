import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface UserGrowthData {
  date: string;
  new_users: number;
}

export interface DocumentProcessingData {
  date: string;
  documents_processed: number;
  avg_processing_time_seconds: number;
}

export interface RevenueData {
  month: string;
  paying_users: number;
  monthly_revenue: number;
}

export interface FeatureUsageData {
  event_type: string;
  usage_count: number;
  unique_users: number;
}

export interface TrialConversionData {
  week: string;
  trial_users: number;
  converted_users: number;
  conversion_rate: number;
}

export interface RetentionData {
  cohort_date: string;
  total_users: number;
  week_1: number;
  week_2: number;
  week_3: number;
  week_4: number;
}

export interface AnalyticsTimeframe {
  start_date: string;
  end_date: string;
}

export function useAdminAnalytics(timeframe: AnalyticsTimeframe = {
  start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0]
}) {
  const { logActivity } = useAdmin();
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [documentProcessing, setDocumentProcessing] = useState<DocumentProcessingData[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData[]>([]);
  const [trialConversion, setTrialConversion] = useState<TrialConversionData[]>([]);
  const [retention, setRetention] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserGrowth = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_user_growth')
        .select('*')
        .gte('date', timeframe.start_date)
        .lte('date', timeframe.end_date)
        .order('date', { ascending: true });

      if (error) throw error;
      setUserGrowth(data || []);
    } catch (err) {
      console.error('Error fetching user growth data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user growth data'));
    }
  };

  const fetchDocumentProcessing = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_document_processing')
        .select('*')
        .gte('date', timeframe.start_date)
        .lte('date', timeframe.end_date)
        .order('date', { ascending: true });

      if (error) throw error;
      setDocumentProcessing(data || []);
    } catch (err) {
      console.error('Error fetching document processing data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch document processing data'));
    }
  };

  const fetchRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_revenue')
        .select('*')
        .order('month', { ascending: true });

      if (error) throw error;
      setRevenue(data || []);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch revenue data'));
    }
  };

  const fetchFeatureUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_feature_usage')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setFeatureUsage(data || []);
    } catch (err) {
      console.error('Error fetching feature usage data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch feature usage data'));
    }
  };

  const fetchTrialConversion = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_trial_conversion')
        .select('*')
        .gte('week', timeframe.start_date)
        .lte('week', timeframe.end_date)
        .order('week', { ascending: true });

      if (error) throw error;
      setTrialConversion(data || []);
    } catch (err) {
      console.error('Error fetching trial conversion data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trial conversion data'));
    }
  };

  const fetchRetention = async () => {
    try {
      const { data, error } = await supabase
        .rpc('calculate_retention', {
          p_start_date: timeframe.start_date,
          p_end_date: timeframe.end_date
        });

      if (error) throw error;
      setRetention(data || []);
    } catch (err) {
      console.error('Error fetching retention data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch retention data'));
    }
  };

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchUserGrowth(),
        fetchDocumentProcessing(),
        fetchRevenue(),
        fetchFeatureUsage(),
        fetchTrialConversion(),
        fetchRetention()
      ]);
      
      await logActivity('viewed', 'analytics', {
        timeframe: timeframe
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeframe.start_date, timeframe.end_date]);

  return {
    userGrowth,
    documentProcessing,
    revenue,
    featureUsage,
    trialConversion,
    retention,
    loading,
    error,
    refresh: fetchAllAnalytics
  };
}
