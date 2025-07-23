import { Card } from "@/components/ui/card";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { RiskLevelChart } from "@/components/analytics/security/RiskLevelChart";
import { SuspiciousTransactionTimeline } from "@/components/analytics/security/SuspiciousTransactionTimeline";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { TransactionTable } from "@/components/analytics/shared/TransactionTable";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useSecurity } from "@/hooks/useSecurity";
import { Loader2, ShieldAlert } from "lucide-react";

export const ScamAlertsTab = () => {
  const { 
    alerts, 
    metrics, 
    riskData, 
    timelineData, 
    insights, 
    isLoading 
  } = useSecurity();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing transactions for security concerns...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Scam Alerts & Security
          </h2>
          <p className="text-muted-foreground">
            Monitor and protect your accounts from suspicious activities
          </p>
        </div>
        <ExportButton data={alerts} filename="security-alerts" />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Risk Level Assessment</h3>
          <RiskLevelChart data={riskData} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Suspicious Activity Timeline</h3>
          <SuspiciousTransactionTimeline data={timelineData} />
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Security Insights & Recommendations"
      />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Flagged Transactions</h3>
        <TransactionTable 
          data={alerts} 
          columns={["date", "merchant", "amount", "riskScore", "category", "riskLevel"]} 
        />
      </Card>
    </div>
  );
};