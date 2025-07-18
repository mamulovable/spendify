import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportDataButton } from '@/components/admin/ExportDataButton';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { PlanTypeFilter } from '@/components/admin/PlanTypeFilter';
import { AnalyticsExport } from '@/components/admin/AnalyticsExport';
import { AnalyticsFilterBar } from '@/components/admin/AnalyticsFilterBar';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Users, 
  UserPlus, 
  UserMinus, 
  Calendar, 
  Download, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileUp,
  Activity
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

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
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

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
  Legend
);

// Metric types
interface UserMetrics {
  total_users: number;
  new_users_month: number;
  new_users_week: number;
  active_users_daily: number;
  active_users_monthly: number;
  churn_rate: number;
  retention_rate: number;
}

interface TimeSeriesData {
  dates: string[];
  values: number[];
}

interface PlanDistribution {
  labels: string[];
  values: number[];
}

export default function Analytics() {
  const { toast } = useToast();
  
  // State
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [userGrowth, setUserGrowth] = useState<TimeSeriesData | null>(null);
  const [activeUsers, setActiveUsers] = useState<TimeSeriesData | null>(null);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  // Fetch metrics
  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);
  
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
      
      // Fetch user metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_user_metrics', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (metricsError) throw metricsError;
      
      if (metricsData) {
        setUserMetrics({
          total_users: metricsData.total_users || 0,
          new_users_month: metricsData.new_users_month || 0,
          new_users_week: metricsData.new_users_week || 0,
          active_users_daily: metricsData.active_users_daily || 0,
          active_users_monthly: metricsData.active_users_monthly || 0,
          churn_rate: metricsData.churn_rate || 0,
          retention_rate: metricsData.retention_rate || 0
        });
      }
      
      // Fetch user growth time series
      const { data: growthData, error: growthError } = await supabase
        .rpc('get_user_growth_timeseries', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (growthError) throw growthError;
      
      if (growthData && growthData.length > 0) {
        setUserGrowth({
          dates: growthData.map((item: any) => format(new Date(item.date), 'MMM d')),
          values: growthData.map((item: any) => item.new_users)
        });
      }
      
      // Fetch active users time series
      const { data: activeData, error: activeError } = await supabase
        .rpc('get_active_users_timeseries', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (activeError) throw activeError;
      
      if (activeData && activeData.length > 0) {
        setActiveUsers({
          dates: activeData.map((item: any) => format(new Date(item.date), 'MMM d')),
          values: activeData.map((item: any) => item.active_users)
        });
      }
      
      // Fetch plan distribution
      const { data: planData, error: planError } = await supabase
        .rpc('get_plan_distribution');
      
      if (planError) throw planError;
      
      if (planData && planData.length > 0) {
        setPlanDistribution({
          labels: planData.map((item: any) => item.plan_type || 'Free'),
          values: planData.map((item: any) => item.count)
        });
      }
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate metrics trends (mock data for now)
  const getUserGrowthTrend = () => {
    return {
      percentage: 12.5,
      isPositive: true
    };
  };
  
  const getActiveUsersTrend = () => {
    return {
      percentage: 8.3,
      isPositive: true
    };
  };
  
  const getChurnRateTrend = () => {
    return {
      percentage: 2.1,
      isPositive: false
    };
  };
  
  // Prepare chart data
  const userGrowthChartData = {
    labels: userGrowth?.dates || [],
    datasets: [
      {
        label: 'New Users',
        data: userGrowth?.values || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const activeUsersChartData = {
    labels: activeUsers?.dates || [],
    datasets: [
      {
        label: 'Active Users',
        data: activeUsers?.values || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const planDistributionChartData = {
    labels: planDistribution?.labels || [],
    datasets: [
      {
        label: 'Users by Plan',
        data: planDistribution?.values || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const lineChartOptions = {
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
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    maintainAspectRatio: false,
  };
  
  // Render loading state
  if (loading && !userMetrics) {
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
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Monitor user metrics, engagement, and platform performance
          </p>
        </div>
        <AnalyticsFilterBar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={fetchMetrics}
          exportData={[
            { 
              metric: 'Total Users', 
              value: userMetrics?.total_users || 0 
            },
            { 
              metric: 'New Users (Month)', 
              value: userMetrics?.new_users_month || 0 
            },
            { 
              metric: 'New Users (Week)', 
              value: userMetrics?.new_users_week || 0 
            },
            { 
              metric: 'DAU', 
              value: userMetrics?.active_users_daily || 0 
            },
            { 
              metric: 'MAU', 
              value: userMetrics?.active_users_monthly || 0 
            },
            { 
              metric: 'Churn Rate', 
              value: `${(userMetrics?.churn_rate || 0).toFixed(2)}%` 
            },
            { 
              metric: 'Retention Rate', 
              value: `${(userMetrics?.retention_rate || 0).toFixed(2)}%` 
            }
          ]} 
          exportFilename="analytics-export"
          showPlanTypeFilter={true}
          selectedPlans={['free', 'premium', 'ltd_solo', 'ltd_pro']}
          onPlanTypeChange={(plans) => {
            console.log('Selected plans:', plans);
            // Update your filtering logic here
          }}
        />
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{userMetrics?.total_users.toLocaleString() || 0}</div>
              </div>
              <div className="flex items-center">
                {getUserGrowthTrend().isPositive ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${getUserGrowthTrend().isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {getUserGrowthTrend().percentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Compared to previous {timeRange}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users (DAU/MAU)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">
                  {userMetrics?.active_users_daily.toLocaleString() || 0} / {userMetrics?.active_users_monthly.toLocaleString() || 0}
                </div>
              </div>
              <div className="flex items-center">
                {getActiveUsersTrend().isPositive ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${getActiveUsersTrend().isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {getActiveUsersTrend().percentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Daily / Monthly active users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserPlus className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{userMetrics?.new_users_month.toLocaleString() || 0}</div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                <span className="text-xs text-muted-foreground">
                  This month
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userMetrics?.new_users_week.toLocaleString() || 0} new users this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserMinus className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{(userMetrics?.churn_rate || 0).toFixed(1)}%</div>
              </div>
              <div className="flex items-center">
                {getChurnRateTrend().isPositive ? (
                  <ArrowUp className="h-4 w-4 text-red-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-xs ${getChurnRateTrend().isPositive ? 'text-red-500' : 'text-green-500'}`}>
                  {getChurnRateTrend().percentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Retention rate: {(userMetrics?.retention_rate || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="plans">Plan Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user signups over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {userGrowth ? (
                  <Line data={userGrowthChartData} options={lineChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {activeUsers ? (
                  <Line data={activeUsersChartData} options={lineChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Users by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {planDistribution ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Pie data={planDistributionChartData} options={pieChartOptions} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="space-y-4">
                        {planDistribution.labels.map((label, index) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2"
                                style={{ 
                                  backgroundColor: [
                                    'rgba(59, 130, 246, 0.7)',
                                    'rgba(16, 185, 129, 0.7)',
                                    'rgba(245, 158, 11, 0.7)',
                                    'rgba(239, 68, 68, 0.7)',
                                  ][index % 4] 
                                }}
                              />
                              <span className="font-medium">{label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{planDistribution.values[index]}</span>
                              <span className="text-muted-foreground text-sm">
                                ({((planDistribution.values[index] / planDistribution.values.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
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