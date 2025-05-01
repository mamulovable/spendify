import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProcessedStatement } from './pdfService';

// Set the default Gemini API key
const GEMINI_API_KEY = 'AIzaSyAazifqpQ7imFjw57NsrKmelrq1hpEnxbE';

// Initialize the Gemini API with the API key
let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize the Gemini API client
 */
const initializeGeminiAPI = () => {
  try {
    const apiKey = getGeminiApiKey();
    if (!genAI && apiKey) {
      console.log('Initializing Gemini API with key');
      genAI = new GoogleGenerativeAI(apiKey);
      return true;
    }
    return !!genAI;
  } catch (error) {
    console.error('Error initializing Gemini API:', error);
    return false;
  }
};

/**
 * Set a custom Gemini API key
 */
export const setGeminiApiKey = (key: string) => {
  try {
    console.log('Setting new Gemini API key');
    localStorage.setItem('gemini_api_key', key);
    genAI = new GoogleGenerativeAI(key);
  } catch (error) {
    console.error('Error setting Gemini API key:', error);
    throw new Error('Failed to set API key');
  }
};

/**
 * Get the stored Gemini API key
 */
export const getGeminiApiKey = (): string => {
  return localStorage.getItem('gemini_api_key') || GEMINI_API_KEY;
};

/**
 * Check if Gemini API key is available
 */
export const hasGeminiApiKey = (): boolean => {
  return !!getGeminiApiKey();
};

/**
 * Generate insights based on transaction data using Gemini
 */
export const generateInsights = async (
  statement: ProcessedStatement
): Promise<string[]> => {
  try {
    // Initialize the API
    if (!initializeGeminiAPI()) {
      // Try to use a stored key if available
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey) {
        console.log('Using stored API key');
        genAI = new GoogleGenerativeAI(storedKey);
      } else {
        console.error('No Gemini API key available');
        throw new Error('Gemini API key not available');
      }
    }

    // Use the latest Gemini 1.5-flash model as requested
    console.log('Using Gemini 1.5-flash model');
    const model = genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // --- Add checks for potentially undefined numeric values ---
    const safeTotalIncome = typeof statement.totalIncome === 'number' ? statement.totalIncome : 0;
    const safeTotalExpense = typeof statement.totalExpense === 'number' ? statement.totalExpense : 0;
    const safeBalance = typeof statement.balance === 'number' ? statement.balance : 0;
    // --- End of added checks ---

    // Prepare the prompt with transaction data using the safe values
    const prompt = `
      Please analyze this financial data from a bank statement and provide 3 concise, actionable insights for the user.
      Focus on spending patterns, potential savings opportunities, and budget recommendations.
      Keep each insight to 1-2 sentences. Format each insight as a separate response.

      Here is the transaction data:
      Total Income: $${safeTotalIncome.toFixed(2)} 
      Total Expenses: $${safeTotalExpense.toFixed(2)}
      Current Balance: $${safeBalance.toFixed(2)} 
      
      Transactions by Category:
      ${getCategoryBreakdown(statement)}
      
      Top 5 Transactions:
      ${getTopTransactions(statement)}
    `;

    // Use safe values in logging as well
    console.log('Sending prompt to Gemini with data summary:', 
      `Income: $${safeTotalIncome.toFixed(2)}, Expenses: $${safeTotalExpense.toFixed(2)}, Categories: ${Object.keys(getCategoryCounts(statement)).length}`);
    
    try {
      // Generate the response with timeout handling
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request to Gemini API timed out after 15 seconds')), 15000)
        )
      ]) as any;
      
      const response = result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text.substring(0, 100) + '...');

      // Split into separate insights
      const insights = text
        .split('\n')
        .filter(line => line.trim().length > 0 && !line.includes('Insight'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 3);

      if (insights.length === 0) {
        console.warn('No insights found in Gemini response');
        return [
          'Your highest spending category presents an opportunity to reduce expenses.',
          'Consider reviewing your transaction history to identify recurring subscriptions you may no longer need.',
          'Creating a monthly budget based on your recent spending patterns could help improve your financial position.'
        ];
      }

      return insights;
    } catch (apiError) {
      console.error('Error during Gemini API call:', apiError);
      // Try with fallback model if the first attempt fails
      try {
        console.log('Attempting with fallback model gemini-pro');
        const fallbackModel = genAI!.getGenerativeModel({ model: 'gemini-pro' });
        const fallbackResult = await fallbackModel.generateContent(prompt);
        const fallbackText = fallbackResult.response.text();
        
        const fallbackInsights = fallbackText
          .split('\n')
          .filter(line => line.trim().length > 0 && !line.includes('Insight'))
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 3);
          
        if (fallbackInsights.length > 0) {
          return fallbackInsights;
        }
        throw new Error('Failed to generate insights with fallback model');
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError);
        throw apiError; // Throw the original error
      }
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    return [
      'Failed to generate AI insights. Please try again or check your internet connection.',
      'Consider reviewing your largest transactions for savings opportunities.',
      'Try categorizing your transactions to better understand spending patterns.'
    ];
  }
};

/**
 * Helper function to get category breakdown for the prompt
 */
const getCategoryBreakdown = (statement: ProcessedStatement): string => {
  const categories = new Map<string, number>();
  
  statement.transactions.forEach(transaction => {
    // Ensure transaction.amount is treated as a number
    const amount = typeof transaction.amount === 'number' ? transaction.amount : 0; 
    const category = transaction.category || 'Uncategorized';
    const currentAmount = categories.get(category) || 0;
    categories.set(category, currentAmount + amount); // Use the safe amount
  });
  
  return Array.from(categories.entries())
    .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`) // .toFixed(2) is safe here as amount is guaranteed to be a number
    .join('\n');
};

/**
 * Helper function to get category counts for better logging
 */
const getCategoryCounts = (statement: ProcessedStatement): Record<string, number> => {
  const categoryCounts: Record<string, number> = {};
  
  statement.transactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  return categoryCounts;
};

/**
 * Helper function to get top transactions for the prompt
 */
const getTopTransactions = (statement: ProcessedStatement): string => {
  return statement.transactions
    // Ensure sorting handles non-numeric amounts
    .sort((a, b) => (typeof b.amount === 'number' ? b.amount : 0) - (typeof a.amount === 'number' ? a.amount : 0)) 
    .slice(0, 5)
    .map(t => {
      // Ensure amount is safe before calling .toFixed
      const safeAmount = typeof t.amount === 'number' ? t.amount : 0; 
      return `${t.description}: $${safeAmount.toFixed(2)} (${t.category || 'Uncategorized'})`;
    })
    .join('\n');
};

export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
