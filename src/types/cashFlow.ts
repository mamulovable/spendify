export interface CashFlowData {
  month: string; // YYYY-MM format
  income: number;
  expenses: number;
  netCashFlow: number;
  predictedIncome?: number;
  predictedExpenses?: number;
  predictedNetCashFlow?: number;
  isPrediction: boolean;
}

export interface CashFlowGap {
  startDate: string;
  endDate: string;
  amount: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface CashFlowMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface CashFlowInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}

export interface BudgetRecommendation {
  category: string;
  currentSpending: number;
  recommendedSpending: number;
  savingsAmount: number;
  savingsPercentage: number;
  reason: string;
}