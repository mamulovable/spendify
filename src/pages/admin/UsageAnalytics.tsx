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
  FileUp, 
  Download, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Activity,
  Percent,
  CreditCard,
  TrendingUp
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
interface DocumentUploadMetrics {
  date: string;
  uploads_count: number;
  success_count: number;
  failure_count: number;
  processing_time_avg: number;
}

interface RevenueByPlan {
  plan_type: string;
  revenue: number;
  user_count: number;
}

interface ConversionMetrics {
  date: string;
  free_signups: number;
  conversions: number;
  conversion_rate: number;
}

export default function UsageAnalytics() {
  const { toast } = useToast();
  
  // State
  const [documentMetrics, setDocumentMetrics] = useState<DocumentUploadMetrics[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<RevenueByPlan[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics[]>([]);
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
      
      // Fetch document upload metrics
      const { data: documentData, error: documentError } = await supabase
        .rpc('get_document_upload_metrics', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (documentError) throw documentError;
      
      if (documentData && documentData.length > 0) {
        setDocumentMetrics(documentData);
      }
      
      // Fetch revenue by plan
      const { data: revenueData, error: revenueError } = await supabase
        .rpc('get_revenue_by_plan');
      
      if (revenueError) throw revenueError;
      
      if (revenueData && revenueData.length > 0) {
        setRevenueByPlan(revenueData);
      }
      
      // Fetch conversion metrics
      const { data: conversionData, error: conversionError } = await supabase
        .rpc('get_conversion_metrics', {
          start_date: startDateStr,
          end_date: endDateStr
        });
      
      if (conversionError) throw conversionError;
      
      if (conversionData && conversionData.length > 0) {
        setConversionMetrics(conversionData);
      }
      
    } catch (err) {
      console.error('Error fetching usage analytics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load usage analytics. Please try again.',
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
    // Mock document upload metrics
    const documentMock: DocumentUploadMetrics[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      const uploads = Math.floor(Math.random() * 50) + 50;
      const success = Math.floor(uploads * (0.85 + Math.random() * 0.1));
      
      documentMock.push({
        date: format(date, 'yyyy-MM-dd'),
        uploads_count: uploads,
        success_count: success,
        failure_count: uploads - success,
        processing_time_avg: Math.floor(Math.random() * 20) + 10
      });
    }
    
    setDocumentMetrics(documentMock);
    
    // Mock revenue by plan
    setRevenueByPlan([
      { plan_type: 'Free', revenue: 0, user_count: 2500 },
      { plan_type: 'Premium', revenue: 25000, user_count: 500 },
      { plan_type: 'LTD Solo', revenue: 15000, user_count: 300 },
      { plan_type: 'LTD Pro', revenue: 30000, user_count: 200 }
    ]);
    
    // Mock conversion metrics
    const conversionMock: ConversionMetrics[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      const freeSignups = Math.floor(Math.random() * 30) + 20;
      const conversions = Math.floor(freeSignups * (0.05 + Math.random() * 0.1));
      
      conversionMock.push({
        date: format(date, 'yyyy-MM-dd'),
        free_signups: freeSignups,
        conversions: conversions,
        conversion_rate: (conversions / freeSignups) * 100
      });
    }
    
    setConversionMetrics(conversionMock);
  };
  
  // Calculate summary metrics
  const calculateDocumentSummary = () => {
    if (!documentMetrics || documentMetrics.length === 0) {
      return { total: 0, success: 0, failure: 0, successRate: 0, avgTime: 0 };
    }
    
    const total = documentMetrics.reduce((sum, item) => sum + item.uploads_count, 0);
    const success = documentMetrics.reduce((sum, item) => sum + item.success_count, 0);
    const failure = documentMetrics.reduce((sum, item) => sum + item.failure_count, 0);
    const successRate = total > 0 ? (success / total) * 100 : 0;
    const avgTime = documentMetrics.reduce((sum, item) => sum + item.processing_time_avg, 0) / documentMetrics.length;
    
    return { total, success, failure, successRate, avgTime };
  };
  
  const calculateRevenueSummary = () => {
    if (!revenueByPlan || revenueByPlan.length === 0) {
      return { total: 0, avgPerUser: 0 };
    }
    
    const total = revenueByPlan.reduce((sum, item) => sum + item.revenue, 0);
    const totalUsers = revenueByPlan.reduce((sum, item) => sum + item.user_count, 0);
    const avgPerUser = totalUsers > 0 ? total / totalUsers : 0;
    
    return { total, avgPerUser };
  };
  
  const calculateConversionSummary = () => {
    if (!conversionMetrics || conversionMetrics.length === 0) {
      return { avgRate: 0, trend: 0 };
    }
    
    const avgRate = conversionMetrics.reduce((sum, item) => sum + item.conversion_rate, 0) / conversionMetrics.length;
    
    // Calculate trend (comparing first half to second half)
    const midpoint = Math.floor(conversionMetrics.length / 2);
    const firstHalf = conversionMetrics.slice(0, midpoint);
    const secondHalf = conversionMetrics.slice(midpoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.conversion_rate, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.conversion_rate, 0) / secondHalf.length;
    
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    return { avgRate, trend };
  };
  
  // Prepare chart data
  const prepareDocumentChartData = () => {
    if (!documentMetrics || documentMetrics.length === 0) return null;
    
    return {
      labels: documentMetrics.map(item => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Total Uploads',
          data: documentMetrics.map(item => item.uploads_count),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
        {
          label: 'Successful',
          data: documentMetrics.map(item => item.success_count),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
        },
        {
          label: 'Failed',
          data: documentMetrics.map(item => item.failure_count),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }
      ]
    };
  };
  
  const prepareRevenueChartData = () => {
    if (!revenueByPlan || revenueByPlan.length === 0) return null;
    
    return {
      labels: revenueByPlan.map(item => item.plan_type),
      datasets: [
        {
          label: 'Revenue',
          data: revenueByPlan.map(item => item.revenue),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  const prepareConversionChartData = () => {
    if (!conversionMetrics || conversionMetrics.length === 0) return null;
    
    return {
      labels: conversionMetrics.map(item => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Free Signups',
          data: conversionMetrics.map(item => item.free_signups),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          yAxisID: 'y',
        },
        {
          label: 'Conversions',
          data: conversionMetrics.map(item => item.conversions),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          yAxisID: 'y',
        },
        {
          label: 'Conversion Rate (%)',
          data: conversionMetrics.map(item => item.conversion_rate),
          type: 'line' as const,
          borderColor: 'rgba(245, 158, 11, 1)',
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
  };
  
  // Chart options
  const documentChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Documents'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  const revenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
    maintainAspectRatio: false,
  };
  
  const conversionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Users'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 20,
        title: {
          display: true,
          text: 'Conversion Rate (%)'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  // Summary metrics
  const documentSummary = calculateDocumentSummary();
  const revenueSummary = calculateRevenueSummary();
  const conversionSummary = calculateConversionSummary();
  
  // Render loading state
  if (loading && documentMetrics.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">Usage Analytics</h2>
          <p className="text-muted-foreground">
            Document processing, revenue, and conversion metrics
          </p>
        </div>
        <AnalyticsFilterBar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          onRefresh={fetchMetrics}
          exportData={documentMetrics}
          exportFilename="document-uploads-export"
        />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Document Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileUp className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{documentSummary.total.toLocaleString()}</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Uploads
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-lg font-medium">{documentSummary.successRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Processing Time</p>
                <p className="text-lg font-medium">{documentSummary.avgTime.toFixed(1)}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">${revenueSummary.total.toLocaleString()}</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Average Revenue Per User</p>
              <p className="text-lg font-medium">${revenueSummary.avgPerUser.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Percent className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">{conversionSummary.avgRate.toFixed(1)}%</div>
              </div>
              <div className="flex items-center">
                {conversionSummary.trend > 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${conversionSummary.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(conversionSummary.trend).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Free to Paid Conversion</p>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${conversionSummary.avgRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Document Uploads</TabsTrigger>
          <TabsTrigger value="revenue">Revenue by Plan</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload Metrics</CardTitle>
              <CardDescription>Document processing volume and success rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {documentMetrics.length > 0 ? (
                  <Bar 
                    data={prepareDocumentChartData() as any} 
                    options={documentChartOptions} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No document metrics available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
              <CardDescription>Revenue distribution across different subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {revenueByPlan.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Pie 
                        data={prepareRevenueChartData() as any} 
                        options={revenueChartOptions} 
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="space-y-4">
                        {revenueByPlan.map((plan, index) => (
                          <div key={plan.plan_type} className="flex items-center justify-between">
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
                              <span className="font-medium">{plan.plan_type}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">${plan.revenue.toLocaleString()}</span>
                              <span className="text-muted-foreground text-sm">
                                ({plan.user_count} users)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Free to paid conversion metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {conversionMetrics.length > 0 ? (
                  <Bar 
                    data={prepareConversionChartData() as any} 
                    options={conversionChartOptions} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No conversion data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>Detailed breakdown of user conversion journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                  <div className="bg-muted/50 p-4 rounded-lg text-center min-w-[200px]">
                    <p className="text-sm text-muted-foreground">Free Signups</p>
                    <p className="text-2xl font-bold mt-2">
                      {conversionMetrics.reduce((sum, item) => sum + item.free_signups, 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <TrendingUp className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  
                  <div className="bg-muted/50 p-4 rounded-lg text-center min-w-[200px]">
                    <p className="text-sm text-muted-foreground">Trial Users</p>
                    <p className="text-2xl font-bold mt-2">
                      {Math.floor(conversionMetrics.reduce((sum, item) => sum + item.free_signups, 0) * 0.4).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (40% of signups)
                    </p>
                  </div>
                  
                  <TrendingUp className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                  
                  <div className="bg-primary/10 p-4 rounded-lg text-center min-w-[200px]">
                    <p className="text-sm text-muted-foreground">Paid Conversions</p>
                    <p className="text-2xl font-bold mt-2 text-primary">
                      {conversionMetrics.reduce((sum, item) => sum + item.conversions, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ({conversionSummary.avgRate.toFixed(1)}% conversion rate)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium">Top Conversion Sources</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Direct</span>
                        <span className="font-medium">45%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Organic Search</span>
                        <span className="font-medium">25%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Referral</span>
                        <span className="font-medium">18%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Social</span>
                        <span className="font-medium">12%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium">Most Popular Plans</p>
                    <ul className="mt-2 space-y-2">
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">Premium</span>
                        <span className="font-medium">45%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">LTD Solo</span>
                        <span className="font-medium">30%</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-muted-foreground">LTD Pro</span>
                        <span className="font-medium">25%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm font-medium">Avg. Time to Convert</p>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From Signup</span>
                        <span className="font-medium">4.5 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">From First Upload</span>
                        <span className="font-medium">2.3 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">After Trial End</span>
                        <span className="font-medium">1.2 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}