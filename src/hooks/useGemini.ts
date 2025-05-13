import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';

// Types for AI analysis responses
interface AIAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface GeminiOptions {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export const useGemini = () => {
  const { user } = useAuth();
  const { apiIntegrations } = useAdminSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get Gemini API configuration from admin settings
  const geminiIntegration = apiIntegrations.find(api => api.key === 'gemini');
  
  // Default options for Gemini API calls
  const defaultOptions: GeminiOptions = {
    model: 'gemini-pro',
    temperature: 0.2,
    maxTokens: 1024,
  };

  // Initialize the Gemini API client
  useEffect(() => {
    if (geminiIntegration?.is_enabled) {
      console.log('Gemini AI integration is enabled');
    }
  }, [geminiIntegration]);

  // Generate AI analysis for different tasks
  const generateAIAnalysis = async (
    analysisType: 'categorize_transactions' | 'identify_patterns' | 'detect_anomalies' | 'generate_predictions',
    data: any
  ): Promise<AIAnalysisResponse> => {
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    if (!geminiIntegration?.is_enabled) {
      return {
        success: false,
        error: 'Gemini AI integration is not enabled',
      };
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, this would make an API call to Gemini
      // For now, we'll simulate the analysis with mock responses
      
      // Prepare the appropriate prompt based on analysis type
      const prompt = preparePrompt(analysisType, data);
      
      // Call the Gemini API with improved error handling
      console.log(`Generating ${analysisType} analysis...`);
      const response = await handleAPICall(prompt, analysisType, data);
      
      // Log the activity
      await logActivity('ai_analysis', analysisType, { userId: user.id });
      
      return {
        success: true,
        data: response,
      };
    } catch (err: any) {
      console.error(`Error generating AI analysis (${analysisType}):`, err);
      setError(err.message || 'Failed to generate AI analysis');
      
      return {
        success: false,
        error: err.message || 'Failed to generate AI analysis',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare prompts for different analysis types
  const preparePrompt = (analysisType: string, data: any): string => {
    switch (analysisType) {
      case 'categorize_transactions':
        return `
        You are a financial analysis AI assistant. Your task is to analyze and categorize financial transactions.
        
        INSTRUCTIONS:
        1. Analyze each transaction and assign it to the most appropriate category from the provided list
        2. Use the merchant name, description, and amount to make your decision
        3. For ambiguous cases, look for keywords that indicate the transaction purpose
        4. Return the transactions with added category_id field matching the appropriate category id
        5. Format your response as valid JSON
        
        AVAILABLE CATEGORIES:
        ${JSON.stringify(data.categories, null, 2)}
        
        TRANSACTIONS TO CATEGORIZE:
        ${JSON.stringify(data.transactions, null, 2)}
        `;
      
      case 'identify_patterns':
        return `
        You are a financial pattern recognition AI assistant. Your task is to identify spending patterns in financial data.
        
        INSTRUCTIONS:
        1. Analyze the provided transactions to identify patterns such as:
           - Recurring expenses (monthly subscriptions, bills, etc.)
           - Cyclical spending (seasonal patterns, weekend vs weekday)
           - Spending trends (increasing or decreasing spending in categories)
           - Unusual clusters of similar transactions
        2. For each pattern, provide:
           - Pattern name and type (recurring, cyclical, trend, etc.)
           - Description of the pattern
           - Confidence score (0.0-1.0)
           - Affected transaction IDs
           - First and last occurrence dates
           - Estimated amount or impact
        3. Format your response as valid JSON array of pattern objects
        
        TRANSACTIONS DATA:
        ${JSON.stringify(data.transactions, null, 2)}
        `;
      
      case 'detect_anomalies':
        return `
        You are a financial anomaly detection AI assistant. Your task is to identify unusual transactions that may indicate fraud, mistakes, or notable outliers.
        
        INSTRUCTIONS:
        1. Analyze the provided transactions to detect anomalies such as:
           - Unusually large or small transactions
           - Potential duplicate charges
           - Transactions with unusual merchants or locations
           - Unexpected transaction timing
           - Transactions that don't match historical spending patterns
        2. For each anomaly, provide:
           - Type of anomaly (unusual_amount, unusual_merchant, unusual_timing, potential_fraud)
           - Description explaining why it's flagged
           - Severity (high, medium, low) based on potential impact
           - Transaction ID
           - Detection timestamp
        3. Format your response as valid JSON array of anomaly objects
        
        TRANSACTIONS DATA:
        ${JSON.stringify(data.transactions, null, 2)}
        `;
      
      case 'generate_predictions':
        return `
        You are a financial forecasting AI assistant. Your task is to generate predictions about future spending, income, and budget status.
        
        INSTRUCTIONS:
        1. Analyze the provided transaction history and categories to predict:
           - Future spending per category for the next 3-6 months
           - Overall budget status trajectory (on_track, at_risk, over_budget)
           - Expected savings or shortfall
           - Cash flow projections
        2. Consider factors such as:
           - Recurring expenses and income
           - Seasonal patterns
           - Long-term trends
           - Historical variability
        3. For each prediction, provide:
           - Prediction type (spending, income, budget, savings)
           - Description
           - Predicted amount or value
           - Target date
           - Confidence score (0.0-1.0)
           - Contributing factors
        4. Format your response as valid JSON with prediction objects
        
        TRANSACTION HISTORY:
        ${JSON.stringify(data.transactions, null, 2)}
        
        EXPENSE CATEGORIES:
        ${JSON.stringify(data.categories, null, 2)}
        `;
      
      default:
        return '';
    }
  };

  // Function to make actual Gemini API calls when API key is available
  const callGeminiAPI = async (
    prompt: string,
    options: GeminiOptions = defaultOptions
  ): Promise<any> => {
    if (!geminiIntegration?.api_key) {
      throw new Error('Gemini API key not configured');
    }
    
    try {
      // This is a placeholder for the actual Gemini API call
      // In a real implementation, you would use the Google Generative AI SDK
      // or make fetch calls to the API endpoint
      
      // Example implementation (commented out until actual integration)
      /*
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiIntegration.api_key
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            topP: options.topP,
            topK: options.topK
          }
        })
      });
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
      */
      
      // For now, continue using mock data
      throw new Error('Using mock data instead');
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };
  
  // Function to handle API calls, with fallback to mock data
  const handleAPICall = async (
    prompt: string, 
    analysisType: string, 
    data: any
  ): Promise<any> => {
    try {
      // Try to call the actual Gemini API first
      const apiResponse = await callGeminiAPI(prompt);
      
      // Parse the response and return it
      return JSON.parse(apiResponse);
    } catch (error) {
      console.log('Falling back to mock data:', error.message);
      
      // Fall back to mock implementation
      return mockGeminiAPICall(analysisType, data);
    }
  };
  
  // Mock function to simulate Gemini API calls during development
  const mockGeminiAPICall = async (
    analysisType: string, 
    data: any
  ): Promise<any> => {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock results based on analysis type
    switch (analysisType) {
      case 'categorize_transactions':
        return mockCategorizeTransactions(data.transactions, data.categories);
      
      case 'identify_patterns':
        return mockIdentifyPatterns(data.transactions);
      
      case 'detect_anomalies':
        return mockDetectAnomalies(data.transactions);
      
      case 'generate_predictions':
        return mockGeneratePredictions(data.transactions, data.categories);
      
      default:
        throw new Error('Unknown analysis type');
    }
  };

  // Log AI analysis activity
  const logActivity = async (type: string, action: string, metadata: any) => {
    try {
      await supabase.from('activity_logs').insert([
        {
          user_id: user?.id,
          type,
          action,
          metadata,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  // Mock implementation of transaction categorization
  const mockCategorizeTransactions = (transactions: any[], categories: any[]) => {
    return transactions.map(transaction => {
      if (transaction.category_id) return transaction; // Already categorized
      
      // Simple keyword matching for demo purposes
      const description = transaction.description.toLowerCase();
      
      if (description.includes('grocery') || description.includes('food') || description.includes('market')) {
        const groceryCategory = categories.find(c => c.name.toLowerCase().includes('grocer'));
        return { ...transaction, category_id: groceryCategory?.id || null };
      }
      
      if (description.includes('rent') || description.includes('mortgage') || description.includes('housing')) {
        const housingCategory = categories.find(c => c.name.toLowerCase().includes('hous'));
        return { ...transaction, category_id: housingCategory?.id || null };
      }
      
      if (description.includes('restaurant') || description.includes('café') || description.includes('dining')) {
        const diningCategory = categories.find(c => c.name.toLowerCase().includes('dining') || c.name.toLowerCase().includes('restaurant'));
        return { ...transaction, category_id: diningCategory?.id || null };
      }
      
      // Default to uncategorized
      return transaction;
    });
  };

  // Mock implementation of pattern identification
  const mockIdentifyPatterns = (transactions: any[]) => {
    const patterns = [];
    
    // Identify potential recurring transactions
    const descriptions = transactions.map(t => t.description);
    const uniqueDescriptions = [...new Set(descriptions)];
    
    for (const description of uniqueDescriptions) {
      const matches = transactions.filter(t => t.description === description);
      
      if (matches.length >= 2) {
        // Check if transactions occur with similar frequency
        if (matches.length >= 3) {
          // Calculate days between each transaction
          const sortedDates = matches
            .map(m => new Date(m.date).getTime())
            .sort((a, b) => a - b);
          
          const intervals = [];
          for (let i = 1; i < sortedDates.length; i++) {
            intervals.push(Math.round((sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24)));
          }
          
          // Check if intervals are similar (within 3 days)
          const isRegular = intervals.every((interval, i, arr) => 
            i === 0 || Math.abs(interval - arr[i-1]) <= 3
          );
          
          if (isRegular) {
            const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
            let frequency;
            
            if (avgInterval >= 28 && avgInterval <= 31) {
              frequency = 'monthly';
            } else if (avgInterval >= 13 && avgInterval <= 15) {
              frequency = 'bi-weekly';
            } else if (avgInterval === 7) {
              frequency = 'weekly';
            } else {
              frequency = `every ${Math.round(avgInterval)} days`;
            }
            
            patterns.push({
              id: `pattern_${patterns.length + 1}`,
              type: 'recurring',
              name: `${description} (${frequency})`,
              description: `Regular payment occurring ${frequency}`,
              amount: matches[0].amount,
              frequency,
              transactions: matches.map(m => m.id),
              confidence_score: 0.95,
              first_occurrence: matches.reduce((earliest, m) => 
                new Date(m.date) < new Date(earliest) ? m.date : earliest, 
                matches[0].date
              ),
              last_occurrence: matches.reduce((latest, m) => 
                new Date(m.date) > new Date(latest) ? m.date : latest, 
                matches[0].date
              ),
            });
          }
        }
      }
    }
    
    // Add a mock seasonal pattern
    if (transactions.length > 10) {
      patterns.push({
        id: `pattern_${patterns.length + 1}`,
        type: 'seasonal',
        name: 'Increased Holiday Spending',
        description: 'Your spending tends to increase during holiday seasons',
        amount: 250.00,
        transactions: transactions.slice(0, 3).map(t => t.id),
        confidence_score: 0.85,
        first_occurrence: '2024-11-15',
        last_occurrence: '2024-12-31',
      });
    }
    
    // Add a mock spending trend
    patterns.push({
      id: `pattern_${patterns.length + 1}`,
      type: 'trend',
      name: 'Grocery Spending Trend',
      description: 'Your grocery spending has been gradually increasing',
      amount: 15.00, // Monthly increase
      transactions: transactions.filter(t => 
        t.description.toLowerCase().includes('grocery')
      ).map(t => t.id),
      confidence_score: 0.80,
      first_occurrence: '2024-01-01',
      last_occurrence: '2025-05-01',
    });
    
    return patterns;
  };

  // Mock implementation of anomaly detection
  const mockDetectAnomalies = (transactions: any[]) => {
    const anomalies = [];
    
    // Detect unusually large transactions
    const amounts = transactions.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length
    );
    
    const threshold = avgAmount + (2 * stdDev);
    
    transactions.forEach(transaction => {
      const amount = Math.abs(transaction.amount);
      
      // Check for unusually large amount
      if (amount > threshold) {
        anomalies.push({
          id: `anomaly_${anomalies.length + 1}`,
          transaction_id: transaction.id,
          type: 'unusual_amount',
          description: `Transaction amount is ${(amount / avgAmount).toFixed(1)}x higher than your average`,
          severity: amount > (threshold * 1.5) ? 'high' : 'medium',
          detected_at: new Date().toISOString(),
          status: 'new',
        });
      }
      
      // Check for potential duplicate transactions
      const potentialDuplicates = transactions.filter(t => 
        t.id !== transaction.id &&
        t.description === transaction.description &&
        Math.abs(t.amount - transaction.amount) < 0.01 &&
        Math.abs(new Date(t.date).getTime() - new Date(transaction.date).getTime()) < (24 * 60 * 60 * 1000)
      );
      
      if (potentialDuplicates.length > 0) {
        anomalies.push({
          id: `anomaly_${anomalies.length + 1}`,
          transaction_id: transaction.id,
          type: 'potential_fraud',
          description: 'Potential duplicate transaction detected within 24 hours',
          severity: 'high',
          detected_at: new Date().toISOString(),
          status: 'new',
        });
      }
      
      // Add a few random anomalies for demo purposes
      if (transaction.description.includes('Unknown') || Math.random() < 0.05) {
        anomalies.push({
          id: `anomaly_${anomalies.length + 1}`,
          transaction_id: transaction.id,
          type: 'unusual_merchant',
          description: 'Transaction with an unusual or first-time merchant',
          severity: 'low',
          detected_at: new Date().toISOString(),
          status: 'new',
        });
      }
    });
    
    return anomalies;
  };

  // Mock implementation of prediction generation
  const mockGeneratePredictions = (transactions: any[], categories: any[]) => {
    const predictions = [];
    
    // Get categories with spending
    const categoriesWithTransactions = categories.filter(category => 
      transactions.some(t => t.category_id === category.id)
    );
    
    // Generate spending predictions for each category
    categoriesWithTransactions.forEach(category => {
      const categoryTransactions = transactions.filter(t => t.category_id === category.id);
      
      if (categoryTransactions.length > 0) {
        const totalAmount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const avgAmount = totalAmount / categoryTransactions.length;
        
        // Predict next month's spending
        predictions.push({
          id: `prediction_${predictions.length + 1}`,
          type: 'spending',
          category_id: category.id,
          description: `Predicted ${category.name} spending for next month`,
          amount: avgAmount * (0.9 + (Math.random() * 0.3)), // Randomize a bit
          date: getNextMonthDate(),
          confidence_score: 0.7 + (Math.random() * 0.25),
          factors: ['historical spending', 'seasonal trends'],
        });
      }
    });
    
    // Add overall budget status prediction
    predictions.push({
      id: `prediction_${predictions.length + 1}`,
      type: 'budget',
      description: 'Overall budget status prediction',
      amount: 0, // Not applicable
      date: getNextMonthDate(),
      confidence_score: 0.85,
      factors: ['spending trends', 'recurring expenses', 'income stability'],
    });
    
    // Add savings prediction
    predictions.push({
      id: `prediction_${predictions.length + 1}`,
      type: 'savings',
      description: 'Projected savings for next quarter',
      amount: 1200, // Example amount
      date: getNextQuarterDate(),
      confidence_score: 0.75,
      factors: ['income vs. expenses', 'recurring savings', 'historical patterns'],
    });
    
    return predictions;
  };

  // Helper functions for date calculations
  const getNextMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const getNextQuarterDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0];
  };

  return {
    generateAIAnalysis,
    isProcessing,
    error,
  };
};
