import { supabase } from '@/lib/supabase';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category: string;
  allocated_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetAlert {
  id: string;
  budget_category_id: string;
  threshold_percentage: number;
  is_triggered: boolean;
  created_at: string;
}

export interface BudgetWithCategories extends Budget {
  categories: (BudgetCategory & {
    spent_amount: number;
    percentage: number;
  })[];
}

class BudgetService {
  async getBudgets(userId: string): Promise<BudgetWithCategories[]> {
    try {
      // Get user's budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (budgetsError) throw budgetsError;
      
      // For each budget, get its categories
      const budgetsWithCategories = await Promise.all(
        budgetsData.map(async (budget) => {
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('budget_categories')
            .select('*')
            .eq('budget_id', budget.id);
          
          if (categoriesError) throw categoriesError;
          
          // Calculate spent amount for each category
          const categoriesWithSpending = await Promise.all(
            categoriesData.map(async (category) => {
              // Get transactions for this category within budget period
              const { data: transactions, error: transactionsError } = await supabase
                .from('transactions')
                .select('amount')
                .eq('category', category.category)
                .eq('type', 'expense')
                .eq('user_id', userId)
                .gte('date', budget.start_date)
                .lte('date', budget.end_date || new Date().toISOString().split('T')[0]);
              
              if (transactionsError) throw transactionsError;
              
              const spent_amount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
              const percentage = (spent_amount / category.allocated_amount) * 100;
              
              return {
                ...category,
                spent_amount,
                percentage
              };
            })
          );
          
          return {
            ...budget,
            categories: categoriesWithSpending
          };
        })
      );
      
      return budgetsWithCategories;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }

  async getBudget(budgetId: string): Promise<BudgetWithCategories> {
    try {
      // Fetch budget details
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();
      
      if (budgetError) throw budgetError;
      
      // Fetch budget categories
      const { data: categories, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId);
      
      if (categoriesError) throw categoriesError;
      
      // Calculate spent amount for each category
      const categoriesWithSpending = await Promise.all(
        categories.map(async (category) => {
          // Get transactions for this category within budget period
          const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('category', category.category)
            .eq('type', 'expense')
            .gte('date', budget.start_date)
            .lte('date', budget.end_date || new Date().toISOString().split('T')[0]);
          
          if (transactionsError) throw transactionsError;
          
          const spent_amount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
          const percentage = (spent_amount / category.allocated_amount) * 100;
          
          return {
            ...category,
            spent_amount,
            percentage
          };
        })
      );
      
      return {
        ...budget,
        categories: categoriesWithSpending
      };
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw error;
    }
  }

  async createBudget(
    userId: string,
    budgetData: {
      name: string;
      amount: number;
      period: string;
      start_date: string;
      end_date?: string | null;
      categories: { category: string; allocated_amount: number }[];
    }
  ): Promise<string> {
    try {
      // Create new budget
      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          name: budgetData.name,
          amount: budgetData.amount,
          period: budgetData.period,
          start_date: budgetData.start_date,
          end_date: budgetData.end_date || null
        })
        .select()
        .single();
      
      if (budgetError) throw budgetError;
      
      // Insert categories
      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(
          budgetData.categories.map(cat => ({
            budget_id: newBudget.id,
            category: cat.category,
            allocated_amount: cat.allocated_amount
          }))
        );
      
      if (categoriesError) throw categoriesError;
      
      return newBudget.id;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  async updateBudget(
    budgetId: string,
    budgetData: {
      name: string;
      amount: number;
      period: string;
      start_date: string;
      end_date?: string | null;
      categories: { id?: string; category: string; allocated_amount: number }[];
    }
  ): Promise<void> {
    try {
      // Update budget
      const { error: budgetError } = await supabase
        .from('budgets')
        .update({
          name: budgetData.name,
          amount: budgetData.amount,
          period: budgetData.period,
          start_date: budgetData.start_date,
          end_date: budgetData.end_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId);
      
      if (budgetError) throw budgetError;
      
      // Delete existing categories
      const { error: deleteError } = await supabase
        .from('budget_categories')
        .delete()
        .eq('budget_id', budgetId);
      
      if (deleteError) throw deleteError;
      
      // Insert updated categories
      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(
          budgetData.categories.map(cat => ({
            budget_id: budgetId,
            category: cat.category,
            allocated_amount: cat.allocated_amount
          }))
        );
      
      if (categoriesError) throw categoriesError;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  async deleteBudget(budgetId: string): Promise<void> {
    try {
      // Delete budget (categories will be deleted via cascade)
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  async checkBudgetAlerts(userId: string): Promise<{
    categoryId: string;
    budgetId: string;
    budgetName: string;
    categoryName: string;
    percentage: number;
    threshold: number;
  }[]> {
    try {
      // Get all active budgets
      const budgets = await this.getBudgets(userId);
      
      // Find categories that are approaching or exceeding their thresholds
      const alerts = [];
      
      for (const budget of budgets) {
        for (const category of budget.categories) {
          // Check if spending is over 80% of allocation
          if (category.percentage >= 80) {
            alerts.push({
              categoryId: category.id,
              budgetId: budget.id,
              budgetName: budget.name,
              categoryName: category.category,
              percentage: category.percentage,
              threshold: 80
            });
          }
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('Error checking budget alerts:', error);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();