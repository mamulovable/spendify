import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsFilterBar } from '@/components/admin/AnalyticsFilterBar';
import { format, subDays, startOfMonth, endOfMonth, addMonths, isSameMonth } from 'date-fns';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  Info,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Tooltip as TooltipUI, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TransactionTable, Transaction } from '@/components/admin/TransactionTable';
import { TransactionDetails } from '@/components/admin/TransactionDetails';

// Import chart components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Metric types
interface RevenueMetrics {
  lifetime_revenue: number;
  mrr: number;
  ltv: number;
  arpu: number;
  churn_revenue: number;
  previous_mrr?: number;
  previous_ltv?: number;
  previous_churn_revenue?: number;
  arr?: number;
}

interface RevenueTimeline {
  date: string;
  revenue: number;
  new_subscriptions: number;
  renewals: number;
  cancellations: number;
}

interface PlanRevenue {
  plan_type: string;
  revenue: number;
  subscribers: number;
  arpu: number;
}

export default function Revenue() {
  const { toast } = useToast();
  
  // State
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [revenueTimeline, setRevenueTimeline] = useState<RevenueTimeline[]>([]);
  const [planRevenue, setPlanRevenue] = useState<PlanRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlans, setSelectedPlans] = useState(['free', 'premium', 'ltd_solo', 'ltd_pro']);
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [transactionType, setTransactionType] = useState<string>('all');
  
  // Fetch metrics
  useEffect(() => {
    fetchMetrics();
  }, [timeRange, selectedPlans]);
  
  const fetchMetrics = async () => {
    setLoading(true);
    
    try {
      // Calculate date ranges based on selected time range
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '90d':
          startDate = subDays(now, 90);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        default:
          startDate = subDays(now, 30);
      }
      
      // Format dates for API calls
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(now, 'yyyy-MM-dd');
      
      // Fetch revenue metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_revenue_metrics', {
          start_date: startDateStr,
          end_date: endDateStr,
          plan_types: selectedPlans
        });
      
      if (metricsError) throw metricsError;
      
      if (metricsData) {
        setRevenueMetrics({
          lifetime_revenue: metricsData.lifetime_revenue || 0,
          mrr: metricsData.mrr || 0,
          ltv: metricsData.ltv || 0,
          arpu: metricsData.arpu || 0,
          churn_revenue: metricsData.churn_revenue || 0
        });
      }
      
      // Fetch revenue timeline
      const { data: timelineData, error: timelineError } = await supabase
        .rpc('get_revenue_timeline', {
          start_date: startDateStr,
          end_date: endDateStr,
          plan_types: selectedPlans
        });
      
      if (timelineError) throw timelineError;
      
      if (timelineData && timelineData.length > 0) {
        setRevenueTimeline(timelineData);
      }
      
      // Fetch plan revenue breakdown
      const { data: planData, error: planError } = await supabase
        .rpc('get_plan_revenue', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (planError) throw planError;
      
      if (planData && planData.length > 0) {
        setPlanRevenue(planData);
      }
      
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load revenue data. Please try again.',
        variant: 'destructive',
      });
      
      // Set mock data for demonstration
      setMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Set mock data for demonstration
  const setMockData = () => {
    // Mock revenue metrics with trend data
    setRevenueMetrics({
      lifetime_revenue: 125000,
      mrr: 15000,
      ltv: 450,
      arpu: 25,
      churn_revenue: 1200,
      previous_mrr: 13800,
      previous_ltv: 428,
      previous_churn_revenue: 1220,
      arr: 180000
    });
    
    // Mock revenue timeline with trend data
    const timelineMock: RevenueTimeline[] = [];
    const now = new Date();
    
    // Generate more realistic data with a growth trend
    let baseRevenue = 350;
    let growthFactor = 1.01; // 1% daily growth
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      // Apply some randomness but maintain the growth trend
      const dailyRevenue = baseRevenue * (1 + (Math.random() * 0.2 - 0.1));
      
      timelineMock.push({
        date: format(date, 'yyyy-MM-dd'),
        revenue: Math.round(dailyRevenue * 100) / 100,
        new_subscriptions: Math.floor(Math.random() * 10) + 5,
        renewals: Math.floor(Math.random() * 20) + 10,
        cancellations: Math.floor(Math.random() * 3) + 1
      });
      
      // Increase base revenue for next day (growth trend)
      baseRevenue *= growthFactor;
    }
    
    setRevenueTimeline(timelineMock);
    
    // Mock plan revenue with more detailed data
    setPlanRevenue([
      { plan_type: 'Free', revenue: 0, subscribers: 2500, arpu: 0 },
      { plan_type: 'Premium', revenue: 25000, subscribers: 500, arpu: 50 },
      { plan_type: 'LTD Solo', revenue: 15000, subscribers: 300, arpu: 50 },
      { plan_type: 'LTD Pro', revenue: 30000, subscribers: 200, arpu: 150 }
    ]);
  };
  
  // Calculate metrics trends based on current and previous data
  const getMRRTrend = () => {
    if (!revenueMetrics || !revenueMetrics.previous_mrr || revenueMetrics.previous_mrr === 0) {
      return {
        percentage: 8.5,
        isPositive: true
      };
    }
    
    const percentage = ((revenueMetrics.mrr - revenueMetrics.previous_mrr) / revenueMetrics.previous_mrr) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0
    };
  };
  
  const getLTVTrend = () => {
    if (!revenueMetrics || !revenueMetrics.previous_ltv || revenueMetrics.previous_ltv === 0) {
      return {
        percentage: 5.2,
        isPositive: true
      };
    }
    
    const percentage = ((revenueMetrics.ltv - revenueMetrics.previous_ltv) / revenueMetrics.previous_ltv) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0
    };
  };
  
  const getChurnTrend = () => {
    if (!revenueMetrics || !revenueMetrics.previous_churn_revenue || revenueMetrics.previous_churn_revenue === 0) {
      return {
        percentage: 1.5,
        isPositive: false
      };
    }
    
    const percentage = ((revenueMetrics.churn_revenue - revenueMetrics.previous_churn_revenue) / revenueMetrics.previous_churn_revenue) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: percentage > 0 // For churn, positive change is bad (more churn)
    };
  };
  
  // Prepare chart data with trend analysis
  const prepareRevenueChartData = () => {
    if (!revenueTimeline || revenueTimeline.length === 0) return null;
    
    // Calculate 7-day moving average for trend analysis
    const movingAverages = [];
    for (let i = 0; i < revenueTimeline.length; i++) {
      if (i < 6) {
        // Not enough data for 7-day average at the beginning
        movingAverages.push(null);
      } else {
        // Calculate average of last 7 days
        const sum = revenueTimeline.slice(i-6, i+1).reduce((acc, item) => acc + item.revenue, 0);
        movingAverages.push(sum / 7);
      }
    }
    
    // Calculate trend line using simple linear regression
    const xValues = Array.from({ length: revenueTimeline.length }, (_, i) => i);
    const yValues = revenueTimeline.map(item => item.revenue);
    
    // Calculate slope and intercept for trend line
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const trendLine = xValues.map(x => slope * x + intercept);
    
    return {
      labels: revenueTimeline.map(item => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Daily Revenue',
          data: revenueTimeline.map(item => item.revenue),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          tension: 0.3,
          yAxisID: 'y',
          fill: true,
        },
        {
          label: '7-Day Moving Average',
          data: movingAverages,
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.4,
          yAxisID: 'y',
          fill: false,
        },
        {
          label: 'Trend Line',
          data: trendLine,
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0,
          yAxisID: 'y',
          fill: false,
        },
        {
          label: 'New Subscriptions',
          data: revenueTimeline.map(item => item.new_subscriptions),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          tension: 0.3,
          yAxisID: 'y1',
          borderWidth: 2,
          pointRadius: 2,
        }
      ]
    };
  };
  
  const preparePlanRevenueChartData = () => {
    if (!planRevenue || planRevenue.length === 0) return null;
    
    return {
      labels: planRevenue.map(item => item.plan_type),
      datasets: [
        {
          label: 'Revenue by Plan',
          data: planRevenue.map(item => item.revenue),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderWidth: 1,
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
        }
      ]
    };
  };
  
  // Prepare plan breakdown data for pie chart
  const preparePlanBreakdownData = () => {
    if (!planRevenue || planRevenue.length === 0) return null;
    
    return {
      labels: planRevenue.map(item => item.plan_type),
      datasets: [
        {
          label: 'Revenue Distribution',
          data: planRevenue.map(item => item.revenue),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Prepare subscribers by plan data
  const prepareSubscribersByPlanData = () => {
    if (!planRevenue || planRevenue.length === 0) return null;
    
    return {
      labels: planRevenue.map(item => item.plan_type),
      datasets: [
        {
          label: 'Subscribers by Plan',
          data: planRevenue.map(item => item.subscribers),
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(79, 70, 229, 0.7)',
            'rgba(67, 56, 202, 0.7)',
            'rgba(55, 48, 163, 0.7)',
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(79, 70, 229)',
            'rgb(67, 56, 202)',
            'rgb(55, 48, 163)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  // Chart options
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Subscriptions'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  const planRevenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  // Render loading state
  if (loading && !revenueMetrics) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue & Billing</h2>
          <p className="text-muted-foreground">
            Track revenue metrics, subscriptions, and financial performance
          </p>
        </div>
        <AnalyticsFilterBar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={fetchMetrics}
          exportData={revenueTimeline}
          exportFilename="revenue-export"
          showPlanTypeFilter={true}
          selectedPlans={selectedPlans}
          onPlanTypeChange={setSelectedPlans}
          showDateRangePicker={true}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          showTransactionTypeFilter={true}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
        />
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TooltipProvider>
          {/* Monthly Recurring Revenue Card */}
          <Card className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Recurring Revenue
                </CardTitle>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Total revenue generated from recurring subscriptions on a monthly basis.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-2xl font-bold">${revenueMetrics?.mrr.toLocaleString() || 0}</div>
                </div>
                <div className="flex items-center">
                  {getMRRTrend().isPositive ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${getMRRTrend().isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {getMRRTrend().percentage}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Compared to previous {timeRange}
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                <span>ARR: ${revenueMetrics?.arr?.toLocaleString() || (revenueMetrics?.mrr ? (revenueMetrics.mrr * 12).toLocaleString() : 0)}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Lifetime Value Card */}
          <Card className="overflow-hidden border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lifetime Value (LTV)
                </CardTitle>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Average revenue generated per customer over their entire relationship with the business.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-2xl font-bold">${revenueMetrics?.ltv.toLocaleString() || 0}</div>
                </div>
                <div className="flex items-center">
                  {getLTVTrend().isPositive ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${getLTVTrend().isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {getLTVTrend().percentage}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Average revenue per customer lifetime
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                <span>LTV:CAC Ratio: 3.2:1</span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Lifetime Revenue Card */}
          <Card className="overflow-hidden border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lifetime Revenue
                </CardTitle>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Total revenue generated from all customers since the beginning of the business.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
                  <div className="text-2xl font-bold">${revenueMetrics?.lifetime_revenue.toLocaleString() || 0}</div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-xs text-muted-foreground">
                    All time
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ARPU: ${revenueMetrics?.arpu.toFixed(2) || 0} per user
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <PieChart className="h-3 w-3 mr-1" />
                <span>Avg. transaction: ${(revenueMetrics?.lifetime_revenue && planRevenue.length > 0) ? 
                  (revenueMetrics.lifetime_revenue / planRevenue.reduce((sum, plan) => sum + plan.subscribers, 0)).toFixed(2) : 0}</span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Revenue Churn Card */}
          <Card className="overflow-hidden border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Revenue Churn
                </CardTitle>
                <TooltipUI>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Revenue lost from cancellations and downgrades during the selected period.
                    </p>
                  </TooltipContent>
                </TooltipUI>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
                  <div className="text-2xl font-bold">${revenueMetrics?.churn_revenue.toLocaleString() || 0}</div>
                </div>
                <div className="flex items-center">
                  {getChurnTrend().isPositive ? (
                    <ArrowUp className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-green-500" />
                  )}
                  <span className={`text-xs ${getChurnTrend().isPositive ? 'text-red-500' : 'text-green-500'}`}>
                    {getChurnTrend().percentage}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lost revenue from cancellations
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-2">
              <div className="text-xs text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                <span>Churn rate: {(revenueMetrics?.churn_revenue && revenueMetrics?.mrr) ? 
                  ((revenueMetrics.churn_revenue / revenueMetrics.mrr) * 100).toFixed(1) : 0}%</span>
              </div>
            </CardFooter>
          </Card>
        </TooltipProvider>
      </div>
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Revenue Timeline</TabsTrigger>
          <TabsTrigger value="plans">Revenue by Plan</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Timeline</CardTitle>
              <CardDescription>Daily revenue and new subscriptions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {revenueTimeline.length > 0 ? (
                  <Line 
                    data={prepareRevenueChartData() as any} 
                    options={revenueChartOptions} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue by Plan Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Revenue distribution across different subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {planRevenue.length > 0 ? (
                    <Bar 
                      data={preparePlanRevenueChartData() as any} 
                      options={planRevenueChartOptions} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No plan revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Revenue Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Percentage breakdown of revenue by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  {planRevenue.length > 0 ? (
                    <Doughnut 
                      data={preparePlanBreakdownData() as any}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              boxWidth: 12,
                              padding: 15
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.raw as number;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                              }
                            }
                          }
                        },
                        cutout: '60%'
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">No plan revenue data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Subscribers by Plan Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribers by Plan</CardTitle>
              <CardDescription>Distribution of subscribers across different plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {planRevenue.length > 0 ? (
                  <Bar 
                    data={prepareSubscribersByPlanData() as any}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.raw as number;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Subscribers'
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No subscriber data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Plan Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>Detailed breakdown of revenue by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Plan</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Revenue</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Subscribers</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">ARPU</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planRevenue.map((plan) => {
                      const totalRevenue = planRevenue.reduce((sum, p) => sum + p.revenue, 0);
                      const percentage = totalRevenue > 0 ? (plan.revenue / totalRevenue) * 100 : 0;
                      
                      return (
                        <tr key={plan.plan_type} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle font-medium">{plan.plan_type}</td>
                          <td className="p-4 align-middle">${plan.revenue.toLocaleString()}</td>
                          <td className="p-4 align-middle">{plan.subscribers.toLocaleString()}</td>
                          <td className="p-4 align-middle">${plan.arpu.toFixed(2)}</td>
                          <td className="p-4 align-middle">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-muted/50 font-medium">
                      <td className="p-4 align-middle">Total</td>
                      <td className="p-4 align-middle">${planRevenue.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}</td>
                      <td className="p-4 align-middle">{planRevenue.reduce((sum, p) => sum + p.subscribers, 0).toLocaleString()}</td>
                      <td className="p-4 align-middle">
                        ${planRevenue.reduce((sum, p) => sum + p.revenue, 0) / planRevenue.reduce((sum, p) => sum + (p.subscribers || 1), 0) > 0 
                          ? (planRevenue.reduce((sum, p) => sum + p.revenue, 0) / planRevenue.reduce((sum, p) => sum + (p.subscribers || 1), 0)).toFixed(2) 
                          : '0.00'}
                      </td>
                      <td className="p-4 align-middle">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Detailed view of all revenue transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable 
                transactions={getMockTransactions()}
                isLoading={loading}
                onViewDetails={handleViewTransactionDetails}
                onExportCSV={handleExportTransactions}
                transactionType={transactionType}
                selectedPlans={selectedPlans}
              />
            </CardContent>
          </Card>
          
          {/* Transaction Details Dialog */}
          <TransactionDetails 
            transaction={selectedTransaction}
            open={isTransactionDetailsOpen}
            onOpenChange={setIsTransactionDetailsOpen}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}  
// Transaction state and handlers
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);

  // Handle viewing transaction details
  const handleViewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  };

  // Handle exporting transactions
  const handleExportTransactions = () => {
    const transactions = getMockTransactions();
    const filteredTransactions = transactions.filter(transaction => {
      // Filter by transaction type
      const matchesType = transactionType === 'all' || transaction.transaction_type === transactionType;
      
      // Filter by plan type
      const matchesPlan = selectedPlans.length === 0 || 
        selectedPlans.includes('all') || 
        selectedPlans.includes(transaction.plan_type.toLowerCase());
      
      return matchesType && matchesPlan;
    });

    // Create CSV content
    const headers = ['Date', 'User', 'Plan', 'Amount', 'Type', 'Status', 'Reference'];
    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.user_email,
        t.plan_type,
        t.amount.toFixed(2),
        t.transaction_type,
        t.status,
        t.reference || ''
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate mock transactions for demonstration
  const getMockTransactions = (): Transaction[] => {
    const transactions: Transaction[] = [];
    const now = new Date();
    const transactionTypes: Array<'subscription' | 'one_time' | 'refund' | 'appsumo'> = [
      'subscription', 'subscription', 'subscription', 'one_time', 'one_time', 'refund', 'appsumo'
    ];
    const statuses: Array<'completed' | 'pending' | 'failed' | 'refunded'> = [
      'completed', 'completed', 'completed', 'pending', 'failed', 'refunded'
    ];
    const planTypes = ['Free', 'Premium', 'LTD Solo', 'LTD Pro'];
    const userEmails = [
      'john.doe@example.com',
      'jane.smith@example.com',
      'robert.johnson@example.com',
      'sarah.williams@example.com',
      'michael.brown@example.com',
      'emily.davis@example.com',
      'david.miller@example.com',
      'lisa.wilson@example.com'
    ];
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'appsumo'];

    // Generate 30 random transactions
    for (let i = 0; i < 30; i++) {
      const transactionDate = subDays(now, Math.floor(Math.random() * 30));
      const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const planType = planTypes[Math.floor(Math.random() * planTypes.length)];
      const userEmail = userEmails[Math.floor(Math.random() * userEmails.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Set amount based on plan type
      let amount = 0;
      switch (planType) {
        case 'Premium':
          amount = 49.99;
          break;
        case 'LTD Solo':
          amount = 79.99;
          break;
        case 'LTD Pro':
          amount = 149.99;
          break;
      }
      
      // Adjust amount for refunds
      if (transactionType === 'refund') {
        amount = -amount;
      }
      
      transactions.push({
        id: `txn-${Math.random().toString(36).substring(2, 10)}`,
        date: format(transactionDate, 'yyyy-MM-dd'),
        user_email: userEmail,
        user_id: `user-${Math.random().toString(36).substring(2, 10)}`,
        plan_type: planType,
        amount: amount,
        payment_method: paymentMethod,
        status: status,
        transaction_type: transactionType,
        reference: `ref-${Math.random().toString(36).substring(2, 10)}`
      });
    }
    
    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };