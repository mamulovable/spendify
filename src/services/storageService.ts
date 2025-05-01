import { BankTransaction } from './pdfService';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SavedAnalysis {
  id: string;
  user_id: string;
  name: string;
  date: string;
  transactions: BankTransaction[];
  totalIncome: number;
  totalExpense: number;
  categories: {
    category: string;
    amount: number;
    count: number;
  }[];
  insights: string[];
}

// Table name in Supabase
const TABLE_NAME = 'saved_analyses';

// Get a storage key specific to the current user (for localStorage fallback)
const getUserStorageKey = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user ? `saved_analyses_${user.id}` : 'saved_analyses_guest';
};

// Helper to get analyses from localStorage
const getLocalSavedAnalyses = async (storageKey: string): Promise<SavedAnalysis[]> => {
  const savedData = localStorage.getItem(storageKey);
  return savedData ? JSON.parse(savedData) : [];
};

// Map database column names to our interface properties
const mapDatabaseToAnalysis = (dbAnalysis: any): SavedAnalysis => {
  return {
    id: dbAnalysis.id,
    user_id: dbAnalysis.user_id,
    name: dbAnalysis.name,
    date: dbAnalysis.date,
    transactions: dbAnalysis.transactions,
    totalIncome: dbAnalysis.total_income,
    totalExpense: dbAnalysis.total_expense,
    categories: dbAnalysis.categories,
    insights: dbAnalysis.insights
  };
};

// Save analysis to Supabase database
export const saveAnalysis = async (
  name: string,
  transactions: BankTransaction[],
  totalIncome: number,
  totalExpense: number,
  categories: any[],
  insights: string[]
): Promise<SavedAnalysis> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to save analysis');
    }
    
    // Create a new analysis object
    const newAnalysis: SavedAnalysis = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name,
      date: new Date().toISOString(),
      transactions,
      totalIncome,
      totalExpense,
      categories,
      insights
    };
    
    // Save to Supabase database
    const { error } = await supabase
      .from('saved_analyses')
      .insert({
        id: newAnalysis.id,
        user_id: newAnalysis.user_id,
        name: newAnalysis.name,
        date: newAnalysis.date,
        transactions: transactions as unknown as Json,
        total_income: newAnalysis.totalIncome,
        total_expense: newAnalysis.totalExpense,
        categories: categories as unknown as Json,
        insights: insights as unknown as Json
      });
    
    if (error) {
      console.error('Failed to save to Supabase:', error);
      throw error;
    }
    
    // Also save to localStorage as a backup/offline fallback
    try {
      const storageKey = await getUserStorageKey();
      const savedAnalyses = await getLocalSavedAnalyses(storageKey);
      savedAnalyses.push(newAnalysis);
      localStorage.setItem(storageKey, JSON.stringify(savedAnalyses));
    } catch (localError) {
      console.warn('Failed to save to localStorage:', localError);
    }
    
    return newAnalysis;
  } catch (error) {
    console.error('Failed to save analysis:', error);
    throw error;
  }
};

// Get all analyses for the current user from Supabase
export const getSavedAnalyses = async (): Promise<SavedAnalysis[]> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('User not authenticated, returning empty analyses array');
      return [];
    }
    
    // Get from Supabase
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch from Supabase:', error);
      
      // Fall back to localStorage
      console.log('Falling back to localStorage');
      const storageKey = await getUserStorageKey();
      return getLocalSavedAnalyses(storageKey);
    }
    
    // Map database column names to our interface properties
    const analyses = data.map(mapDatabaseToAnalysis);
    
    // Update localStorage with the latest data
    try {
      const storageKey = await getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(analyses));
    } catch (localError) {
      console.warn('Failed to update localStorage:', localError);
    }
    
    return analyses;
  } catch (error) {
    console.error('Failed to get saved analyses:', error);
    
    // Fall back to localStorage
    try {
      const storageKey = await getUserStorageKey();
      return getLocalSavedAnalyses(storageKey);
    } catch (localError) {
      console.error('Failed to get from localStorage:', localError);
      return [];
    }
  }
};

// Delete analysis from Supabase
export const deleteAnalysis = async (id: string): Promise<void> => {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to delete analysis');
    }
    
    // Delete from Supabase
    const { error } = await supabase
      .from('saved_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Failed to delete from Supabase:', error);
      throw error;
    }
    
    // Also delete from localStorage
    try {
      const storageKey = await getUserStorageKey();
      const savedAnalyses = await getLocalSavedAnalyses(storageKey);
      const filtered = savedAnalyses.filter(analysis => analysis.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (localError) {
      console.warn('Failed to delete from localStorage:', localError);
    }
  } catch (error) {
    console.error('Failed to delete analysis:', error);
    throw error;
  }
};

// Get a specific analysis by ID from Supabase
export const getAnalysisById = async (id: string): Promise<SavedAnalysis | undefined> => {
  try {
    // Get from Supabase
    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Failed to fetch from Supabase:', error);
      
      // Fall back to localStorage
      const storageKey = await getUserStorageKey();
      const savedAnalyses = await getLocalSavedAnalyses(storageKey);
      return savedAnalyses.find(analysis => analysis.id === id);
    }
    
    return mapDatabaseToAnalysis(data);
  } catch (error) {
    console.error('Failed to get analysis by ID:', error);
    
    // Fall back to localStorage
    try {
      const storageKey = await getUserStorageKey();
      const savedAnalyses = await getLocalSavedAnalyses(storageKey);
      return savedAnalyses.find(analysis => analysis.id === id);
    } catch (localError) {
      console.error('Failed to get from localStorage:', localError);
      return undefined;
    }
  }
}; 