import { useStatement } from "@/contexts/StatementContext";
import { analyzeCashFlow } from "@/services/cashFlowService";
import { 
  CashFlowData, 
  CashFlowGap, 
  CashFlowMetric, 
  CashFlowInsight,
  BudgetRecommendation
} from "@/types/cashFlow";
import { useState, useEffect } from "react";
import { mockCashFlowData } from "@/mocks/mockAnalyticsData";

export const useCashFlow = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [cashFlowGaps, setCashFlowGaps] = useState<CashFlowGap[]>([]);
  const [metrics, setMetrics] = useState<CashFlowMetric[]>([]);
  const [insights, setInsights] = useState<CashFlowInsight[]>([]);
  const [budgetRecommendations, setBudgetRecommendations] = useState<BudgetRecommendation[]>([]);

  useEffect(() => {
    const analyzeCashFlowData = async () => {
      setIsLoading(true);
      
      try {
        console.log("StatementData in useCashFlow:", statementData);
        
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for cash flow analysis");
          const results = analyzeCashFlow(statementData.transactions);
          
          console.log("Cash flow analysis results:", results);
          
          // Always use the real data analysis results, even if empty
          setCashFlowData(results.cashFlowData);
          setCashFlowGaps(results.cashFlowGaps);
          setMetrics(results.metrics);
          setInsights(results.insights);
          setBudgetRecommendations(results.budgetRecommendations);
          console.log("Using real data analysis results with", results.cashFlowData.length, "cash flow data points");
        } else {
          // Fall back to mock data when no statement is available
          console.log("No statement data available, using mock data for cash flow analysis");
          setCashFlowData(mockCashFlowData.cashFlowData);
          setCashFlowGaps(mockCashFlowData.cashFlowGaps);
          setMetrics(mockCashFlowData.metrics);
          setInsights(mockCashFlowData.insights);
          setBudgetRecommendations([
            {
              category: "Entertainment",
              currentSpending: 30000,
              recommendedSpending: 20000,
              savingsAmount: 10000,
              savingsPercentage: 33.33,
              reason: "Entertainment should be limited to around 5% of expenses"
            },
            {
              category: "Food & Dining",
              currentSpending: 40000,
              recommendedSpending: 30000,
              savingsAmount: 10000,
              savingsPercentage: 25,
              reason: "Food expenses should be around 15% of your budget"
            }
          ]);
        }
      } catch (error) {
        console.error("Error analyzing cash flow:", error);
        // Fall back to mock data on error
        console.log("Error occurred, falling back to mock data");
        setCashFlowData(mockCashFlowData.cashFlowData);
        setCashFlowGaps(mockCashFlowData.cashFlowGaps);
        setMetrics(mockCashFlowData.metrics);
        setInsights(mockCashFlowData.insights);
        setBudgetRecommendations([
          {
            category: "Entertainment",
            currentSpending: 30000,
            recommendedSpending: 20000,
            savingsAmount: 10000,
            savingsPercentage: 33.33,
            reason: "Entertainment should be limited to around 5% of expenses"
          },
          {
            category: "Food & Dining",
            currentSpending: 40000,
            recommendedSpending: 30000,
            savingsAmount: 10000,
            savingsPercentage: 25,
            reason: "Food expenses should be around 15% of your budget"
          }
        ]);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    analyzeCashFlowData();
  }, [statementData]);

  return {
    cashFlowData,
    cashFlowGaps,
    metrics,
    insights,
    budgetRecommendations,
    isLoading
  };
};