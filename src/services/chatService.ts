import { BankTransaction } from './pdfService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey, hasGeminiApiKey } from './insightService';

interface ChatResponse {
  answer: string;
  relevantData?: any;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to get category summary
const getCategorySummary = (transactions: BankTransaction[]) => {
  const categoryMap = new Map();
  transactions.forEach(t => {
    const category = t.category || 'Miscellaneous';
    const currentAmount = categoryMap.get(category)?.amount || 0;
    categoryMap.set(category, {
      amount: currentAmount + t.amount,
      count: (categoryMap.get(category)?.count || 0) + 1
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);
};

// Helper function to get date range
const getDateRange = (transactions: BankTransaction[]) => {
  const dates = transactions.map(t => new Date(t.date).getTime());
  return {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates))
  };
};

// Helper function to format date range
const formatDateRange = (dateRange: { start: Date; end: Date }) => {
  return `${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`;
};

// Helper function to format categories
const formatCategories = (categories: any[]) => {
  return categories
    .map(cat => `${cat.category}: ${formatCurrency(cat.amount)} (${cat.count} transactions)`)
    .join('\n');
};

// Helper function to get transfer summary
const getTransferSummary = (transactions: BankTransaction[]) => {
  const transfers = transactions
    .map(t => ({
      recipient: t.description,
      amount: Math.abs(t.amount),
      date: new Date(t.date)
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    topTransfers: transfers.slice(0, 5),
    totalTransferAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
    uniqueRecipients: new Set(transfers.map(t => t.recipient)).size
  };
};

// Helper function to format transfer summary
const formatTransferSummary = (summary: any) => {
  return `Top 5 Transfers:
${summary.topTransfers.map(t => 
  `- ${t.recipient}: ${formatCurrency(t.amount)} on ${t.date.toLocaleDateString()}`
).join('\n')}

Total Transfer Amount: ${formatCurrency(summary.totalTransferAmount)}
Unique Recipients: ${summary.uniqueRecipients}`;
};

// Helper function to format transactions
const formatTransactions = (transactions: any[]) => {
  return transactions
    .map(t => 
      `${t.date} | ${t.description} | ${t.formattedAmount} | ${t.type} | ${t.category || 'Uncategorized'}`
    )
    .join('\n');
};

export const processTransactionQuery = async (
  query: string,
  transactions: BankTransaction[],
  totalIncome: number,
  totalExpense: number
): Promise<ChatResponse> => {
  // First check if Gemini API key is available
  if (hasGeminiApiKey()) {
    try {
      const apiKey = getGeminiApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Prepare context for Gemini
      const context = {
        transactions: transactions.map(t => ({
          ...t,
          type: t.amount > 0 ? 'credit' : 'debit',
          formattedAmount: formatCurrency(Math.abs(t.amount))
        })),
        totalIncome,
        totalExpense,
        summary: {
          totalTransactions: transactions.length,
          categories: getCategorySummary(transactions),
          dateRange: getDateRange(transactions),
          transferSummary: getTransferSummary(transactions)
        }
      };

      // Determine if the query is about transactions or general advice
      const isTransactionQuery = query.toLowerCase().includes('transfer') ||
        query.toLowerCase().includes('spend') ||
        query.toLowerCase().includes('expense') ||
        query.toLowerCase().includes('income') ||
        query.toLowerCase().includes('transaction') ||
        query.toLowerCase().includes('payment') ||
        query.toLowerCase().includes('category');

      let prompt;
      if (isTransactionQuery) {
        // Create a detailed prompt for transaction-related queries
        prompt = `As a financial AI assistant, analyze this transaction data and answer the following question: "${query}"

Transaction Data Summary:
- Total Transactions: ${context.summary.totalTransactions}
- Total Income: ${formatCurrency(totalIncome)}
- Total Expenses: ${formatCurrency(totalExpense)}
- Date Range: ${formatDateRange(context.summary.dateRange)}

Categories:
${formatCategories(context.summary.categories)}

Transfer Summary:
${formatTransferSummary(context.summary.transferSummary)}

Full Transaction List:
${formatTransactions(context.transactions)}

Please provide a clear and concise answer based on this data. If the question is about transfers, include both the recipient and the amount. If it's about spending patterns, include relevant statistics.`;
      } else {
        // Create a prompt for general financial advice
        prompt = `As a knowledgeable financial advisor, provide helpful advice for the following question: "${query}"

Consider the user's financial context:
- Monthly Income: ${formatCurrency(totalIncome)}
- Monthly Expenses: ${formatCurrency(totalExpense)}
- Top Spending Categories: ${context.summary.categories.slice(0, 3).map(c => c.category).join(', ')}

Based on this context, provide personalized financial advice that is:
1. Practical and actionable
2. Specific to their situation
3. Focused on improving their financial health
4. Including relevant tips, strategies, or recommendations
5. Explaining the reasoning behind the advice

If the advice involves specific financial products or services, include appropriate disclaimers.`;
      }

      // Generate response using Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        answer: text,
        relevantData: context
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fall back to basic processing if Gemini fails
    }
  }

  // Basic processing logic as fallback
  const normalizedQuery = query.toLowerCase();
  
  // If it's not a transaction-related query and Gemini failed, provide a generic response
  if (!normalizedQuery.includes('transfer') &&
      !normalizedQuery.includes('spend') &&
      !normalizedQuery.includes('expense') &&
      !normalizedQuery.includes('income') &&
      !normalizedQuery.includes('transaction') &&
      !normalizedQuery.includes('payment') &&
      !normalizedQuery.includes('category')) {
    return {
      answer: "I apologize, but I'm currently unable to provide general financial advice. To get the best advice, please make sure you have set up your Gemini API key in the settings. In the meantime, you can ask me specific questions about your transactions, spending patterns, or account activity.",
      relevantData: null
    };
  }

  // Helper function to extract date from query
  const extractDate = (query: string) => {
    const dateRegex = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\w+ \d{1,2},? \d{4})/i;
    const match = query.match(dateRegex);
    return match ? new Date(match[0]) : null;
  };

  // Helper function to find transactions by date
  const getTransactionsByDate = (date: Date) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.toDateString() === date.toDateString();
    });
  };

  // Helper function to find transactions by merchant
  const getTransactionsByMerchant = (merchantName: string) => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(merchantName.toLowerCase())
    );
  };

  // Process different types of queries
  if (normalizedQuery.includes('most') && normalizedQuery.includes('transfer')) {
    const summary = getTransferSummary(transactions);
    const topTransfer = summary.topTransfers[0];
    
    if (normalizedQuery.includes('amount')) {
      return {
        answer: `The largest transfer was ${formatCurrency(topTransfer.amount)} to ${topTransfer.recipient} on ${topTransfer.date.toLocaleDateString()}. Here are the top 5 transfers by amount:\n\n${
          summary.topTransfers.map((t, i) => 
            `${i + 1}. ${t.recipient}: ${formatCurrency(t.amount)} on ${t.date.toLocaleDateString()}`
          ).join('\n')
        }`,
        relevantData: summary.topTransfers
      };
    }
  }

  if (normalizedQuery.includes('total') && normalizedQuery.includes('transfer')) {
    const date = extractDate(query);
    if (date) {
      const dateTransactions = getTransactionsByDate(date);
      const total = dateTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        answer: `The total transfers on ${date.toLocaleDateString()} were ${formatCurrency(total)}`,
        relevantData: dateTransactions
      };
    } else {
      // If no date specified, return total of all transfers
      const summary = getTransferSummary(transactions);
      return {
        answer: `The total amount transferred was ${formatCurrency(summary.totalTransferAmount)} across ${summary.uniqueRecipients} different recipients.`,
        relevantData: summary
      };
    }
  }

  if (normalizedQuery.includes('transfer') && normalizedQuery.includes('to')) {
    const words = normalizedQuery.split(' ');
    const toIndex = words.indexOf('to');
    if (toIndex !== -1 && toIndex < words.length - 1) {
      const merchant = words.slice(toIndex + 1).join(' ');
      const merchantTransactions = getTransactionsByMerchant(merchant);
      const total = merchantTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        answer: `The total transfers to ${merchant} were ${formatCurrency(total)}`,
        relevantData: merchantTransactions
      };
    }
  }

  if (normalizedQuery.includes('total income')) {
    return {
      answer: `Your total income is ${formatCurrency(totalIncome)}`,
      relevantData: { totalIncome }
    };
  }

  if (normalizedQuery.includes('total expense') || normalizedQuery.includes('total spending')) {
    return {
      answer: `Your total expenses are ${formatCurrency(totalExpense)}`,
      relevantData: { totalExpense }
    };
  }

  if (normalizedQuery.includes('largest') || normalizedQuery.includes('biggest')) {
    const sortedTransactions = [...transactions].sort((a, b) => b.amount - a.amount);
    const largest = sortedTransactions[0];
    return {
      answer: `Your largest transaction was ${formatCurrency(largest.amount)} at ${largest.description} on ${new Date(largest.date).toLocaleDateString()}`,
      relevantData: largest
    };
  }

  if (normalizedQuery.includes('category')) {
    const categoryStats = getCategorySummary(transactions);
    return {
      answer: `Here's your spending by category:\n${
        categoryStats.map(stat => 
          `${stat.category}: ${formatCurrency(stat.amount)} (${stat.count} transactions)`
        ).join('\n')
      }`,
      relevantData: categoryStats
    };
  }

  // Default response for unrecognized queries
  return {
    answer: "I'm not sure how to answer that question. Try asking about transfers, income, expenses, or specific merchants.",
    relevantData: null
  };
}; 