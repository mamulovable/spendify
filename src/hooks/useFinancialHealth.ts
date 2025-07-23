import { useStatement } from "@/contexts/StatementContext";
import { analyzeFinancialHealth } from "@/services/financialHealthService";
import { 
  FinancialHealthScore, 
  FinancialHealthMetric, 
  FinancialHealthInsight
} from "@/types/financialHealth";
import { useState, useEffect } from "react";
import { mockFinancialHealthData } from "@/mocks/mockAnalyticsData";

export const useFinancialHealth = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore | null>(null);
  const [metrics, setMetrics] = useState<FinancialHealthMetric[]>([]);
  const [insights, setInsights] = useState<FinancialHealthInsight[]>([]);

  useEffect(() => {
    const analyzeHealth = async () => {
      setIsLoading(true);
      
      try {
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for financial health analysis");
          const results = analyzeFinancialHealth(statementData.transactions);
          
          // Always use the real data analysis results, even if empty
          setFinancialHealth(results.financialHealth);
          setMetrics(results.metrics);
          setInsights(results.insights);
          console.log("Using real data analysis results for financial health");
        } else {
          // Fall back to mock data when no statement is available
          console.log("Using mock data for financial health analysis");
          setFinancialHealth(mockFinancialHealthData.financialHealth);
          setMetrics(mockFinancialHealthData.metrics);
          setInsights(mockFinancialHealthData.insights);
        }
      } catch (error) {
        console.error("Error analyzing financial health:", error);
        // Fall back to mock data on error
        setFinancialHealth(mockFinancialHealthData.financialHealth);
        setMetrics(mockFinancialHealthData.metrics);
        setInsights(mockFinancialHealthData.insights);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    analyzeHealth();
  }, [statementData]);

  return {
    financialHealth,
    metrics,
    insights,
    isLoading
  };
};