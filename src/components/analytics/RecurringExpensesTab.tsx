import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { RecurringPaymentTimeline } from "@/components/analytics/recurring/RecurringPaymentTimeline";
import { SubscriptionAlternatives } from "@/components/analytics/recurring/SubscriptionAlternatives";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useRecurringExpenses } from "@/hooks/useRecurringExpenses";
import { Loader2, CalendarClock, AlertCircle } from "lucide-react";

export const RecurringExpensesTab = () => {
  const { 
    recurringExpenses, 
    metrics, 
    insights, 
    trends, 
    isLoading 
  } = useRecurringExpenses();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing transactions for recurring expenses...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Recurring Expenses
          </h2>
          <p className="text-muted-foreground">
            Identify and manage subscription services and recurring payments
          </p>
        </div>
        <ExportButton data={recurringExpenses} filename="recurring-expenses" />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Recurring Payment Patterns</h3>
          <RecurringPaymentTimeline data={trends} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Cost-Saving Alternatives</h3>
          <SubscriptionAlternatives expenses={recurringExpenses} />
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Subscription Insights & Recommendations"
      />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Your Recurring Expenses</h3>
        
        {recurringExpenses.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No recurring expenses detected in your transactions.
          </div>
        ) : (
          <div className="space-y-4">
            {recurringExpenses.map((expense) => (
              <div 
                key={expense.id} 
                className={`border rounded-lg p-4 ${expense.isForgotten ? 'border-amber-500/50 bg-amber-500/5' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{expense.name}</h4>
                      {expense.isForgotten && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          <AlertCircle className="h-3 w-3 mr-1" /> Forgotten
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)} · 
                      Category: {expense.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{expense.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Last charged: {new Date(expense.lastCharged).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t text-sm flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground">Next expected charge:</span>{' '}
                    {new Date(expense.nextExpectedCharge).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual cost:</span>{' '}
                    <span className="font-medium">
                      ₦{(expense.amount * (expense.frequency === 'monthly' ? 12 : expense.frequency === 'quarterly' ? 4 : 1)).toLocaleString()}
                    </span>
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