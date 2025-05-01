import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useStatement } from '@/contexts/StatementContext';
import { FileText, Upload, PieChart, ArrowRight, BarChart, TrendingUp, Lightbulb, Clock, Info, Sparkles } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getSavedAnalyses } from '@/services/storageService';
import { formatCurrency, cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ImageUploader from '@/components/ImageUploader';

const DashboardHome = () => {
  const { user } = useAuth();
  const { statementData } = useStatement();
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSavedAnalyses = async () => {
      try {
        const analyses = await getSavedAnalyses();
        setSavedAnalyses(analyses);
      } catch (error) {
        console.error('Failed to load saved analyses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedAnalyses();
  }, []);
  
  // Calculate financial summary
  const totalIncome = savedAnalyses.reduce((sum, analysis) => sum + analysis.totalIncome, 0);
  const totalExpense = savedAnalyses.reduce((sum, analysis) => sum + analysis.totalExpense, 0);
  const netIncome = totalIncome - totalExpense;
  
  // Prepare data for the trend chart
  const trendData = savedAnalyses
    .slice(0, 7)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(analysis => ({
      date: new Date(analysis.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      income: analysis.totalIncome,
      expense: analysis.totalExpense
    }));
  
  // Get most recent analysis
  const latestAnalysis = savedAnalyses.length > 0 
    ? savedAnalyses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
    
  // Generate dynamic AI insights based on saved analyses
  const aiInsights = useMemo(() => {
    if (savedAnalyses.length === 0) {
      return [
        "Upload your first statement to get personalized financial insights.",
        "AI-powered analysis can help you understand your spending habits better.",
        "Save your analyses to track your financial progress over time."
      ];
    }
    
    const insights = [];
    
    // Calculate savings rate
    const savingsRate = totalIncome > 0 
      ? ((totalIncome - totalExpense) / totalIncome) * 100 
      : 0;
    
    if (savingsRate > 20) {
      insights.push(`Great job! Your overall savings rate is ${savingsRate.toFixed(1)}%, which is above the recommended 20%.`);
    } else if (savingsRate > 0) {
      insights.push(`Your overall savings rate is ${savingsRate.toFixed(1)}%. Consider increasing it to at least 20% for better financial health.`);
    } else if (savingsRate <= 0) {
      insights.push(`Your expenses exceed your income by ${Math.abs(savingsRate).toFixed(1)}%. Consider reviewing your budget to reduce expenses.`);
    }
    
    // Analyze spending trends
    if (trendData.length > 1) {
      const firstExpense = trendData[0].expense;
      const lastExpense = trendData[trendData.length - 1].expense;
      const expenseChange = ((lastExpense - firstExpense) / firstExpense) * 100;
      
      if (expenseChange > 10) {
        insights.push(`Your expenses have increased by ${expenseChange.toFixed(1)}% over the analyzed period. Consider reviewing this upward trend.`);
      } else if (expenseChange < -10) {
        insights.push(`Your expenses have decreased by ${Math.abs(expenseChange).toFixed(1)}% over the analyzed period. Great job on reducing spending!`);
      }
    }
    
    // Category-based insights
    if (latestAnalysis && latestAnalysis.categories) {
      // Find top spending category
      const topCategory = latestAnalysis.categories.reduce((max, cat) => 
        cat.amount > max.amount ? cat : max, { amount: 0 });
      
      if (topCategory.amount > 0) {
        const percentage = (topCategory.amount / latestAnalysis.totalExpense) * 100;
        insights.push(`Your highest spending category is '${topCategory.category}' at ${percentage.toFixed(0)}% of total expenses. ${percentage > 30 ? 'Consider if this aligns with your financial goals.' : ''}`);
      }
    }
    
    // Income and expense balance
    const incomeToExpenseRatio = totalIncome > 0 
      ? totalExpense / totalIncome 
      : 0;
      
    if (incomeToExpenseRatio > 0.9) {
      insights.push(`You're spending ${(incomeToExpenseRatio * 100).toFixed(0)}% of your income. Aim to keep this under 90% to build savings.`);
    }
    
    // Add general tips based on the number of saved analyses
    if (savedAnalyses.length === 1) {
      insights.push("Continue saving analyses to get more detailed financial insights over time.");
    }
    
    // If we couldn't generate enough specific insights, add some general ones
    if (insights.length < 3) {
      insights.push("Regular financial reviews can help you stay on track with your financial goals.");
      insights.push("Consider categorizing your transactions more specifically for better spending insights.");
    }
    
    return insights.slice(0, 4);
  }, [savedAnalyses, totalIncome, totalExpense, trendData, latestAnalysis]);
  
  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-28">
                <CardContent className="p-6">
                  <div className="h-5 w-24 bg-muted/50 rounded-md mb-4"></div>
                  <div className="h-6 w-16 bg-muted/50 rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="h-80">
            <CardHeader>
              <div className="h-5 w-40 bg-muted/50 rounded-md"></div>
            </CardHeader>
            <CardContent>
              <div className="h-full w-full flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-muted-foreground">Manage and analyze your financial data</p>
      </div>
      
      {savedAnalyses.length === 0 ? (
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload your bank statement to start analyzing your finances. You can upload either a PDF or an image of your statement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pdf" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
                  <TabsTrigger value="image">Image Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="pdf" className="p-4">
                  <Link to="/dashboard/upload">
                    <Button className="w-full gap-2">
                      <FileText className="h-4 w-4" />
                      Upload PDF Statement
                    </Button>
                  </Link>
                </TabsContent>
                <TabsContent value="image" className="p-4">
                  <ImageUploader />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Financial Overview</h2>
              <Link to="/dashboard/charts">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  View Detailed Charts
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Income</div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Net Income</div>
                  <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {trendData.length > 1 && (
              <Card className="mb-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Financial Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => formatCurrency(Number(value))}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#22c55e" 
                          name="Income"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expense" 
                          stroke="#ef4444" 
                          name="Expenses"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Statement
                </CardTitle>
                <CardDescription>
                  Upload your bank statement to get started with the analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {statementData 
                    ? `Your current statement has ${statementData.transactions.length} transactions`
                    : "You haven't uploaded any statements yet"}
                </p>
                <Link to="/dashboard/upload">
                  <Button className="gap-2">
                    <FileText className="w-4 h-4" />
                    {statementData ? "Upload Another Statement" : "Upload Statement"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className={cn(
              "border border-border/50 transition-all duration-300",
              statementData ? "hover:border-primary/30" : "opacity-70"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Analyze Expenses
                </CardTitle>
                <CardDescription>
                  View detailed analysis of your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {statementData 
                    ? "Your statement is ready for analysis"
                    : "Upload a statement first to analyze your expenses"}
                </p>
                <Link to="/dashboard/analyze">
                  <Button 
                    className="gap-2" 
                    disabled={!statementData}
                  >
                    <PieChart className="w-4 h-4" />
                    View Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {savedAnalyses.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {savedAnalyses.slice(0, 5).map((analysis, index) => (
                      <div key={analysis.id} className="flex items-start justify-between pb-3 border-b border-border/50 last:border-0">
                        <div>
                          <div className="font-medium">{analysis.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(analysis.date).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-600">{formatCurrency(analysis.totalIncome)}</span> / <span className="text-red-600">{formatCurrency(analysis.totalExpense)}</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Link to={`/dashboard/analyze`}>
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                <PieChart className="h-3 w-3" />
                              </Button>
                            </Link>
                            <Link to={`/dashboard/saved`}>
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                <Info className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to="/dashboard/saved" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      View All Saved Analyses
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Insights
                </CardTitle>
                <CardDescription>
                  Based on your financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex gap-3 pb-3 border-b border-border/50 last:border-0">
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/dashboard/analyze" className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    Get More Insights
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardHome;
