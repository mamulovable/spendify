export interface SavedAnalysis {
  id: string;
  name: string;
  date: string;
  totalIncome: number;
  totalExpense: number;
  categories: {
    category: string;
    amount: number;
    count: number;
  }[];
  transactions: {
    date: string;
    description: string;
    amount: number;
    category?: string;
  }[];
} 