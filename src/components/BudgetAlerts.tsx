import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetService } from '@/services/budgetService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface BudgetAlertsProps {
  userId: string;
}

export function BudgetAlerts({ userId }: BudgetAlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAlerts();
  }, [userId]);
  
  const checkAlerts = async () => {
    try {
      const budgetAlerts = await budgetService.checkBudgetAlerts(userId);
      setAlerts(budgetAlerts);
    } catch (error) {
      console.error('Error checking budget alerts:', error);
    }
  };
  
  if (alerts.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4 mb-6">
      {alerts.map((alert, index) => (
        <Alert key={index} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Budget Alert</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              Your spending in <strong>{alert.categoryName}</strong> category has reached{' '}
              <strong>{alert.percentage.toFixed(1)}%</strong> of your budget in{' '}
              <strong>{alert.budgetName}</strong>.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="self-end"
              onClick={() => navigate(`/dashboard/budgets/${alert.budgetId}`)}
            >
              View Budget
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}