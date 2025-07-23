import { BankTransaction } from "@/services/pdfService";
import { 
  RecurringExpense, 
  RecurringExpenseMetric, 
  RecurringExpenseInsight,
  RecurringPaymentTrend,
  AlternativeSuggestion
} from "@/types/recurringExpense";
import { v4 as uuidv4 } from "uuid";

// Function to detect recurring expenses from transactions
export const detectRecurringExpenses = (
  transactions: BankTransaction[]
): {
  recurringExpenses: RecurringExpense[];
  metrics: RecurringExpenseMetric[];
  insights: RecurringExpenseInsight[];
  trends: RecurringPaymentTrend[];
} => {
  // Group transactions by merchant and similar amounts
  const transactionGroups: Record<string, BankTransaction[]> = {};
  
  // Only consider expense transactions - prioritize type over amount
  // IMPORTANT: We have a special case where debit transactions have positive amounts
  const expenseTransactions = transactions.filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0));
  
  // Group by merchant name and similar amount
  expenseTransactions.forEach(transaction => {
    // Extract merchant name from description (simplified)
    const merchantName = transaction.description.split(' ')[0];
    
    // Round amount to nearest 10 to group similar amounts
    const roundedAmount = Math.round(Math.abs(transaction.amount) / 10) * 10;
    
    // Create a key combining merchant and amount
    const key = `${merchantName}-${roundedAmount}`;
    
    if (!transactionGroups[key]) {
      transactionGroups[key] = [];
    }
    
    transactionGroups[key].push(transaction);
  });
  
  // Filter groups with at least 2 transactions (potential recurring)
  const recurringGroups = Object.entries(transactionGroups)
    .filter(([_, group]) => group.length >= 2)
    .map(([key, group]) => {
      // Sort transactions by date
      const sortedTransactions = [...group].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      return {
        key,
        transactions: sortedTransactions
      };
    });
  
  // Analyze each group to determine if it's recurring and its frequency
  const recurringExpenses: RecurringExpense[] = [];
  
  recurringGroups.forEach(({ key, transactions }) => {
    // Extract merchant name from the key
    const merchantName = key.split('-')[0];
    
    // Calculate average amount
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const averageAmount = totalAmount / transactions.length;
    
    // Determine frequency by analyzing date patterns
    const dateDiffs: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i-1].date);
      const currDate = new Date(transactions[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      dateDiffs.push(diffDays);
    }
    
    // Calculate average days between charges
    const avgDiffDays = dateDiffs.reduce((sum, diff) => sum + diff, 0) / dateDiffs.length;
    
    // Determine frequency based on average days between charges
    let frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    if (avgDiffDays <= 10) {
      frequency = 'weekly';
    } else if (avgDiffDays <= 40) {
      frequency = 'monthly';
    } else if (avgDiffDays <= 100) {
      frequency = 'quarterly';
    } else {
      frequency = 'yearly';
    }
    
    // Get the last transaction date
    const lastTransaction = transactions[transactions.length - 1];
    const lastDate = new Date(lastTransaction.date);
    
    // Calculate next expected charge date based on frequency
    const nextDate = new Date(lastDate);
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    // Determine if this might be a forgotten subscription
    // If it's been more than 2x the expected interval since last charge
    const daysSinceLastCharge = Math.round((new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const isForgotten = daysSinceLastCharge > (avgDiffDays * 2);
    
    // Generate alternative suggestions for common subscriptions
    const alternatives: AlternativeSuggestion[] = [];
    
    // Check for streaming services
    if (merchantName.toLowerCase().includes('netflix')) {
      alternatives.push({
        name: 'Disney+',
        price: 7.99,
        savingsAmount: averageAmount - 7.99,
        savingsPercentage: Math.round(((averageAmount - 7.99) / averageAmount) * 100),
        link: 'https://www.disneyplus.com'
      });
      alternatives.push({
        name: 'Hulu',
        price: 5.99,
        savingsAmount: averageAmount - 5.99,
        savingsPercentage: Math.round(((averageAmount - 5.99) / averageAmount) * 100),
        link: 'https://www.hulu.com'
      });
    } else if (merchantName.toLowerCase().includes('spotify')) {
      alternatives.push({
        name: 'Apple Music',
        price: 9.99,
        savingsAmount: averageAmount - 9.99,
        savingsPercentage: Math.round(((averageAmount - 9.99) / averageAmount) * 100),
        link: 'https://www.apple.com/apple-music/'
      });
      alternatives.push({
        name: 'YouTube Music',
        price: 9.99,
        savingsAmount: averageAmount - 9.99,
        savingsPercentage: Math.round(((averageAmount - 9.99) / averageAmount) * 100),
        link: 'https://music.youtube.com/'
      });
    }
    
    // Create recurring expense object
    const recurringExpense: RecurringExpense = {
      id: uuidv4(),
      userId: 'current-user', // This would be replaced with actual user ID
      name: `${merchantName} Subscription`,
      merchantId: merchantName.toLowerCase(),
      merchantName,
      amount: averageAmount,
      frequency,
      lastCharged: lastTransaction.date,
      nextExpectedCharge: nextDate.toISOString().split('T')[0],
      category: lastTransaction.category || 'Subscription',
      isActive: !isForgotten,
      isForgotten,
      alternativeSuggestions: alternatives.length > 0 ? alternatives : undefined,
      transactions: transactions.map(t => t.id || uuidv4())
    };
    
    recurringExpenses.push(recurringExpense);
  });
  
  // Sort recurring expenses by amount (highest first)
  recurringExpenses.sort((a, b) => b.amount - a.amount);
  
  // Calculate metrics
  const totalRecurringAmount = recurringExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyRecurringAmount = recurringExpenses
    .filter(expense => expense.frequency === 'monthly')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const forgottenSubscriptions = recurringExpenses.filter(expense => expense.isForgotten).length;
  
  const metrics: RecurringExpenseMetric[] = [
    {
      label: "Total Subscriptions",
      value: recurringExpenses.length,
      description: "Recurring expenses detected"
    },
    {
      label: "Monthly Cost",
      value: `₦${monthlyRecurringAmount.toLocaleString()}`,
      description: "Total monthly subscription costs"
    },
    {
      label: "Forgotten Subscriptions",
      value: forgottenSubscriptions,
      description: "Potentially inactive subscriptions"
    },
    {
      label: "Annual Cost",
      value: `₦${(monthlyRecurringAmount * 12).toLocaleString()}`,
      description: "Estimated annual subscription costs"
    }
  ];
  
  // Generate insights
  const insights: RecurringExpenseInsight[] = [];
  
  if (recurringExpenses.length > 0) {
    insights.push({
      title: "Subscription Overview",
      description: `You have ${recurringExpenses.length} recurring expenses totaling approximately ₦${totalRecurringAmount.toLocaleString()} per month.`,
      actionItems: [
        "Review your subscriptions regularly to ensure you're using all services",
        "Consider consolidating similar subscriptions to save money",
        "Set calendar reminders for annual subscription renewals to evaluate continued need"
      ],
      severity: "info"
    });
  }
  
  if (forgottenSubscriptions > 0) {
    insights.push({
      title: "Forgotten Subscriptions Detected",
      description: `We've identified ${forgottenSubscriptions} subscriptions that may be forgotten or unused.`,
      actionItems: [
        "Cancel any subscriptions you no longer use",
        "Contact providers to request refunds for unused services",
        "Set up subscription tracking to avoid future forgotten charges"
      ],
      severity: "warning"
    });
  }
  
  // Check for potential savings
  const expensesWithAlternatives = recurringExpenses.filter(expense => 
    expense.alternativeSuggestions && expense.alternativeSuggestions.length > 0
  );
  
  if (expensesWithAlternatives.length > 0) {
    insights.push({
      title: "Potential Savings Opportunities",
      description: `We've identified ${expensesWithAlternatives.length} subscriptions with potential cost-saving alternatives.`,
      actionItems: [
        "Compare features between your current services and alternatives",
        "Consider rotating subscriptions instead of maintaining multiple similar services",
        "Look for bundle deals that may reduce overall costs"
      ],
      severity: "info"
    });
  }
  
  // Generate trend data (simplified for this implementation)
  const trends: RecurringPaymentTrend[] = [];
  
  // Get unique months from transactions
  const months = new Set<string>();
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.add(monthKey);
  });
  
  // Sort months chronologically
  const sortedMonths = Array.from(months).sort();
  
  // Calculate recurring expense total for each month
  sortedMonths.forEach(month => {
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    
    // Filter transactions for this month
    const monthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date);
      return date >= monthStart && date < monthEnd;
    });
    
    // Calculate recurring expenses for this month (simplified)
    const recurringAmount = monthTransactions
      .filter(transaction => {
        // Check if this transaction matches any of our detected recurring expenses
        return recurringExpenses.some(expense => 
          transaction.description.includes(expense.merchantName) && 
          Math.abs(transaction.amount) >= expense.amount * 0.9 && 
          Math.abs(transaction.amount) <= expense.amount * 1.1
        );
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
    
    trends.push({
      month,
      amount: recurringAmount
    });
  });
  
  return {
    recurringExpenses,
    metrics,
    insights,
    trends
  };
};