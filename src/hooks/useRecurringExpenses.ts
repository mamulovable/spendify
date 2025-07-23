import { useStatement } from "@/contexts/StatementContext";
import { detectRecurringExpenses } from "@/services/recurringExpenseService";
import { 
  RecurringExpense, 
  RecurringExpenseMetric, 
  RecurringExpenseInsight,
  RecurringPaymentTrend
} from "@/types/recurringExpense";
import { useState, useEffect } from "react";
import { mockRecurringExpensesData } from "@/mocks/mockAnalyticsData";

export const useRecurringExpenses = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [metrics, setMetrics] = useState<RecurringExpenseMetric[]>([]);
  const [insights, setInsights] = useState<RecurringExpenseInsight[]>([]);
  const [trends, setTrends] = useState<RecurringPaymentTrend[]>([]);

  useEffect(() => {
    const analyzeRecurringExpenses = async () => {
      setIsLoading(true);
      
      try {
        console.log("StatementData in useRecurringExpenses:", statementData);
        
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for recurring expenses analysis");
          const results = detectRecurringExpenses(statementData.transactions);
          
          console.log("Recurring expenses analysis results:", results);
          
          // Always use the real data analysis results, even if empty
          setRecurringExpenses(results.recurringExpenses);
          setMetrics(results.metrics);
          setInsights(results.insights);
          setTrends(results.trends);
          console.log("Using real data analysis results with", results.recurringExpenses.length, "recurring expenses");
        } else {
          // Fall back to mock data when no statement is available
          console.log("No statement data available, using mock data for recurring expenses analysis");
          setRecurringExpenses(mockRecurringExpensesData.recurringExpenses);
          setMetrics(mockRecurringExpensesData.metrics);
          setInsights(mockRecurringExpensesData.insights);
          
          // Convert timeline data to the correct format for RecurringPaymentTrend
          const formattedTrends = mockRecurringExpensesData.timelineData.map(item => ({
            month: item.date.substring(0, 7), // Extract YYYY-MM from the date
            amount: item.amount,
            name: item.name
          })) as unknown as RecurringPaymentTrend[];
          
          setTrends(formattedTrends);
        }
      } catch (error) {
        console.error("Error analyzing recurring expenses:", error);
        // Fall back to mock data on error
        console.log("Error occurred, falling back to mock data");
        setRecurringExpenses(mockRecurringExpensesData.recurringExpenses);
        setMetrics(mockRecurringExpensesData.metrics);
        setInsights(mockRecurringExpensesData.insights);
        
        // Convert timeline data to the correct format for RecurringPaymentTrend
        const formattedTrends = mockRecurringExpensesData.timelineData.map(item => ({
          month: item.date.substring(0, 7), // Extract YYYY-MM from the date
          amount: item.amount,
          name: item.name
        })) as unknown as RecurringPaymentTrend[];
        
        setTrends(formattedTrends);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    analyzeRecurringExpenses();
  }, [statementData]);

  return {
    recurringExpenses,
    metrics,
    insights,
    trends,
    isLoading
  };
};