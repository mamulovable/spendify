import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function BudgetDashboard() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchBudgets();
  }, [user]);

  const fetchBudgets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setBudgets(data);
    }
    setLoading(false);
  };

  const handleCreateBudget = () => {
    navigate('/dashboard/budgets/new');
  };

  const handleEditBudget = (id: string) => {
    navigate(`/dashboard/budgets/${id}`);
  };

  // Helper to calculate allocation and status
  const getBudgetStats = (budget: any) => {
    // If you have categories, sum their allocated_amount
    const totalAllocated = budget.categories
      ? budget.categories.reduce((sum: number, cat: any) => sum + Number(cat.allocated_amount || 0), 0)
      : 0;
    const savingsGoal = Number(budget.savings_goal || 0);
    const totalUsed = totalAllocated + savingsGoal;
    const percentAllocated = budget.amount > 0 ? (totalAllocated / budget.amount) * 100 : 0;
    const percentUsed = budget.amount > 0 ? (totalUsed / budget.amount) * 100 : 0;
    const isDeficit = totalUsed > budget.amount;
    return { totalAllocated, savingsGoal, percentAllocated, percentUsed, isDeficit };
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Button size="lg" onClick={handleCreateBudget}>+ Add Budget</Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : budgets.length === 0 ? (
        <div>No budgets found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => {
            const {
              totalAllocated,
              savingsGoal,
              percentAllocated,
              percentUsed,
              isDeficit
            } = getBudgetStats(budget);

            return (
              <Card key={budget.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-xl">{budget.name || <span className="text-gray-400">Untitled</span>}</CardTitle>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} budget
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <span className="font-semibold text-lg text-green-700">${budget.amount}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Allocated</span>
                      <span>
                        ${totalAllocated} / ${budget.amount}
                      </span>
                    </div>
                    <Progress value={percentAllocated} className="h-2" />
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>Total Used (Allocated + Savings)</span>
                      <span>
                        ${totalAllocated + savingsGoal} / ${budget.amount}
                      </span>
                    </div>
                    <Progress value={percentUsed} className={isDeficit ? "h-2 bg-red-200" : "h-2"} />
                  </div>
                  <div className="mb-2 flex items-center text-xs">
                    <span className="font-medium">Savings Goal:</span>
                    <span className="ml-2 text-blue-700">${savingsGoal}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${isDeficit ? "text-red-600" : "text-green-600"}`}>
                    {isDeficit ? (
                      <>
                        <AlertTriangle className="w-4 h-4" /> Deficit
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Surplus
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    <span>Start: {budget.start_date}</span>
                    <br />
                    <span>End: {budget.end_date || '-'}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm" onClick={() => handleEditBudget(budget.id)}>
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}