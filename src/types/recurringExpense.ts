export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCharged: string;
  nextExpectedCharge: string;
  category: string;
  isActive: boolean;
  isForgotten: boolean; // Flagged as potentially forgotten
  alternativeSuggestions?: AlternativeSuggestion[];
  transactions: string[]; // Array of transaction IDs
}

export interface AlternativeSuggestion {
  name: string;
  price: number;
  savingsAmount: number;
  savingsPercentage: number;
  link?: string;
}

export interface RecurringExpenseMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface RecurringExpenseInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}

export interface RecurringPaymentTrend {
  month: string;
  amount: number;
}