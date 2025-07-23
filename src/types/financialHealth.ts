export interface FinancialHealthScore {
  userId: string;
  overallScore: number; // 0-100
  creditUtilization?: number; // Percentage
  savingsRate: number; // Percentage
  debtToIncome: number; // Ratio
  emergencyFundMonths: number;
  goalProgress: GoalProgress[];
  recommendations: FinancialRecommendation[];
  historicalScores: HistoricalScore[];
}

export interface GoalProgress {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
}

export interface FinancialRecommendation {
  category: 'savings' | 'debt' | 'spending' | 'income' | 'investment';
  description: string;
  impact: number; // Potential score improvement
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HistoricalScore {
  date: string;
  score: number;
}

export interface FinancialHealthMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface FinancialHealthInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}