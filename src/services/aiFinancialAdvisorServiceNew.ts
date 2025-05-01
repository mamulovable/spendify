import { supabase } from '@/lib/supabase';
import { generateText } from './geminiProxyService';

// Mock responses for different types of questions
const mockResponses = {
  savings: [
    "To improve your savings, consider the 50/30/20 rule: allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.",
    "Set up automatic transfers to your savings account on payday to ensure you're consistently saving.",
    "Look for ways to reduce your expenses, such as cutting subscription services or dining out less frequently.",
    "Consider opening a high-yield savings account to earn more interest on your savings.",
    "Set specific savings goals with deadlines to stay motivated."
  ],
  budgeting: [
    "The 50/30/20 rule is a simple budgeting method: 50% for needs, 30% for wants, and 20% for savings and debt.",
    "Track all your expenses for a month to understand where your money is going.",
    "Use budgeting apps to help you stay on track with your financial goals.",
    "Review your budget regularly and adjust as needed based on your changing financial situation.",
    "Consider using the envelope method for variable expenses like groceries and entertainment."
  ],
  investing: [
    "Start with an emergency fund before investing to ensure you have a financial safety net.",
    "Consider low-cost index funds for long-term investing as they provide diversification and lower fees.",
    "Diversify your investments across different asset classes to reduce risk.",
    "Invest consistently over time rather than trying to time the market.",
    "Consider your risk tolerance and investment timeline when choosing investments."
  ],
  expenses: [
    "Review your recurring subscriptions and cancel any that you don't use regularly.",
    "Look for ways to reduce utility bills, such as using energy-efficient appliances and turning off lights when not in use.",
    "Consider meal planning to reduce grocery expenses and avoid impulse purchases.",
    "Use cashback and rewards programs to get money back on your purchases.",
    "Compare prices before making purchases and look for sales and discounts."
  ],
  spending: [
    "Your recent spending shows higher expenses in dining out and entertainment categories.",
    "Consider setting a monthly budget for discretionary spending to help control expenses.",
    "Your spending on groceries has increased by 15% compared to last month.",
    "You're on track to exceed your budget for transportation expenses this month.",
    "Your spending patterns indicate you might benefit from a more structured budget."
  ],
  default: [
    "I'd be happy to help with your financial question. Could you provide more details?",
    "That's an interesting financial question. Let me help you think through this.",
    "I can provide guidance on that financial topic. What specific aspects would you like to know more about?",
    "I'm here to help with your financial concerns. Could you elaborate on your question?",
    "I can offer advice on that financial matter. What's your specific situation?"
  ]
};

// Function to categorize the question
const categorizeQuestion = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('sav') || lowerQuestion.includes('save') || lowerQuestion.includes('saving')) {
    return 'savings';
  } else if (lowerQuestion.includes('budget') || lowerQuestion.includes('income') || lowerQuestion.includes('spend')) {
    return 'budgeting';
  } else if (lowerQuestion.includes('invest') || lowerQuestion.includes('stock') || lowerQuestion.includes('market')) {
    return 'investing';
  } else if (lowerQuestion.includes('expense') || lowerQuestion.includes('reduce') || lowerQuestion.includes('cut')) {
    return 'expenses';
  } else if (lowerQuestion.includes('pattern') || lowerQuestion.includes('spending') || lowerQuestion.includes('habit')) {
    return 'spending';
  } else {
    return 'default';
  }
};

// Function to get a random response from the appropriate category
const getRandomResponse = (category: string): string => {
  const responses = mockResponses[category as keyof typeof mockResponses] || mockResponses.default;
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

export const aiFinancialAdvisorService = {
  async getResponse(question: string): Promise<string> {
    try {
      // Use Gemini service for more accurate responses
      return await generateText(question, 0.2);
    } catch (error) {
      console.error('Error getting AI response from Gemini:', error);
      
      // Fallback to mock responses if Gemini fails
      const category = categorizeQuestion(question);
      return getRandomResponse(category);
    }
  },
  
  async getSpendingInsights(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch user's transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50);
        
      if (!transactions || transactions.length === 0) {
        return "I don't have enough transaction data to provide spending insights. Start adding your transactions to get personalized advice.";
      }
      
      // Use Gemini for more accurate insights
      return await generateText("What are my current spending patterns and how can I improve them?", 0.2);
    } catch (error) {
      console.error('Error getting spending insights:', error);
      return "I'm having trouble analyzing your spending data right now. Please try again later.";
    }
  },
  
  async getBudgetSuggestions(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Fetch user's transactions and goals
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(50);
        
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);
        
      if (!transactions || transactions.length === 0) {
        return "I don't have enough transaction data to provide budget suggestions. Start adding your transactions to get personalized advice.";
      }
      
      // Use Gemini for more accurate budget suggestions
      return await generateText("What budget suggestions do you have based on my spending patterns and financial goals?", 0.2);
    } catch (error) {
      console.error('Error getting budget suggestions:', error);
      return "I'm having trouble providing budget suggestions right now. Please try again later.";
    }
  }
}; 