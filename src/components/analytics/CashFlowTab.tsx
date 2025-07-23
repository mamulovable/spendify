import { Card } from "@/components/ui/card";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { CashFlowWaterfallChart } from "@/components/analytics/cashflow/CashFlowWaterfallChart";
import { CashFlowPrediction } from "@/components/analytics/cashflow/CashFlowPrediction";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useCashFlow } from "@/hooks/useCashFlow";
import { Loader2, TrendingUp } from "lucide-react";

export const CashFlowTab = () => {
  const { 
    cashFlowData, 
    cashFlowGaps,
    metrics, 
    insights, 
    budgetRecommendations,
    isLoading 
  } = useCashFlow();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing cash flow data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Cash Flow Analysis
          </h2>
          <p className="text-muted-foreground">
            Analyze money flow in and out of your accounts
          </p>
        </div>
        <ExportButton data={cashFlowData} filename="cash-flow-analysis" />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Income vs Expenses</h3>
          <CashFlowWaterfallChart data={cashFlowData} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Cash Flow Prediction</h3>
          <CashFlowPrediction data={cashFlowData} gaps={cashFlowGaps} />
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Cash Flow Insights & Recommendations"
      />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Budget Recommendations</h3>
        
        {budgetRecommendations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No budget recommendations available based on your spending patterns.
          </div>
        ) : (
          <div className="space-y-4">
            {budgetRecommendations.map((recommendation, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{recommendation.category}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {recommendation.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-500 font-medium">
                      Potential savings: ₦{recommendation.savingsAmount.toLocaleString()} ({recommendation.savingsPercentage.toFixed(0)}%)
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Current Spending</p>
                    <p className="font-medium">₦{recommendation.currentSpending.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">Recommended Spending</p>
                    <p className="font-medium">₦{recommendation.recommendedSpending.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};