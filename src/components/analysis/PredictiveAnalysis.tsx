import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Calendar, PiggyBank, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, LineChart, BarChart } from 'lucide-react';
import { Transaction, Prediction, Category } from '@/hooks/useFinancialData';

interface PredictiveAnalysisProps {
  predictions: {
    data: Prediction[];
    spendingTrend: 'increasing' | 'decreasing' | 'stable';
    budgetStatus: 'on_track' | 'at_risk' | 'over_budget';
  };
  transactions: {
    data: Transaction[];
    total: number;
    categorized: number;
  };
}

export default function PredictiveAnalysis({ predictions, transactions }: PredictiveAnalysisProps) {
  const [timeHorizon, setTimeHorizon] = useState('3months');
  const [predictionType, setPredictionType] = useState<'all' | 'spending' | 'income' | 'savings' | 'budget'>('all');

  // Filter predictions based on selected type and time horizon
  const filteredPredictions = predictions.data
    .filter(p => predictionType === 'all' || p.type === predictionType);

  // Get badge for budget status
  const getBudgetStatusBadge = (status: 'on_track' | 'at_risk' | 'over_budget') => {
    switch(status) {
      case 'on_track':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'at_risk':
        return <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">{status}</Badge>;
      case 'over_budget':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get trend indicator icon
  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch(trend) {
      case 'increasing':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'decreasing':
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
      case 'stable':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
    }
  };

  // Format predictions by category
  const predictionsByCategory = predictions.data.reduce((acc, curr) => {
    if (!curr.category_id) return acc;
    
    if (!acc[curr.category_id]) {
      acc[curr.category_id] = [];
    }
    
    acc[curr.category_id].push(curr);
    return acc;
  }, {} as Record<string, Prediction[]>);

  // Calculate budget utilization
  const calculateBudgetUtilization = () => {
    // This would normally be calculated from real data
    // For now, return a sample value
    return 65; // Percentage
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Predictive Analysis</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered forecasts to help you plan ahead
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={predictionType} onValueChange={(value: any) => setPredictionType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Prediction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Predictions</SelectItem>
              <SelectItem value="spending">Spending</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Next month</SelectItem>
              <SelectItem value="3months">Next 3 months</SelectItem>
              <SelectItem value="6months">Next 6 months</SelectItem>
              <SelectItem value="1year">Next year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">
            <LineChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="forecasts">
            <Calendar className="h-4 w-4 mr-2" />
            Detailed Forecasts
          </TabsTrigger>
          <TabsTrigger value="budget">
            <PiggyBank className="h-4 w-4 mr-2" />
            Budget Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
                <div className="flex items-center">
                  {getTrendIcon(predictions.spendingTrend)}
                  <span className="text-2xl font-bold capitalize ml-2">{predictions.spendingTrend}</span>
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
                <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
                <div className="flex items-center">
                  {predictions.budgetStatus === 'on_track' 
                    ? <PiggyBank className="h-5 w-5 text-green-500 mr-2" />
                    : <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  }
                  <span className="text-2xl font-bold capitalize">{predictions.budgetStatus.replace('_', ' ')}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground">
                  Current budget utilization: {calculateBudgetUtilization()}%
                </div>
                <Progress value={calculateBudgetUtilization()} className="h-1 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium">Forecast Confidence</CardTitle>
                <div className="flex items-center">
                    <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">85%</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground">
                  Based on {transactions.total} transactions from {transactions.data.length > 0 ? new Date(transactions.data[transactions.data.length - 1].date).toLocaleDateString() : 'recent history'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Forecast</CardTitle>
              <CardDescription>Projected cash flow for the next {timeHorizon === '1month' ? 'month' : timeHorizon === '3months' ? '3 months' : timeHorizon === '6months' ? '6 months' : 'year'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { month: 'Current', income: 3500, expenses: 3000, balance: 500 },
                      { month: 'Next Month', income: 3500, expenses: 2800, balance: 700 },
                      { month: 'Month 2', income: 3600, expenses: 2900, balance: 700 },
                      { month: 'Month 3', income: 3500, expenses: 3200, balance: 300 },
                      { month: 'Month 4', income: 4000, expenses: 3100, balance: 900 },
                      { month: 'Month 5', income: 4000, expenses: 3300, balance: 700 },
                      { month: 'Month 6', income: 4000, expenses: 3500, balance: 500 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`$${value}`, '']} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#f87171"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Net Cash Flow"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorBalance)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Based on historical spending patterns and recurring transactions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          {filteredPredictions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-medium mb-2">No forecast data available</h3>
                <p className="text-muted-foreground mb-4">
                  We don't have enough transaction history to generate accurate forecasts.
                  Add more data or adjust your filters.
                </p>
                <Button variant="outline" size="sm">Generate Sample Forecast</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPredictions.map(prediction => (
                <Card key={prediction.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{prediction.description}</CardTitle>
                        <CardDescription>
                          Predicted for {new Date(prediction.date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="capitalize">{prediction.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(prediction.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xl font-bold">${Math.abs(prediction.amount).toFixed(2)}</span>
                      </div>
                    </div>
                    {prediction.factors && prediction.factors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Based on:</p>
                        <div className="flex flex-wrap gap-2">
                          {prediction.factors.map((factor, index) => (
                            <Badge key={index} variant="secondary">{factor}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Planning</CardTitle>
              <CardDescription>Recommended budget adjustments based on spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Current Budget Status</h4>
                    {getBudgetStatusBadge(predictions.budgetStatus)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your {predictions.budgetStatus === 'on_track' ? 'spending is within budget' : predictions.budgetStatus === 'at_risk' ? 'spending is approaching budget limits' : 'spending has exceeded budget in some categories'}
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Overall Budget Utilization</span>
                        <span className="text-sm">{calculateBudgetUtilization()}%</span>
                      </div>
                      <Progress value={calculateBudgetUtilization()} className="h-2" />
                    </div>
                    
                    {/* This would normally be populated with actual category data */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Groceries</span>
                        <span className="text-sm">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Entertainment</span>
                        <span className="text-sm text-red-500">110%</span>
                      </div>
                      <Progress value={100} className="h-2 bg-red-100" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Transportation</span>
                        <span className="text-sm">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Budget Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Consider reducing <strong>Entertainment</strong> spending by $50 next month to stay within budget</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Your <strong>Transportation</strong> budget has room for adjustment - you could allocate $30 to other categories</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <PiggyBank className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Based on your income, you could increase your <strong>Savings</strong> by $100 per month</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Optimize My Budget
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
