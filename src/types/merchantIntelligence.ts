export interface MerchantData {
  id: string;
  name: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  frequencyPerMonth: number;
  lastVisited: string;
  category: string;
  seasonalPattern?: SeasonalPattern[];
  priceComparisons?: PriceComparison[];
  loyaltyPrograms?: LoyaltyProgram[];
}

export interface SeasonalPattern {
  quarter: number;
  spending: number;
}

export interface PriceComparison {
  competitor: string;
  potentialSavings: number;
  savingsPercentage: number;
}

export interface LoyaltyProgram {
  name: string;
  description: string;
  potentialSavings: number;
  link?: string;
}

export interface MerchantMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface MerchantInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}