import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { TaxCategoryPieChart } from "@/components/analytics/tax/TaxCategoryPieChart";
import { DeductibleExpensesChart } from "@/components/analytics/tax/DeductibleExpensesChart";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { TransactionTable } from "@/components/analytics/shared/TransactionTable";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useTaxCategorization } from "@/hooks/useTaxCategorization";
import { Loader2, Receipt, FileDown } from "lucide-react";

export const TaxCategorizationTab = () => {
  const { 
    taxCategories, 
    taxDeductions, 
    metrics, 
    insights, 
    isLoading 
  } = useTaxCategorization();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing transactions for tax categorization...</p>
      </div>
    );
  }
  
  // Prepare data for transaction table
  const deductionsTableData = taxDeductions.map(deduction => ({
    date: deduction.date,
    merchant: deduction.merchant,
    amount: deduction.amount,
    category: deduction.category,
    confidence: deduction.confidence,
    hasReceipt: deduction.hasReceipt
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Tax & Expense Categorization
          </h2>
          <p className="text-muted-foreground">
            Help with tax preparation and business expense tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <FileDown className="h-4 w-4" />
            Export Tax Report
          </Button>
          <ExportButton data={taxDeductions} filename="tax-deductions" />
        </div>
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Expense Categories</h3>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              <TabsTrigger value="deductible">Deductible Only</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TaxCategoryPieChart categories={taxCategories} />
            </TabsContent>
            <TabsContent value="deductible">
              <TaxCategoryPieChart categories={taxCategories} showDeductibleOnly={true} />
            </TabsContent>
          </Tabs>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Deductible Expenses Over Time</h3>
          <DeductibleExpensesChart deductions={taxDeductions} />
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Tax Insights & Recommendations"
      />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Potential Tax Deductions</h3>
        
        {taxDeductions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No potential tax deductions found in your transactions.
          </div>
        ) : (
          <TransactionTable 
            data={deductionsTableData} 
            columns={["date", "merchant", "amount", "category", "confidence"]} 
          />
        )}
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Tax Category Breakdown</h3>
        
        <div className="space-y-4">
          {taxCategories
            .filter(category => category.totalAmount > 0)
            .map((category) => (
              <div 
                key={category.id} 
                className={`border rounded-lg p-4 ${
                  category.isDeductible ? 'border-green-500/20 bg-green-500/5' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{category.name}</h4>
                      {category.isDeductible && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Tax Deductible
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{category.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.transactionCount} transactions
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};