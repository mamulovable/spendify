import { supabase } from '@/lib/supabase';
import { FinancialGoal } from '@/types/supabase';

export interface GoalSuggestion {
  template_id: string;
  name: string;
  description: string;
  suggested_amount: number;
  suggested_deadline: string;
  category_id: string;
  type: string;
  tips: string[];
}

export interface GoalProgress {
  amount: number;
  recorded_at: string;
  notes?: string;
}

export const financialGoalsService = {
  async addGoal(goal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate initial status based on deadline
      const now = new Date();
      const deadline = new Date(goal.deadline);
      const status = deadline < now ? 'overdue' : 'in_progress';
      const progress_percentage = 0;

      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount || 0,
          deadline: goal.deadline,
          type: goal.type,
          category_id: goal.category_id,
          notes: goal.notes,
          user_id: user.id,
          status: status,
          progress_percentage: progress_percentage
        }])
        .select(`
          *,
          category:goal_categories(*)
        `)
        .single();

      if (error) throw error;
      console.log('Added goal with status:', status);
      return data;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  async getGoals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, get the goals with their categories
      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select(`
          *,
          category:goal_categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Then, get the milestones for these goals
      const goalIds = goalsData.map(goal => goal.id);
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('goal_milestones')
        .select('*')
        .in('goal_id', goalIds);

      if (milestonesError) throw milestonesError;

      // Combine the data and set default statuses
      const goalsWithMilestones = goalsData.map(goal => {
        const milestones = milestonesData.filter(m => m.goal_id === goal.id);
        
        // Set default status based on progress and deadline
        let status = goal.status;
        if (!status) {
          const now = new Date();
          const deadline = new Date(goal.deadline);
          const progress = (goal.current_amount / goal.target_amount) * 100;
          
          if (progress >= 100) {
            status = 'completed';
          } else if (deadline < now) {
            status = 'overdue';
          } else {
            status = 'in_progress';
          }
          
          // Update the goal in the database with the new status
          this.updateGoal(goal.id, { status }).catch(err => 
            console.error('Error updating goal status:', err)
          );
        }
        
        return {
          ...goal,
          status,
          milestones
        };
      });

      return goalsWithMilestones;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
    return data;
  },

  async deleteGoal(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  async updateProgress(id: string, currentAmount: number): Promise<FinancialGoal> {
    return this.updateGoal(id, { current_amount: currentAmount });
  },

  async updateGoalProgress(goalId: string, amount: number, notes?: string) {
    try {
      const { data, error } = await supabase.rpc('update_goal_progress', {
        p_goal_id: goalId,
        p_amount: amount,
        p_notes: notes
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  },

  async getGoalSuggestions(income?: number, expenses?: number): Promise<GoalSuggestion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // If income and expenses are not provided, try to fetch from transactions
      if (!income || !expenses) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('amount, type')
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
          .eq('user_id', user.id);

        if (transactions) {
          income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        }
      }

      const monthlyIncome = income || 5000; // Default if no data
      const monthlyExpenses = expenses || 3000; // Default if no data
      const monthlySavings = monthlyIncome - monthlyExpenses;
      
      const suggestions: GoalSuggestion[] = [
        {
          template_id: '1',
          name: 'Emergency Fund',
          description: `Build ${Math.round(monthlyExpenses * 6)} as a 6-month emergency fund`,
          suggested_amount: Math.round(monthlyExpenses * 6),
          suggested_deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          category_id: '1',
          type: 'emergency',
          tips: [
            'Aim to save 10-20% of your monthly income',
            'Keep this money in a high-yield savings account',
            'Only use for true emergencies'
          ]
        },
        {
          template_id: '2',
          name: 'Retirement Fund',
          description: 'Start building your retirement nest egg',
          suggested_amount: Math.round(monthlyIncome * 12 * 1), // 1 year of income
          suggested_deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          category_id: '2',
          type: 'retirement',
          tips: [
            'Consider tax-advantaged accounts like 401(k) or IRA',
            'Aim to save 15% of your income for retirement',
            'Diversify your investments'
          ]
        }
      ];

      // Add debt payoff goal if expenses are high relative to income
      if (monthlyExpenses > monthlyIncome * 0.7) {
        suggestions.push({
          template_id: '3',
          name: 'Debt Reduction',
          description: 'Reduce your monthly expenses by paying off high-interest debt',
          suggested_amount: Math.round(monthlyExpenses * 3),
          suggested_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
          category_id: '3',
          type: 'debt',
          tips: [
            'Focus on high-interest debt first',
            'Consider debt consolidation',
            'Create a debt payoff strategy'
          ]
        });
      }

      // Add savings goal if there's good monthly savings potential
      if (monthlySavings > monthlyIncome * 0.2) {
        suggestions.push({
          template_id: '4',
          name: 'Investment Portfolio',
          description: 'Build a diversified investment portfolio',
          suggested_amount: Math.round(monthlySavings * 12), // 1 year of savings
          suggested_deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          category_id: '4',
          type: 'investment',
          tips: [
            'Start with low-cost index funds',
            'Consider dollar-cost averaging',
            'Rebalance periodically'
          ]
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting goal suggestions:', error);
      throw error;
    }
  },

  async getGoalCategories() {
    try {
      const { data, error } = await supabase
        .from('goal_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching goal categories:', error);
      throw error;
    }
  },

  async addMilestone(goalId: string, milestone: { amount: number; target_date: string; description?: string }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goal_milestones')
        .insert([{
          goal_id: goalId,
          amount: milestone.amount,
          target_date: milestone.target_date,
          description: milestone.description,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  },

  async updateMilestone(milestoneId: string, updates: { achieved_date?: string; description?: string }) {
    try {
      const { data, error } = await supabase
        .from('goal_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  async getGoalProgressHistory(goalId: string): Promise<GoalProgress[]> {
    try {
      const { data, error } = await supabase
        .from('goal_progress_history')
        .select('*')
        .eq('goal_id', goalId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching goal progress history:', error);
      throw error;
    }
  }
}; 