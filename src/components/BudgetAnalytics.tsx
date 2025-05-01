import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { budgetService, BudgetWithCategories } from '@/services/budgetService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BudgetAnalyticsProps {
  userId: string;
}

export function BudgetAnalytics({ userId }: BudgetAnalyticsProps) {
  const [budgets, setBudgets] = useState<BudgetWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchBudgets();
  }, [userId]);
  
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getBudgets(userId);
      setBudgets(data);
    } catch (error) {
      console.error('Error fetching budgets for analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate overall budget metrics
  const calculateMetrics = () => {
    let totalBudgeted = 0;
    let totalSpent = 0;
    let categoriesCount = 0;
    let overBudgetCount = 0;
    
    budgets.forEach(budget => {
      totalBudgeted += budget.amount;
      
      budget.categories.forEach(category => {
        totalSpent += category.spent_amount;
        categoriesCount++;
        if (category.percentage > 100) {
          overBudgetCount++;
        }
      });
    });
    
    return {
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      spendingPercentage: (totalSpent / totalBudgeted) * 100,
      categoriesCount,
      overBudgetCount
    };
  };
  
  // Prepare data for category spending chart
  const prepareCategoryData = () => {
    const categorySpending = {};
    
    budgets.forEach(budget => {
      budget.categories.forEach(category => {
        if (categorySpending[category.category]) {
          categorySpending[category.category] += category.spent_amount;
        } else {
          categorySpending[category.category] = category.spent_amount;
        }
      });
    });
    
    return Object.entries(categorySpending).map(([name, value]) => ({
      name,
      value: value as number
    }));
  };
  
  // Prepare data for budget vs actual chart
  const prepareBudgetVsActualData = () => {
    return budgets.map(budget => {
      const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
      return {
        name: budget.name,
        budgeted: budget.amount,
        spent: totalSpent
      };
    });
  };
  
  if (loading) {
    return <div>Loading budget analytics...</div>;
  }
  
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Analytics</CardTitle>
          <CardDescription>
            No budget data available. Create a budget to see analytics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const metrics = calculateMetrics();
  const categoryData = prepareCategoryData();
  const budgetVsActualData = prepareBudgetVsActualData();
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Analytics</CardTitle>
        <CardDescription>
          Analyze your spending patterns and budget performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="comparison">Budget vs Actual</TabsTrigger>
            <TabsList className="mb-6">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
              <TabsTrigger value="statement">Statement Analysis</TabsTrigger>
              <TabsTrigger value="saved">Saved Analyses</TabsTrigger>
            </TabsList>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalBudgeted)}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalSpent)}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.spendingPercentage.toFixed(1)}% of budget
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${metrics.remaining < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(metrics.remaining)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Budget Health</h3>
              <p className="mb-4">
                {metrics.overBudgetCount} out of {metrics.categoriesCount} categories are over budget.
              </p>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetVsActualData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                  <Bar dataKey="spent" fill="#82ca9d" name="Actual Spending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="statement">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Statement Analysis</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={transactions.map(t => ({
                        name: t.description,
                        amount: t.amount
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{fontSize: 12}}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)'
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="var(--primary)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}