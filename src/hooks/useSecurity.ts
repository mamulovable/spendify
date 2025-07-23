import { useStatement } from "@/contexts/StatementContext";
import { analyzeTransactionsForSecurity } from "@/services/securityService";
import { SecurityAlert, SecurityInsight, SecurityMetric, RiskLevelData, TimelineEvent } from "@/types/securityAlert";
import { useState, useEffect } from "react";
import { mockSecurityData } from "@/mocks/mockAnalyticsData";

export const useSecurity = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [riskData, setRiskData] = useState<RiskLevelData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([]);
  const [insights, setInsights] = useState<SecurityInsight[]>([]);

  useEffect(() => {
    const analyzeTransactions = async () => {
      setIsLoading(true);
      
      try {
        console.log("StatementData in useSecurity:", statementData);
        
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for security analysis");
          const results = analyzeTransactionsForSecurity(statementData.transactions);
          
          console.log("Security analysis results:", results);
          
          // Always use the real data analysis results, even if empty
          setAlerts(results.alerts);
          setMetrics(results.metrics);
          setRiskData(results.riskData);
          setTimelineData(results.timelineData);
          setInsights(results.insights);
          console.log("Using real data analysis results with", results.alerts.length, "alerts");
        } else {
          // Fall back to mock data when no statement is available
          console.log("No statement data available, using mock data for security analysis");
          setAlerts(mockSecurityData.alerts);
          setMetrics(mockSecurityData.metrics);
          setRiskData(mockSecurityData.riskData);
          setTimelineData(mockSecurityData.timelineData);
          setInsights(mockSecurityData.insights);
        }
      } catch (error) {
        console.error("Error analyzing transactions for security:", error);
        // Fall back to mock data on error
        console.log("Error occurred, falling back to mock data");
        setAlerts(mockSecurityData.alerts);
        setMetrics(mockSecurityData.metrics);
        setRiskData(mockSecurityData.riskData);
        setTimelineData(mockSecurityData.timelineData);
        setInsights(mockSecurityData.insights);
      } finally {
        // Add a small delay to simulate loading for a smoother UX
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    analyzeTransactions();
  }, [statementData]);

  return {
    alerts,
    metrics,
    riskData,
    timelineData,
    insights,
    isLoading
  };
};