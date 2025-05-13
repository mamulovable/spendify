import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  AreaChart,
  Area
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, Calendar, RefreshCw, BarChart4, Activity, Clock, DollarSign } from 'lucide-react';
import { Transaction, Pattern } from '@/hooks/useFinancialData';

interface SpendingPatternsProps {
  patterns: {
    data: Pattern[];
    count: number;
    recurring: number;
  };
  transactions: {
    data: Transaction[];
    total: number;
    categorized: number;
  };
}

export default function SpendingPatterns({ patterns, transactions }: SpendingPatternsProps) {
  const [patternType, setPatternType] = useState<'all' | 'recurring' | 'seasonal' | 'trend'>('all');
  const [timeRange, setTimeRange] = useState('6months');

  // Filter patterns based on selected type
  const filteredPatterns = patternType === 'all' 
    ? patterns.data 
    : patterns.data.filter(p => p.type === patternType);

  // Get recurring transaction data for charts
  const recurringTransactions = transactions.data.filter(t => t.is_recurring);
  
  // Group transactions by date (month) for trend chart
  const transactionsByMonth = transactions.data.reduce((acc, curr) => {
    const date = new Date(curr.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        totalAmount: 0,
        count: 0,
      };
    }
    
    acc[monthYear].totalAmount += curr.amount;
    acc[monthYear].count += 1;
    
    return acc;
  }, {} as Record<string, { totalAmount: number; count: number }>);
  
  // Convert to array and sort by date for charting
  const monthlyTrends = Object.entries(transactionsByMonth)
    .map(([month, data]) => ({
      month,
      amount: data.totalAmount,
      count: data.count
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Spending Patterns</h3>
          <p className="text-sm text-muted-foreground">
            Discover recurring expenses and spending trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={patternType} onValueChange={(value: any) => setPatternType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pattern type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patterns</SelectItem>
              <SelectItem value="recurring">Recurring</SelectItem>
              <SelectItem value="seasonal">Seasonal</SelectItem>
              <SelectItem value="trend">Trends</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <BarChart4 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="recurring">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recurring Expenses
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Spending Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Detected Patterns</CardTitle>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{patterns.count}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground">
                  Based on {transactions.total} transactions
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Recurring Expenses</CardTitle>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{patterns.recurring}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground">
                  Approx. ${recurringTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}/month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold capitalize">Stable</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground">
                  Based on last {timeRange === '3months' ? '3' : timeRange === '6months' ? '6' : '12'} months data
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pattern Summary</CardTitle>
              <CardDescription>Overview of detected spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart4 className="h-16 w-16 mx-auto text-muted-foreground/50 hidden" />
                  <RechartsBarChart
                    data={monthlyTrends}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="amount" 
                      fill="#8884d8" 
                      name="Monthly Spending"
                      radius={[4, 4, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Based on {transactions.total} transactions from {monthlyTrends.length} months
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredPatterns.filter(p => p.type === 'recurring').length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium mb-2">No recurring expenses detected</h3>
                  <p className="text-muted-foreground mb-4">
                    We haven't detected any recurring transactions yet. This usually requires at least 3 months of transaction history.
                  </p>
                  <Button variant="outline" size="sm">Add manual recurring expense</Button>
                </CardContent>
              </Card>
            ) : (
              filteredPatterns
                .filter(p => p.type === 'recurring')
                .map(pattern => (
                  <Card key={pattern.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{pattern.name}</CardTitle>
                          <CardDescription>{pattern.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{pattern.frequency}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Since {new Date(pattern.first_occurrence).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xl font-bold">${Math.abs(pattern.amount).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        Last transaction on {new Date(pattern.last_occurrence).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Over Time</CardTitle>
              <CardDescription>See how your spending has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart
                    data={monthlyTrends}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [`$${Math.abs(value).toFixed(2)}`, 'Amount']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Monthly Spending"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Showing spending trends from {monthlyTrends.length} months
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Summary</CardTitle>
              <CardDescription>Month-by-month breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                {monthlyTrends.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No monthly data available
                  </div>
                ) : (
                  <div className="divide-y">
                    {monthlyTrends.map(({ month, amount, count }) => (
                      <div key={month} className="flex items-center justify-between p-4">
                        <div>
                          <div className="font-medium">{month}</div>
                          <div className="text-sm text-muted-foreground">
                            {count} transactions
                          </div>
                        </div>
                        <div className={`text-lg font-medium ${amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                          ${Math.abs(amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
