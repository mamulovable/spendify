import { useState, useEffect } from 'react';
import { FeatureGate } from '@/components/FeatureGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Transaction {
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface CategoryData {
  category: string;
  amount: number;
}

interface DayData {
  day: string;
  amount: number;
}

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState('trends');
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dailyPatterns, setDailyPatterns] = useState<DayData[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Fetch user's saved analyses from Supabase
        const { data: analyses, error } = await supabase
          .from('saved_analyses')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        if (!analyses || analyses.length === 0) {
          console.log('No analyses found');
          setMonthlyData([]);
          setCategoryData([]);
          setDailyPatterns([]);
          setRecurringExpenses([]);
          return;
        }

        // Ensure transactions are parsed if stored as strings
        const processedAnalyses = analyses.map(analysis => ({
          ...analysis,
          transactions: typeof analysis.transactions === 'string'
            ? (() => {
                try {
                  return JSON.parse(analysis.transactions);
                } catch (e) {
                  console.error('Failed to parse transactions:', analysis.transactions);
                  return [];
                }
              })()
            : analysis.transactions
        }));

        console.log('Processed analyses:', processedAnalyses);

        // Process monthly trends
        const monthlyTrends = processMonthlyTrends(processedAnalyses);
        console.log('Monthly trends:', monthlyTrends);
        setMonthlyData(monthlyTrends);

        // Process category data
        const categoryTrends = processCategoryData(processedAnalyses);
        console.log('Category trends:', categoryTrends);
        setCategoryData(categoryTrends);

        // Process daily patterns
        const patterns = processDailyPatterns(processedAnalyses);
        console.log('Daily patterns:', patterns);
        setDailyPatterns(patterns);

        // Find recurring expenses
        const recurring = findRecurringExpenses(processedAnalyses);
        console.log('Recurring expenses:', recurring);
        setRecurringExpenses(recurring);

      } catch (error: any) {
        console.error('Error loading analytics:', error);
        toast({
          title: "Error loading analytics",
          description: error.message || "Failed to load analytics data. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [user, toast]);

  const processMonthlyTrends = (analyses: any[]) => {
    const monthlyTotals: { [key: string]: number } = {};
    
    analyses.forEach(analysis => {
      analysis.transactions?.forEach((transaction: Transaction) => {
        const date = new Date(transaction.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + 
          (transaction.type === 'expense' ? -transaction.amount : transaction.amount);
      });
    });

    return Object.entries(monthlyTotals)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const processCategoryData = (analyses: any[]) => {
    const categoryTotals: { [key: string]: number } = {};

    analyses.forEach(analysis => {
      console.log('Transactions for category processing:', analysis.transactions);

      analysis.transactions?.forEach((transaction: any, idx: number) => {
        // Log the full transaction object
        console.log(`Transaction #${idx}:`, JSON.stringify(transaction, null, 2));
        if (
          transaction.type === 'expense' &&
          transaction.category &&
          typeof transaction.category === 'string' &&
          transaction.category.trim() !== ''
        ) {
          categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) +
            transaction.amount;
        } else {
          // Log exactly why it was skipped
          console.log(
            `Skipped transaction #${idx}: type=${transaction.type}, category=${transaction.category}`
          );
        }
      });
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  };

  const processDailyPatterns = (analyses: any[]) => {
    const dailyTotals: { [key: string]: number } = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    analyses.forEach(analysis => {
      analysis.transactions?.forEach((transaction: Transaction) => {
        if (transaction.type === 'expense') {
          const date = new Date(transaction.date);
          const day = days[date.getDay()];
          dailyTotals[day] = (dailyTotals[day] || 0) + transaction.amount;
        }
      });
    });

    return days.map(day => ({
      day,
      amount: dailyTotals[day] || 0
    }));
  };

  const findRecurringExpenses = (analyses: any[]) => {
    // Group transactions by category and amount
    const transactionGroups: { [key: string]: Transaction[] } = {};
    
    analyses.forEach(analysis => {
      analysis.transactions?.forEach((transaction: Transaction) => {
        if (transaction.type === 'expense') {
          const key = `${transaction.category}-${transaction.amount}`;
          if (!transactionGroups[key]) {
            transactionGroups[key] = [];
          }
          transactionGroups[key].push(transaction);
        }
      });
    });

    // Find recurring transactions (appearing at least 3 times)
    return Object.values(transactionGroups)
      .filter(group => group.length >= 3)
      .map(group => group[0])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 recurring expenses
  };

  return (
    <FeatureGate feature="hasAdvancedAnalytics">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Advanced Analytics</h1>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Spending Trends</TabsTrigger>
            <TabsTrigger value="patterns">Spending Patterns</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Net Amount" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spending Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {categoryData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No category data available.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="amount" fill="#8884d8" name="Total Spent" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Patterns by Day of Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyPatterns} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amount" fill="#8884d8" name="Average Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Recurring Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recurringExpenses.map((expense, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                        <div>
                          <h3 className="font-semibold">{expense.category}</h3>
                          <p className="text-sm text-muted-foreground">Monthly recurring</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{expense.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {monthlyData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No data available for Monthly Spending Trends.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Actual" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.slice(0, 3).map((category, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                        <div>
                          <h3 className="font-semibold">{category.category}</h3>
                          <p className="text-sm text-muted-foreground">
                            Consider reducing spending in this category
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{category.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Current monthly average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </FeatureGate>
  );
}