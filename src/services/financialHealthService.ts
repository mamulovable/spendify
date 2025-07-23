import { BankTransaction } from "@/services/pdfService";
import { 
  FinancialHealthScore, 
  FinancialHealthMetric, 
  FinancialHealthInsight,
  GoalProgress,
  FinancialRecommendation,
  HistoricalScore
} from "@/types/financialHealth";

// Function to analyze financial health from transactions
export const analyzeFinancialHealth = (
  transactions: BankTransaction[]
): {
  financialHealth: FinancialHealthScore;
  metrics: FinancialHealthMetric[];
  insights: FinancialHealthInsight[];
} => {
  // Calculate income and expenses - prioritize type over amount
  // IMPORTANT: We have a special case where debit transactions have positive amounts
  const income = transactions
    .filter(t => t.type === 'credit' || (t.type !== 'debit' && t.amount > 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate savings rate
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  
  // Estimate debt-to-income ratio (simplified)
  // In a real app, we would have more accurate debt information
  const debtPayments = transactions
    .filter(t => 
      t.amount < 0 && 
      (t.category?.toLowerCase().includes('loan') || 
       t.category?.toLowerCase().includes('debt') || 
       t.description.toLowerCase().includes('loan') || 
       t.description.toLowerCase().includes('payment'))
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const debtToIncome = income > 0 ? (debtPayments / income) : 0;
  
  // Estimate emergency fund in months
  // Assuming average monthly expenses
  const dates = transactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
  
  const monthlyExpenses = expenses / Math.max(1, monthsDiff);
  const savings = Math.max(0, income - expenses);
  const emergencyFundMonths = monthlyExpenses > 0 ? savings / monthlyExpenses : 0;
  
  // Calculate overall financial health score
  let overallScore = 0;
  
  // Savings rate score (0-40 points)
  if (savingsRate >= 20) overallScore += 40;
  else if (savingsRate >= 15) overallScore += 35;
  else if (savingsRate >= 10) overallScore += 30;
  else if (savingsRate >= 5) overallScore += 20;
  else if (savingsRate > 0) overallScore += 10;
  
  // Debt-to-income score (0-30 points)
  if (debtToIncome <= 0.1) overallScore += 30;
  else if (debtToIncome <= 0.2) overallScore += 25;
  else if (debtToIncome <= 0.3) overallScore += 20;
  else if (debtToIncome <= 0.4) overallScore += 10;
  else if (debtToIncome <= 0.5) overallScore += 5;
  
  // Emergency fund score (0-30 points)
  if (emergencyFundMonths >= 6) overallScore += 30;
  else if (emergencyFundMonths >= 3) overallScore += 20;
  else if (emergencyFundMonths >= 1) overallScore += 10;
  else if (emergencyFundMonths > 0) overallScore += 5;
  
  // Generate mock goal progress
  const goalProgress: GoalProgress[] = [
    {
      goalId: '1',
      goalName: 'Emergency Fund',
      targetAmount: monthlyExpenses * 6, // 6 months of expenses
      currentAmount: savings,
      progressPercentage: Math.min(100, (savings / (monthlyExpenses * 6)) * 100)
    },
    {
      goalId: '2',
      goalName: 'Debt Repayment',
      targetAmount: debtPayments * 12, // Estimate annual debt payments
      currentAmount: debtPayments,
      progressPercentage: 8.33 // 1/12 of the way there (1 month)
    }
  ];
  
  // Generate recommendations
  const recommendations: FinancialRecommendation[] = [];
  
  if (savingsRate < 20) {
    recommendations.push({
      category: 'savings',
      description: 'Increase your savings rate to at least 20% of income',
      impact: 10,
      difficulty: savingsRate < 10 ? 'hard' : 'medium'
    });
  }
  
  if (debtToIncome > 0.3) {
    recommendations.push({
      category: 'debt',
      description: 'Reduce your debt-to-income ratio by paying down high-interest debt',
      impact: 15,
      difficulty: 'medium'
    });
  }
  
  if (emergencyFundMonths < 3) {
    recommendations.push({
      category: 'savings',
      description: 'Build an emergency fund covering at least 3 months of expenses',
      impact: 20,
      difficulty: emergencyFundMonths < 1 ? 'hard' : 'medium'
    });
  }
  
  // Add a spending recommendation based on highest expense category
  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0))
    .forEach(t => {
      const category = t.category || 'Uncategorized';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(t.amount);
    });
  
  const topExpenseCategory = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topExpenseCategory) {
    recommendations.push({
      category: 'spending',
      description: `Reduce spending in your highest expense category: ${topExpenseCategory[0]}`,
      impact: 5,
      difficulty: 'medium'
    });
  }
  
  // Generate historical scores (mock data)
  const historicalScores: HistoricalScore[] = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    
    // Generate a score that trends toward the current score
    const baseScore = Math.max(0, Math.min(100, overallScore - 10 + Math.random() * 20));
    const trendFactor = (5 - i) / 5; // 0 to 1 as we approach current date
    const score = Math.round(baseScore * (1 - trendFactor) + overallScore * trendFactor);
    
    historicalScores.push({
      date: date.toISOString().split('T')[0],
      score
    });
  }
  
  // Create financial health object
  const financialHealth: FinancialHealthScore = {
    userId: 'current-user', // This would be replaced with actual user ID
    overallScore,
    savingsRate,
    debtToIncome,
    emergencyFundMonths,
    goalProgress,
    recommendations,
    historicalScores
  };
  
  // Calculate metrics
  const metrics: FinancialHealthMetric[] = [
    {
      label: "Overall Health Score",
      value: overallScore,
      description: getScoreDescription(overallScore)
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description: "Percentage of income saved"
    },
    {
      label: "Debt-to-Income",
      value: `${(debtToIncome * 100).toFixed(1)}%`,
      description: "Ratio of debt payments to income"
    },
    {
      label: "Emergency Fund",
      value: `${emergencyFundMonths.toFixed(1)} months`,
      description: "Months of expenses covered by savings"
    }
  ];
  
  // Generate insights
  const insights = generateFinancialHealthInsights(financialHealth);
  
  return {
    financialHealth,
    metrics,
    insights
  };
};

// Helper function to get score description
const getScoreDescription = (score: number): string => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Needs Improvement";
  return "Poor";
};

// Helper function to generate financial health insights
const generateFinancialHealthInsights = (
  financialHealth: FinancialHealthScore
): FinancialHealthInsight[] => {
  const insights: FinancialHealthInsight[] = [];
  
  // Overall financial health insight
  let healthSeverity: "info" | "warning" | "critical" = "info";
  if (financialHealth.overallScore < 50) healthSeverity = "critical";
  else if (financialHealth.overallScore < 70) healthSeverity = "warning";
  
  insights.push({
    title: "Financial Health Overview",
    description: `Your overall financial health score is ${financialHealth.overallScore}/100, which is ${getScoreDescription(financialHealth.overallScore)}.`,
    actionItems: [
      "Review the recommendations to improve your score",
      "Focus on the highest impact areas first",
      "Track your progress over time"
    ],
    severity: healthSeverity
  });
  
  // Savings rate insight
  if (financialHealth.savingsRate < 10) {
    insights.push({
      title: "Low Savings Rate",
      description: `Your savings rate of ${financialHealth.savingsRate.toFixed(1)}% is below the recommended minimum of 10%.`,
      actionItems: [
        "Identify non-essential expenses that can be reduced",
        "Set up automatic transfers to savings accounts",
        "Look for ways to increase your income"
      ],
      severity: financialHealth.savingsRate < 5 ? "critical" : "warning"
    });
  } else if (financialHealth.savingsRate >= 20) {
    insights.push({
      title: "Strong Savings Rate",
      description: `Your savings rate of ${financialHealth.savingsRate.toFixed(1)}% is excellent and exceeds the recommended 20%.`,
      actionItems: [
        "Consider investing some of your savings for long-term growth",
        "Review your investment allocation to ensure it aligns with your goals",
        "Maintain your current savings habits"
      ],
      severity: "info"
    });
  }
  
  // Debt-to-income insight
  if (financialHealth.debtToIncome > 0.3) {
    insights.push({
      title: "High Debt-to-Income Ratio",
      description: `Your debt-to-income ratio of ${(financialHealth.debtToIncome * 100).toFixed(1)}% exceeds the recommended maximum of 30%.`,
      actionItems: [
        "Focus on paying down high-interest debt first",
        "Consider debt consolidation to lower interest rates",
        "Avoid taking on additional debt"
      ],
      severity: financialHealth.debtToIncome > 0.4 ? "critical" : "warning"
    });
  }
  
  // Emergency fund insight
  if (financialHealth.emergencyFundMonths < 3) {
    insights.push({
      title: "Insufficient Emergency Fund",
      description: `Your emergency fund covers ${financialHealth.emergencyFundMonths.toFixed(1)} months of expenses, below the recommended 3-6 months.`,
      actionItems: [
        "Prioritize building your emergency fund",
        "Set a goal to save at least 3 months of expenses",
        "Keep emergency funds in a liquid, easily accessible account"
      ],
      severity: financialHealth.emergencyFundMonths < 1 ? "critical" : "warning"
    });
  } else if (financialHealth.emergencyFundMonths >= 6) {
    insights.push({
      title: "Strong Emergency Fund",
      description: `Your emergency fund covers ${financialHealth.emergencyFundMonths.toFixed(1)} months of expenses, meeting the recommended 3-6 months.`,
      actionItems: [
        "Consider investing additional savings beyond your emergency fund",
        "Review your emergency fund allocation periodically",
        "Ensure your emergency fund keeps pace with any lifestyle changes"
      ],
      severity: "info"
    });
  }
  
  return insights;
};