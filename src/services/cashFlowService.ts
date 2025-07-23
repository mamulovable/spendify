import { BankTransaction } from "@/services/pdfService";
import { 
  CashFlowData, 
  CashFlowGap, 
  CashFlowMetric, 
  CashFlowInsight,
  BudgetRecommendation
} from "@/types/cashFlow";

// Function to analyze cash flow from transactions
export const analyzeCashFlow = (
  transactions: BankTransaction[]
): {
  cashFlowData: CashFlowData[];
  cashFlowGaps: CashFlowGap[];
  metrics: CashFlowMetric[];
  insights: CashFlowInsight[];
  budgetRecommendations: BudgetRecommendation[];
} => {
  // Group transactions by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }
    
    // IMPORTANT: We have a special case where debit transactions have positive amounts
    // So we need to prioritize the transaction type over the amount
    if (transaction.type === 'credit') {
      // Credit transactions are always income
      const amount = Math.abs(transaction.amount);
      monthlyData[monthKey].income += amount;
    } else if (transaction.type === 'debit') {
      // Debit transactions are always expenses
      const amount = Math.abs(transaction.amount);
      monthlyData[monthKey].expenses += amount;
    } else {
      // If no type is specified, use the amount to determine
      if (transaction.amount >= 0) {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      }
    }
  });
  
  // Convert to array and sort by month
  const sortedMonths = Object.keys(monthlyData).sort();
  
  // Create cash flow data
  const cashFlowData: CashFlowData[] = sortedMonths.map(month => {
    const { income, expenses } = monthlyData[month];
    return {
      month,
      income,
      expenses,
      netCashFlow: income - expenses,
      isPrediction: false
    };
  });
  
  // Generate predictions for the next 3 months
  const predictions = generatePredictions(cashFlowData);
  
  // Combine actual and predicted data
  const combinedCashFlowData = [...cashFlowData, ...predictions];
  
  // Identify cash flow gaps
  const cashFlowGaps = identifyCashFlowGaps(combinedCashFlowData);
  
  // Calculate metrics
  const metrics = calculateCashFlowMetrics(cashFlowData);
  
  // Generate insights
  const insights = generateCashFlowInsights(cashFlowData, cashFlowGaps);
  
  // Generate budget recommendations
  const budgetRecommendations = generateBudgetRecommendations(transactions);
  
  return {
    cashFlowData: combinedCashFlowData,
    cashFlowGaps,
    metrics,
    insights,
    budgetRecommendations
  };
};

// Function to generate predictions for the next 3 months
const generatePredictions = (cashFlowData: CashFlowData[]): CashFlowData[] => {
  if (cashFlowData.length === 0) return [];
  
  // Calculate averages from the last 3 months (or fewer if not available)
  const recentMonths = cashFlowData.slice(-Math.min(3, cashFlowData.length));
  
  const avgIncome = recentMonths.reduce((sum, data) => sum + data.income, 0) / recentMonths.length;
  const avgExpenses = recentMonths.reduce((sum, data) => sum + data.expenses, 0) / recentMonths.length;
  
  // Get the last month
  const lastMonth = cashFlowData[cashFlowData.length - 1].month;
  const [lastYear, lastMonthNum] = lastMonth.split('-').map(Number);
  
  // Generate predictions for the next 3 months
  const predictions: CashFlowData[] = [];
  
  for (let i = 1; i <= 3; i++) {
    let year = lastYear;
    let month = lastMonthNum + i;
    
    // Handle year rollover
    if (month > 12) {
      month -= 12;
      year += 1;
    }
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    // Add some randomness to predictions for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    
    const predictedIncome = avgIncome * randomFactor;
    const predictedExpenses = avgExpenses * randomFactor;
    
    predictions.push({
      month: monthKey,
      income: 0,
      expenses: 0,
      netCashFlow: 0,
      predictedIncome,
      predictedExpenses,
      predictedNetCashFlow: predictedIncome - predictedExpenses,
      isPrediction: true
    });
  }
  
  return predictions;
};

// Function to identify cash flow gaps
const identifyCashFlowGaps = (cashFlowData: CashFlowData[]): CashFlowGap[] => {
  const gaps: CashFlowGap[] = [];
  
  // Look for consecutive months with negative net cash flow
  let gapStart: CashFlowData | null = null;
  let gapAmount = 0;
  
  cashFlowData.forEach((data, index) => {
    const netCashFlow = data.isPrediction 
      ? (data.predictedNetCashFlow || 0) 
      : data.netCashFlow;
    
    if (netCashFlow < 0) {
      if (!gapStart) {
        gapStart = data;
      }
      gapAmount += Math.abs(netCashFlow);
    } else if (gapStart) {
      // End of a gap
      const startDate = gapStart.month;
      const endDate = cashFlowData[index - 1].month;
      
      // Determine severity based on gap amount and duration
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (gapAmount > 100000) severity = 'high';
      else if (gapAmount > 50000) severity = 'medium';
      
      // Generate recommendation
      let recommendation = '';
      if (severity === 'high') {
        recommendation = 'Consider reducing non-essential expenses and building an emergency fund.';
      } else if (severity === 'medium') {
        recommendation = 'Monitor your spending in discretionary categories to improve cash flow.';
      } else {
        recommendation = 'Minor cash flow gap detected. Consider small adjustments to spending.';
      }
      
      gaps.push({
        startDate,
        endDate,
        amount: gapAmount,
        severity,
        recommendation
      });
      
      // Reset for next gap
      gapStart = null;
      gapAmount = 0;
    }
  });
  
  // Check if we ended with an ongoing gap
  if (gapStart) {
    const startDate = gapStart.month;
    const endDate = cashFlowData[cashFlowData.length - 1].month;
    
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (gapAmount > 100000) severity = 'high';
    else if (gapAmount > 50000) severity = 'medium';
    
    let recommendation = '';
    if (severity === 'high') {
      recommendation = 'Significant ongoing cash flow gap detected. Consider immediate budget adjustments.';
    } else if (severity === 'medium') {
      recommendation = 'Ongoing cash flow gap detected. Review your budget for potential savings.';
    } else {
      recommendation = 'Minor ongoing cash flow gap detected. Monitor your spending closely.';
    }
    
    gaps.push({
      startDate,
      endDate,
      amount: gapAmount,
      severity,
      recommendation
    });
  }
  
  return gaps;
};

// Function to calculate cash flow metrics
const calculateCashFlowMetrics = (cashFlowData: CashFlowData[]): CashFlowMetric[] => {
  if (cashFlowData.length === 0) return [];
  
  // Calculate total income and expenses
  const totalIncome = cashFlowData.reduce((sum, data) => sum + data.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, data) => sum + data.expenses, 0);
  const netCashFlow = totalIncome - totalExpenses;
  
  // Calculate average monthly income and expenses
  const avgMonthlyIncome = totalIncome / cashFlowData.length;
  const avgMonthlyExpenses = totalExpenses / cashFlowData.length;
  
  // Calculate income-to-expense ratio
  const incomeToExpenseRatio = totalIncome / totalExpenses;
  
  // Count months with positive and negative cash flow
  const positiveMonths = cashFlowData.filter(data => data.netCashFlow > 0).length;
  const negativeMonths = cashFlowData.filter(data => data.netCashFlow < 0).length;
  
  return [
    {
      label: "Average Monthly Income",
      value: `₦${avgMonthlyIncome.toLocaleString()}`,
      description: "Average income per month"
    },
    {
      label: "Average Monthly Expenses",
      value: `₦${avgMonthlyExpenses.toLocaleString()}`,
      description: "Average expenses per month"
    },
    {
      label: "Income-to-Expense Ratio",
      value: incomeToExpenseRatio.toFixed(2),
      description: "Ratio of income to expenses"
    },
    {
      label: "Cash Flow Health",
      value: `${positiveMonths}/${cashFlowData.length}`,
      description: `${positiveMonths} months with positive cash flow`
    }
  ];
};

// Function to generate cash flow insights
const generateCashFlowInsights = (
  cashFlowData: CashFlowData[],
  cashFlowGaps: CashFlowGap[]
): CashFlowInsight[] => {
  const insights: CashFlowInsight[] = [];
  
  // Overall cash flow health insight
  const positiveMonths = cashFlowData.filter(data => data.netCashFlow > 0).length;
  const totalMonths = cashFlowData.length;
  const cashFlowHealthPercentage = (positiveMonths / totalMonths) * 100;
  
  let healthSeverity: "info" | "warning" | "critical" = "info";
  if (cashFlowHealthPercentage < 50) healthSeverity = "critical";
  else if (cashFlowHealthPercentage < 75) healthSeverity = "warning";
  
  insights.push({
    title: "Cash Flow Health Overview",
    description: `You had positive cash flow in ${positiveMonths} out of ${totalMonths} months (${cashFlowHealthPercentage.toFixed(0)}%).`,
    actionItems: [
      "Aim for positive cash flow every month",
      "Build an emergency fund for months with negative cash flow",
      "Review your budget regularly to ensure income exceeds expenses"
    ],
    severity: healthSeverity
  });
  
  // Cash flow gaps insight
  if (cashFlowGaps.length > 0) {
    const highSeverityGaps = cashFlowGaps.filter(gap => gap.severity === 'high').length;
    
    let gapSeverity: "info" | "warning" | "critical" = "info";
    if (highSeverityGaps > 0) gapSeverity = "critical";
    else if (cashFlowGaps.length > 1) gapSeverity = "warning";
    
    insights.push({
      title: "Cash Flow Gaps Detected",
      description: `We identified ${cashFlowGaps.length} period(s) where expenses exceeded income, including ${highSeverityGaps} high-severity gap(s).`,
      actionItems: [
        "Review the identified cash flow gaps and their recommendations",
        "Plan ahead for periods with expected higher expenses",
        "Consider building a buffer for months with negative cash flow"
      ],
      severity: gapSeverity
    });
  }
  
  // Income stability insight
  if (cashFlowData.length >= 3) {
    const incomes = cashFlowData.map(data => data.income);
    const avgIncome = incomes.reduce((sum, income) => sum + income, 0) / incomes.length;
    
    // Calculate income volatility (coefficient of variation)
    const incomeVariance = incomes.reduce((sum, income) => sum + Math.pow(income - avgIncome, 2), 0) / incomes.length;
    const incomeStdDev = Math.sqrt(incomeVariance);
    const incomeVolatility = (incomeStdDev / avgIncome) * 100;
    
    let volatilitySeverity: "info" | "warning" | "critical" = "info";
    if (incomeVolatility > 50) volatilitySeverity = "critical";
    else if (incomeVolatility > 25) volatilitySeverity = "warning";
    
    insights.push({
      title: "Income Stability Analysis",
      description: `Your income volatility is ${incomeVolatility.toFixed(1)}%. ${
        incomeVolatility > 25 
          ? "This indicates significant fluctuations in your monthly income." 
          : "Your income appears relatively stable month-to-month."
      }`,
      actionItems: [
        "Consider building a larger emergency fund to handle income fluctuations",
        "Look for ways to stabilize income if volatility is high",
        "Budget based on your lowest income month rather than the average"
      ],
      severity: volatilitySeverity
    });
  }
  
  return insights;
};

// Function to generate budget recommendations
const generateBudgetRecommendations = (transactions: BankTransaction[]): BudgetRecommendation[] => {
  // Group expenses by category
  const categoryExpenses: Record<string, number> = {};
  
  // Only consider expense transactions - prioritize type over amount
  // IMPORTANT: We have a special case where debit transactions have positive amounts
  const expenseTransactions = transactions.filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0));
  
  // Calculate total expenses
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Group by category
  expenseTransactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized';
    if (!categoryExpenses[category]) {
      categoryExpenses[category] = 0;
    }
    categoryExpenses[category] += Math.abs(transaction.amount);
  });
  
  // Calculate category percentages
  const categoryPercentages: Record<string, number> = {};
  Object.entries(categoryExpenses).forEach(([category, amount]) => {
    categoryPercentages[category] = (amount / totalExpenses) * 100;
  });
  
  // Define recommended percentages for common categories
  const recommendedPercentages: Record<string, { percentage: number; reason: string }> = {
    'Housing': { percentage: 30, reason: 'Housing should typically be around 30% of expenses' },
    'Food & Dining': { percentage: 15, reason: 'Food expenses should be around 15% of your budget' },
    'Transportation': { percentage: 10, reason: 'Transportation costs should be around 10% of expenses' },
    'Entertainment': { percentage: 5, reason: 'Entertainment should be limited to around 5% of expenses' },
    'Shopping': { percentage: 5, reason: 'Discretionary shopping should be around 5% of expenses' },
    'Travel': { percentage: 5, reason: 'Travel expenses should be around 5% of your budget' }
  };
  
  // Generate recommendations for categories that exceed recommended percentages
  const recommendations: BudgetRecommendation[] = [];
  
  Object.entries(categoryPercentages).forEach(([category, percentage]) => {
    if (recommendedPercentages[category] && percentage > recommendedPercentages[category].percentage) {
      const currentSpending = categoryExpenses[category];
      const recommendedPercentage = recommendedPercentages[category].percentage;
      const recommendedSpending = (totalExpenses * recommendedPercentage) / 100;
      const savingsAmount = currentSpending - recommendedSpending;
      const savingsPercentage = (savingsAmount / currentSpending) * 100;
      
      recommendations.push({
        category,
        currentSpending,
        recommendedSpending,
        savingsAmount,
        savingsPercentage,
        reason: recommendedPercentages[category].reason
      });
    }
  });
  
  // Sort by potential savings amount (highest first)
  return recommendations.sort((a, b) => b.savingsAmount - a.savingsAmount);
};