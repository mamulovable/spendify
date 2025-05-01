import { supabase } from '@/lib/supabase';
import { generateText } from './geminiProxyService';

// Interface for transaction data
interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

// Interface for financial goal data
interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: string;
}

// Function to format user data for the AI prompt
const formatUserData = (transactions: Transaction[], goals: FinancialGoal[]) => {
  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  // Sort categories by amount
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));
  
  // Format goals
  const formattedGoals = goals.map(goal => ({
    title: goal.title,
    target: goal.target_amount,
    current: goal.current_amount,
    progress: (goal.current_amount / goal.target_amount) * 100,
    deadline: goal.deadline,
    category: goal.category
  }));
  
  return {
    totalIncome,
    totalExpenses,
    savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    topExpenseCategories,
    goals: formattedGoals
  };
};

export const geminiService = {
  async getResponse(question: string): Promise<string> {
    try {
      // Get user's transaction data if available
      const { data: { user } } = await supabase.auth.getUser();
      let userData = null;
      
      if (user) {
        // Fetch user's recent transactions
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(50);
          
        // Fetch user's financial goals
        const { data: goals } = await supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', user.id);
          
        if (transactions && transactions.length > 0) {
          userData = formatUserData(transactions, goals || []);
        }
      }
      
      // Determine question type
      const lowerQuestion = question.toLowerCase();
      const isDefinition = lowerQuestion.startsWith('what is');
      const isIncome = lowerQuestion.includes('income') || lowerQuestion.includes('earn');
      const isSavings = lowerQuestion.includes('savings') || lowerQuestion.includes('save');
      const isExpense = lowerQuestion.includes('expense') || lowerQuestion.includes('spend');

      // Construct appropriate prompt based on question type
      let fullPrompt = '';
      
      if (isDefinition) {
        fullPrompt = `
          You are a financial expert. Define this term simply:
          Term: "${question.replace('what is', '').replace('What is', '').trim()}"
          
          Rules:
          1. First line must be a clear, simple definition
          2. Second line must be a real-world example using dollars
          3. No greetings or AI phrases
          4. No extra explanations
        `;
      } else if (isIncome && isExpense && userData?.totalIncome > 0) {
        fullPrompt = `
          Analyze this user's income and expenses:
          - Monthly Income: $${userData.totalIncome.toFixed(2)}
          - Monthly Expenses: $${userData.totalExpenses.toFixed(2)}
          - Current Savings: ${userData.savingsRate.toFixed(1)}%
          
          Top Expenses:
          ${userData.topExpenseCategories.map((cat: any) => `- ${cat.category}: $${cat.amount.toFixed(2)}`).join('\n')}
          
          Rules:
          1. List their exact income and top 2 expenses
          2. Give one specific suggestion to reduce their highest expense
          3. Use exact dollar amounts
          4. No greetings or explanations
        `;
      } else if (isSavings && userData?.totalIncome > 0) {
        fullPrompt = `
          Help improve this user's savings:
          - Current Income: $${userData.totalIncome.toFixed(2)}
          - Current Expenses: $${userData.totalExpenses.toFixed(2)}
          - Savings Rate: ${userData.savingsRate.toFixed(1)}%
          
          Rules:
          1. Give exactly two actionable steps
          2. Use their actual numbers
          3. Be specific about dollar amounts
          4. No greetings or explanations
        `;
      } else if (isExpense && userData?.totalIncome > 0) {
        fullPrompt = `
          Analyze their spending:
          Top Expenses:
          ${userData.topExpenseCategories.map((cat: any) => `- ${cat.category}: $${cat.amount.toFixed(2)}`).join('\n')}
          
          Rules:
          1. List their top expense category and amount
          2. Give one specific way to reduce it
          3. Use exact dollar amounts
          4. No greetings or explanations
        `;
      } else {
        fullPrompt = `
          Answer this financial question: "${question}"
          
          ${userData?.totalIncome > 0 ? `
          User's Data:
          - Income: $${userData.totalIncome.toFixed(2)}
          - Expenses: $${userData.totalExpenses.toFixed(2)}
          ` : ''}
          
          Rules:
          1. Give one specific, actionable answer
          2. Use numbers and percentages
          3. No greetings or explanations
          4. Maximum 2 sentences
        `;
      }
      
      // Use the proxy service to call Gemini API
      return await generateText(fullPrompt, isDefinition ? 0.1 : 0.2);
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      throw error;
    }
  }
}; 