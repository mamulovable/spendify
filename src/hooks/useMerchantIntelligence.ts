import { useStatement } from "@/contexts/StatementContext";
import { analyzeMerchantIntelligence } from "@/services/merchantIntelligenceService";
import { 
  MerchantData, 
  MerchantMetric, 
  MerchantInsight
} from "@/types/merchantIntelligence";
import { useState, useEffect } from "react";
import { mockMerchantIntelligenceData } from "@/mocks/mockAnalyticsData";

export const useMerchantIntelligence = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [merchants, setMerchants] = useState<MerchantData[]>([]);
  const [metrics, setMetrics] = useState<MerchantMetric[]>([]);
  const [insights, setInsights] = useState<MerchantInsight[]>([]);

  useEffect(() => {
    const analyzeMerchants = async () => {
      setIsLoading(true);
      
      try {
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for merchant intelligence analysis");
          const results = analyzeMerchantIntelligence(statementData.transactions);
          
          console.log("Merchant intelligence results:", results);
          
          // Always use the real data analysis results, even if empty
          setMerchants(results.merchants);
          setMetrics(results.metrics);
          setInsights(results.insights);
          console.log("Using real data analysis results with", results.merchants.length, "merchants");
        } else {
          // Fall back to mock data when no statement is available
          console.log("No statement data available, using mock data for merchant intelligence analysis");
          setMerchants(mockMerchantIntelligenceData.merchants);
          setMetrics(mockMerchantIntelligenceData.metrics);
          setInsights(mockMerchantIntelligenceData.insights);
        }
      } catch (error) {
        console.error("Error analyzing merchant intelligence:", error);
        // Fall back to mock data on error
        console.log("Error occurred, falling back to mock data");
        setMerchants(mockMerchantIntelligenceData.merchants);
        setMetrics(mockMerchantIntelligenceData.metrics);
        setInsights(mockMerchantIntelligenceData.insights);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    analyzeMerchants();
  }, [statementData]);

  return {
    merchants,
    metrics,
    insights,
    isLoading
  };
};