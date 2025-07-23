import { useStatement } from "@/contexts/StatementContext";
import { analyzeTaxCategorization } from "@/services/taxCategorizationService";
import { 
  TaxCategory, 
  TaxDeduction, 
  TaxMetric, 
  TaxInsight
} from "@/types/taxCategorization";
import { useState, useEffect } from "react";
import { mockTaxCategorizationData } from "@/mocks/mockAnalyticsData";

export const useTaxCategorization = () => {
  const { statementData } = useStatement();
  const [isLoading, setIsLoading] = useState(true);
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>([]);
  const [metrics, setMetrics] = useState<TaxMetric[]>([]);
  const [insights, setInsights] = useState<TaxInsight[]>([]);

  useEffect(() => {
    const analyzeTaxes = async () => {
      setIsLoading(true);
      
      try {
        if (statementData && statementData.transactions && statementData.transactions.length > 0) {
          // Use real data when available
          console.log("Processing real transaction data for tax categorization");
          const results = analyzeTaxCategorization(statementData.transactions);
          
          // Always use the real data analysis results, even if empty
          setTaxCategories(results.taxCategories);
          setTaxDeductions(results.taxDeductions);
          setMetrics(results.metrics);
          setInsights(results.insights);
          console.log("Using real data analysis results with", results.taxCategories.length, "tax categories and", results.taxDeductions.length, "tax deductions");
        } else {
          // Fall back to mock data when no statement is available
          console.log("Using mock data for tax categorization");
          setTaxCategories(mockTaxCategorizationData.taxCategories);
          setTaxDeductions(mockTaxCategorizationData.deductions);
          setMetrics(mockTaxCategorizationData.metrics);
          setInsights(mockTaxCategorizationData.insights);
        }
      } catch (error) {
        console.error("Error analyzing tax categorization:", error);
        // Fall back to mock data on error
        setTaxCategories(mockTaxCategorizationData.taxCategories);
        setTaxDeductions(mockTaxCategorizationData.deductions);
        setMetrics(mockTaxCategorizationData.metrics);
        setInsights(mockTaxCategorizationData.insights);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    analyzeTaxes();
  }, [statementData]);

  return {
    taxCategories,
    taxDeductions,
    metrics,
    insights,
    isLoading
  };
};