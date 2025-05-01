export interface FinancialGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  type: 'savings' | 'budget' | 'emergency' | 'retirement';
  category_id: string;
  notes?: string;
  progress_percentage: number;
  status: 'completed' | 'overdue' | 'urgent' | 'in_progress';
  created_at: string;
  updated_at: string;
  last_updated_by?: string;
  milestones?: Array<{
    id: string;
    amount: number;
    target_date: string;
    achieved_date?: string;
    description?: string;
  }>;
} 