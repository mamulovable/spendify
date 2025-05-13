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
      // Fetch from analytics_daily_metrics, mapping date and new_users
      const { data, error } = await supabase
        .from('analytics_daily_metrics')
        .select('date, new_users')
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
      // Fetch from analytics_daily_metrics for documents_processed and average_processing_time
      const { data, error } = await supabase
        .from('analytics_daily_metrics')
        .select('date, documents_processed, average_processing_time')
        .gte('date', timeframe.start_date)
        .lte('date', timeframe.end_date)
        .order('date', { ascending: true });
      if (error) throw error;
      setDocumentProcessing(
        (data || []).map((row: any) => ({
          date: row.date,
          documents_processed: row.documents_processed,
          avg_processing_time_seconds: row.average_processing_time
        }))
      );
    } catch (err) {
      console.error('Error fetching document processing data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch document processing data'));
    }
  };

  const fetchRevenue = async () => {
    try {
      // Fetch from analytics_plan_revenue table
      const { data, error } = await supabase
        .from('analytics_plan_revenue')
        .select('date, plan_name, subscriber_count, revenue, trial_count')
        .order('date', { ascending: true });
      if (error) throw error;
      // Aggregate monthly revenue and paying users, skip invalid dates
      const revenueByMonth: { [key: string]: { month: string, paying_users: number, monthly_revenue: number } } = {};
      (data || []).forEach((row: any) => {
        const month = row.date;
        // Defensive: skip if month is not a valid date string
        if (!month || isNaN(new Date(month).getTime())) return;
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = { month: new Date(month).toISOString().split('T')[0], paying_users: 0, monthly_revenue: 0 };
        }
        revenueByMonth[month].paying_users += row.subscriber_count || 0;
        revenueByMonth[month].monthly_revenue += parseFloat(row.revenue) || 0;
      });
      setRevenue(Object.values(revenueByMonth));
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch revenue data'));
    }
  };

  const fetchFeatureUsage = async () => {
    try {
      // Not implemented in new schema; set empty array or implement if you add a table
      setFeatureUsage([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch feature usage data'));
    }
  };

  const fetchTrialConversion = async () => {
    try {
      // Fetch from analytics_daily_metrics for trial conversions and rate
      const { data, error } = await supabase
        .from('analytics_daily_metrics')
        .select('date, trial_conversions, trial_conversion_rate')
        .gte('date', timeframe.start_date)
        .lte('date', timeframe.end_date)
        .order('date', { ascending: true });
      if (error) throw error;
      setTrialConversion(
        (data || []).map((row: any) => ({
          week: row.date, // For demo, use date as week
          trial_users: row.trial_conversions,
          converted_users: null, // Not tracked in this schema
          conversion_rate: row.trial_conversion_rate
        }))
      );
    } catch (err) {
      console.error('Error fetching trial conversion data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch trial conversion data'));
    }
  };

  const fetchRetention = async () => {
    try {
      // Fetch from analytics_cohorts
      const { data, error } = await supabase
        .from('analytics_cohorts')
        .select('*')
        .gte('cohort_date', timeframe.start_date)
        .lte('cohort_date', timeframe.end_date)
        .order('cohort_date', { ascending: true });
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
