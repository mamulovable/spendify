import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useGemini } from '@/hooks/useGemini';

// Types for financial analysis
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category_id: string | null;
  is_recurring: boolean;
  is_anomaly: boolean;
  confidence_score: number;
  user_id: string;
  document_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_income: boolean;
  is_custom: boolean;
  budget_amount: number | null;
  user_id: string;
}

export interface Pattern {
  id: string;
  type: 'recurring' | 'seasonal' | 'trend';
  name: string;
  description: string;
  amount: number;
  frequency?: string;
  transactions: string[]; // IDs of related transactions
  confidence_score: number;
  first_occurrence: string;
  last_occurrence: string;
}

export interface Anomaly {
  id: string;
  transaction_id: string;
  type: 'unusual_amount' | 'unusual_merchant' | 'unusual_timing' | 'potential_fraud';
  description: string;
  severity: 'low' | 'medium' | 'high';
  detected_at: string;
  status: 'new' | 'reviewed' | 'false_positive';
}

export interface Prediction {
  id: string;
  type: 'spending' | 'income' | 'savings' | 'budget';
  category_id?: string;
  description: string;
  amount: number;
  date: string;
  confidence_score: number;
  factors: string[];
}

export interface FinancialData {
  transactions: {
    data: Transaction[];
    total: number;
    categorized: number;
  };
  categories: Category[];
  patterns: {
    data: Pattern[];
    count: number;
    recurring: number;
  };
  anomalies: {
    data: Anomaly[];
    count: number;
    highSeverity: number;
  };
  predictions: {
    data: Prediction[];
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    budgetStatus: 'on_track' | 'at_risk' | 'over_budget';
  };
}




export const useFinancialData = () => {
  const { user } = useAuth();
  const { generateAIAnalysis } = useGemini();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<FinancialData['transactions']>({ data: [], total: 0, categorized: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [patterns, setPatterns] = useState<FinancialData['patterns']>({ data: [], count: 0, recurring: 0 });
  const [anomalies, setAnomalies] = useState<FinancialData['anomalies']>({ data: [], count: 0, highSeverity: 0 });
  const [predictions, setPredictions] = useState<FinancialData['predictions']>({ data: [], spendingTrend: 'stable', budgetStatus: 'on_track' });
  const [analyzingData, setAnalyzingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transaction data from Supabase
  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      if (selectedDocumentId) {
        query = query.eq('document_id', selectedDocumentId);
      }
      query = query.order('date', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        setTransactions({
          data: data as Transaction[],
          total: data.length,
          categorized: data.filter(t => t.category_id !== null).length,
        });
      } else {
        setTransactions({ data: [], total: 0, categorized: 0 });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transaction data.');
      setTransactions({ data: [], total: 0, categorized: 0 });
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_custom.eq.false`);

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data as Category[]);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch category data.');
      setCategories([]);
    }
  };

  // Load analysis data when a saved analysis is selected
  useEffect(() => {
    async function loadSelectedAnalysis() {
      if (!selectedDocumentId) {
        setTransactions({ data: [], total: 0, categorized: 0 });
        setCategories([]);
        setPatterns({ data: [], count: 0, recurring: 0 });
        setAnomalies({ data: [], count: 0, highSeverity: 0 });
        setPredictions({ data: [], spendingTrend: 'stable', budgetStatus: 'on_track' });
        return;
      }
      try {
        const { getAnalysisById } = await import('@/services/storageService');
        const analysis = await getAnalysisById(selectedDocumentId);
        if (analysis) {
          setTransactions({
            data: analysis.transactions,
            total: analysis.transactions.length,
            categorized: analysis.transactions.filter(t => t.category_id !== null).length,
          });
          setCategories(analysis.categories || []);
          setPatterns({
            data: analysis.patterns || [],
            count: analysis.patterns ? analysis.patterns.length : 0,
            recurring: analysis.patterns ? analysis.patterns.filter(p => p.type === 'recurring').length : 0,
          });
          setAnomalies({
            data: analysis.anomalies || [],
            count: analysis.anomalies ? analysis.anomalies.length : 0,
            highSeverity: analysis.anomalies ? analysis.anomalies.filter(a => a.severity === 'high').length : 0,
          });
          setPredictions({
            data: analysis.predictions || [],
            spendingTrend: analysis.predictions ? 'stable' : 'stable',
            budgetStatus: analysis.predictions ? 'on_track' : 'on_track',
          });
        }
      } catch (err) {
        setTransactions({ data: [], total: 0, categorized: 0 });
        setCategories([]);
        setPatterns({ data: [], count: 0, recurring: 0 });
        setAnomalies({ data: [], count: 0, highSeverity: 0 });
        setPredictions({ data: [], spendingTrend: 'stable', budgetStatus: 'on_track' });
      }
    }
    loadSelectedAnalysis();
  }, [selectedDocumentId]);

  // Fetch patterns, anomalies, and predictions
  const fetchPatterns = async () => {
    if (!user) return;
    
    if (!user) return;
    
    try {
      let query = supabase
        .from('spending_patterns')
        .select('*')
        .eq('user_id', user.id);
      if (selectedDocumentId) {
        query = query.eq('document_id', selectedDocumentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        setPatterns({
          data: data as Pattern[],
          count: data.length,
          recurring: data.filter(p => p.type === 'recurring').length,
        });
      } else {
        setPatterns({ data: [], count: 0, recurring: 0 });
      }
    } catch (err) {
      console.error('Error fetching patterns:', err);
      setError('Failed to fetch pattern data.');
      setPatterns({ data: [], count: 0, recurring: 0 });
    }
  };

  const fetchAnomalies = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('transaction_anomalies')
        .select('*')
        .eq('user_id', user.id);
      if (selectedDocumentId) {
        query = query.eq('document_id', selectedDocumentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        setAnomalies({
          data: data as Anomaly[],
          count: data.length,
          highSeverity: data.filter(a => a.severity === 'high').length,
        });
      } else {
        setAnomalies({ data: [], count: 0, highSeverity: 0 });
      }
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setError('Failed to fetch anomaly data.');
      setAnomalies({ data: [], count: 0, highSeverity: 0 });
    }
  };

  const fetchPredictions = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('financial_predictions')
        .select('*')
        .eq('user_id', user.id);
      if (selectedDocumentId) {
        query = query.eq('document_id', selectedDocumentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        // Calculate spending trend and budget status based on predictions
        const spendingTrend = calculateSpendingTrend(data);
        const budgetStatus = calculateBudgetStatus(data);
        
        setPredictions({
          data: data as Prediction[],
          spendingTrend,
          budgetStatus,
        });
      } else {
        setPredictions({ data: [], spendingTrend: 'stable', budgetStatus: 'on_track' });
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to fetch prediction data.');
      setPredictions({ data: [], spendingTrend: 'stable', budgetStatus: 'on_track' });
    }
  };

  // Helper functions for prediction analysis
  const calculateSpendingTrend = (predictions: any[]): 'increasing' | 'decreasing' | 'stable' => {
    // Logic to determine spending trend based on predictions
    // For now, return a default value
    return 'stable';
};

  const calculateBudgetStatus = (predictions: any[]): 'on_track' | 'at_risk' | 'over_budget' => {
    // Logic to determine budget status based on predictions
    // For now, return a default value
    return 'on_track';
  };

  // Process financial data with AI
  const processTransactionsWithAI = async () => {
    if (!user || !transactions.data.length) return;
    
    try {
      setAnalyzingData(true);
      
      // Categorize uncategorized transactions
      const uncategorizedTransactions = transactions.data.filter(t => t.category_id === null);
      if (uncategorizedTransactions.length > 0) {
        const categorizedResults = await generateAIAnalysis(
          'categorize_transactions',
          { transactions: uncategorizedTransactions, categories }
        );
        
        // Update transactions with AI categorization
        if (categorizedResults && categorizedResults.success) {
          // Logic to update transactions with new categories
          console.log('Transactions categorized successfully');
        }
      }
      
      // Identify spending patterns
      const patternResults = await generateAIAnalysis(
        'identify_patterns',
        { transactions: transactions.data }
      );
      
      if (patternResults && patternResults.success) {
        // Logic to update patterns with AI-detected patterns
        console.log('Spending patterns identified successfully');
      }
      
      // Detect anomalies
      const anomalyResults = await generateAIAnalysis(
        'detect_anomalies',
        { transactions: transactions.data }
      );
      
      if (anomalyResults && anomalyResults.success) {
        // Logic to update anomalies with AI-detected anomalies
        console.log('Anomalies detected successfully');
      }
      
      // Generate predictions
      const predictionResults = await generateAIAnalysis(
        'generate_predictions',
        { transactions: transactions.data, categories }
      );
      
      if (predictionResults && predictionResults.success) {
        // Logic to update predictions with AI-generated predictions
        console.log('Predictions generated successfully');
      }
      
    } catch (err) {
      console.error('Error processing transactions with AI:', err);
      setError('Failed to complete AI analysis. Please try again later.');
    } finally {
      setAnalyzingData(false);
    }
  };

  // Main function to refresh all financial data
  const refreshData = async () => {
    setError(null);
    
    try {
    await Promise.all([
      fetchTransactions(),
      fetchCategories(),
      fetchPatterns(),
      fetchAnomalies(),
      fetchPredictions()
    ]);
    // Process data with AI
    await processTransactionsWithAI();
  } catch (err) {
    console.error('Error refreshing financial data:', err);
    setError('Failed to refresh financial data. Please try again later.');
  }
};

  // Initialize data on component mount
  useEffect(() => {
    refreshData();
  }, [user]);

  // Create or update a transaction category
  const updateTransactionCategory = async (transactionId: string, categoryId: string) => {
    if (!user) return;
    
    try {
      
        // Update in database
        const { error } = await supabase
          .from('transactions')
          .update({ category_id: categoryId })
          .eq('id', transactionId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Refresh transaction data
        fetchTransactions();
    } catch (err) {
      console.error('Error updating transaction category:', err);
      setError('Failed to update transaction category. Please try again.');
    }
  };

  // Create a new custom category
  const createCategory = async (category: Omit<Category, 'id' | 'user_id'>) => {
    if (!user) return;
    
    try {
      
        // Create in database
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            ...category,
            user_id: user.id,
          }])
          .select();
        
        if (error) throw error;
        
        // Refresh categories
        fetchCategories();
        return data[0].id;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create new category. Please try again.');
      return null;
    }
  };

  // Update anomaly status (e.g., mark as reviewed or false positive)
  const updateAnomalyStatus = async (anomalyId: string, status: 'new' | 'reviewed' | 'false_positive') => {
    if (!user) return;
    
    try {
      // Update in database for real data
      const { error } = await supabase
        .from('transaction_anomalies')
        .update({ status })
        .eq('id', anomalyId);
        
      if (error) throw error;
      
      // Refresh anomalies
      fetchAnomalies();
    } catch (err) {
      console.error('Error updating anomaly status:', err);
      setError('Failed to update anomaly status. Please try again.');
    }
  };

  return {
    transactions,
    categories,
    patterns,
    anomalies,
    predictions,
    analyzingData,
    error,
    selectedDocumentId,
    setSelectedDocumentId,
    refreshData,
    updateTransactionCategory,
    createCategory,
    updateAnomalyStatus,
  };
};
