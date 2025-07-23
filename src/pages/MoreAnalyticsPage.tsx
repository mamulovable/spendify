import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStatement } from "@/contexts/StatementContext";
import { ScamAlertsTab } from "@/components/analytics/ScamAlertsTab";
import { RecurringExpensesTab } from "@/components/analytics/RecurringExpensesTab";
import { CashFlowTab } from "@/components/analytics/CashFlowTab";
import { MerchantIntelligenceTab } from "@/components/analytics/MerchantIntelligenceTab";
import { FinancialHealthTab } from "@/components/analytics/FinancialHealthTab";
import { TaxCategorizationTab } from "@/components/analytics/TaxCategorizationTab";

// This is a placeholder until we implement the actual tab components
const TabPlaceholder = ({ title }: { title: string }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-center">
          Loading {title.toLowerCase()} data and insights...
        </p>
      </div>
    </Card>
  );
};

const MoreAnalyticsPage = () => {
  const navigate = useNavigate();
  const { statementData } = useStatement();
  const [activeTab, setActiveTab] = useState("security");

  // Check if we have a statement to analyze
  useEffect(() => {
    if (!statementData) {
      navigate("/dashboard/upload", { 
        replace: true,
        state: { message: "Please upload a bank statement to view advanced analytics." } 
      });
    }
  }, [statementData, navigate]);

  if (!statementData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
          <span>Checking for available statements...</span>
        </div>
      </div>
    );
  }

  // Debug function to log statement data
  const debugStatementData = () => {
    console.log("DEBUG - Full Statement Data:", statementData);
    console.log("DEBUG - Transaction Count:", statementData.transactions.length);
    console.log("DEBUG - First 5 Transactions:", statementData.transactions.slice(0, 5));
    console.log("DEBUG - Transaction Types:", statementData.transactions.map(t => t.type).filter((v, i, a) => a.indexOf(v) === i));
    
    // Count transactions by type
    const typeCount = statementData.transactions.reduce((acc, t) => {
      acc[t.type || 'undefined'] = (acc[t.type || 'undefined'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("DEBUG - Transaction Type Counts:", typeCount);
    
    // Count positive/negative amounts
    const positiveCount = statementData.transactions.filter(t => t.amount >= 0).length;
    const negativeCount = statementData.transactions.filter(t => t.amount < 0).length;
    console.log("DEBUG - Positive Amount Count:", positiveCount);
    console.log("DEBUG - Negative Amount Count:", negativeCount);
    
    alert("Statement data logged to console. Check browser developer tools.");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Gain deeper insights into your financial data with our advanced analytics tools
          </p>
        </div>
        <button 
          onClick={debugStatementData}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Debug Data
        </button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
          <TabsTrigger value="security">Scam Alerts & Security</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Analysis</TabsTrigger>
          <TabsTrigger value="merchants">Merchant Intelligence</TabsTrigger>
          <TabsTrigger value="health">Financial Health Score</TabsTrigger>
          <TabsTrigger value="tax">Tax & Expense Categorization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <ScamAlertsTab />
        </TabsContent>
        
        <TabsContent value="recurring">
          <RecurringExpensesTab />
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowTab />
        </TabsContent>
        
        <TabsContent value="merchants">
          <MerchantIntelligenceTab />
        </TabsContent>
        
        <TabsContent value="health">
          <FinancialHealthTab />
        </TabsContent>
        
        <TabsContent value="tax">
          <TaxCategorizationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoreAnalyticsPage;