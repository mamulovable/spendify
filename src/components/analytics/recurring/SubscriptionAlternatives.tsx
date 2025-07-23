import { Button } from "@/components/ui/button";
import { RecurringExpense } from "@/types/recurringExpense";
import { ExternalLink } from "lucide-react";

interface SubscriptionAlternativesProps {
  expenses: RecurringExpense[];
}

export const SubscriptionAlternatives = ({ expenses }: SubscriptionAlternativesProps) => {
  // Filter expenses that have alternative suggestions
  const expensesWithAlternatives = expenses.filter(
    expense => expense.alternativeSuggestions && expense.alternativeSuggestions.length > 0
  );

  if (expensesWithAlternatives.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No alternative suggestions available for your current subscriptions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expensesWithAlternatives.map((expense) => (
        <div key={expense.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-medium">{expense.name}</h4>
              <p className="text-sm text-muted-foreground">
                {expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1)} · 
                ₦{expense.amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Alternatives Available
              </span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {expense.alternativeSuggestions?.map((alternative, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 bg-muted/50 rounded-md"
              >
                <div>
                  <p className="font-medium">{alternative.name}</p>
                  <p className="text-sm">₦{alternative.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-500">
                    Save ₦{alternative.savingsAmount.toLocaleString()} ({alternative.savingsPercentage}%)
                  </p>
                  {alternative.link && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs mt-1 h-7 px-2"
                      onClick={() => window.open(alternative.link, '_blank')}
                    >
                      Learn More <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};