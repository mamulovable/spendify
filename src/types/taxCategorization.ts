export interface TaxCategory {
  id: string;
  name: string;
  description: string;
  isDeductible: boolean;
  totalAmount: number;
  transactionCount: number;
}

export interface TaxDeduction {
  id: string;
  transactionId: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  confidence: number; // 0-100
  hasReceipt: boolean;
  receiptId?: string;
  notes?: string;
}

export interface TaxMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface TaxInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}