import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportDataButton } from '@/components/admin/ExportDataButton';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { AnalyticsExport } from '@/components/admin/AnalyticsExport';
import { AnalyticsFilterBar } from '@/components/admin/AnalyticsFilterBar';
import { MetricsFilterPanel } from '@/components/admin/MetricsFilterPanel';
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
  Activity,
  Clock
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
import { Line, Bar } from 'react-chartjs-2';
import { DateRange } from 'react-day-picker';

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
interface RetentionData {
  cohort_date: string;
  day_0: number;
  day_1: number;
  day_7: number;
  day_30: number;
  day_60: number;
  day_90: number;
}

interface UserEngagement {
  date: string;
  sessions: number;
  avg_session_duration: number;
  pages_per_session: number;
}

interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
}

export default function UserMetrics() {
  const { toast } = useToast();
  
  // State
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [engagementData, setEngagementData] = useState<UserEngagement[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    timeRange: '30d',
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    },
    segments: ['active', 'new'],
    includeInactive: false,
    minSessions: undefined as number | undefined,
  });
  
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
      let endDate: Date = now;
      
      if (timeRange === 'custom' && dateRange?.from) {
        startDate = dateRange.from;
        endDate = dateRange.to || now;
      } else {
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
      }
      
      // Format dates for API calls
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      // Prepare advanced filter parameters
      const segments = advancedFilters.segments.join(',');
      const includeInactive = advancedFilters.includeInactive;
      const minSessions = advancedFilters.minSessions;
      
      // Fetch retention data with advanced filters
      const { data: retentionResult, error: retentionError } = await supabase
        .rpc('get_user_retention', {
          start_date: startDateStr,
          end_date: endDateStr,
          segments: segments,
          include_inactive: includeInactive,
          min_sessions: minSessions
        });
      
      if (retentionError) throw retentionError;
      
      if (retentionResult && retentionResult.length > 0) {
        setRetentionData(retentionResult);
      }
      
      // Fetch engagement data with advanced filters
      const { data: engagementResult, error: engagementError } = await supabase
        .rpc('get_user_engagement', {
          start_date: startDateStr,
          end_date: endDateStr,
          segments: segments,
          include_inactive: includeInactive,
          min_sessions: minSessions
        });
      
      if (engagementError) throw engagementError;
      
      if (engagementResult && engagementResult.length > 0) {
        setEngagementData(engagementResult);
      }
      
      // Fetch user segments with advanced filters
      const { data: segmentsResult, error: segmentsError } = await supabase
        .rpc('get_user_segments', {
          segments: segments,
          include_inactive: includeInactive,
          min_sessions: minSessions
        });
      
      if (segmentsError) throw segmentsError;
      
      if (segmentsResult && segmentsResult.length > 0) {
        setUserSegments(segmentsResult);
      }
      
    } catch (err) {
      console.error('Error fetching user metrics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load user metrics. Please try again.',
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
    // Mock retention data
    setRetentionData([
      { cohort_date: '2023-01-01', day_0: 100, day_1: 80, day_7: 65, day_30: 45, day_60: 35, day_90: 30 },
      { cohort_date: '2023-02-01', day_0: 120, day_1: 95, day_7: 75, day_30: 50, day_60: 40, day_90: 32 },
      { cohort_date: '2023-03-01', day_0: 150, day_1: 125, day_7: 95, day_30: 65, day_60: 50, day_90: 40 },
      { cohort_date: '2023-04-01', day_0: 180, day_1: 150, day_7: 120, day_30: 85, day_60: 65, day_90: 0 },
      { cohort_date: '2023-05-01', day_0: 200, day_1: 170, day_7: 140, day_30: 95, day_60: 0, day_90: 0 },
      { cohort_date: '2023-06-01', day_0: 220, day_1: 190, day_7: 155, day_30: 0, day_60: 0, day_90: 0 }
    ]);
    
    // Mock engagement data
    const engagementMock: UserEngagement[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(now, i);
      engagementMock.push({
        date: format(date, 'yyyy-MM-dd'),
        sessions: Math.floor(Math.random() * 500) + 1000,
        avg_session_duration: Math.floor(Math.random() * 120) + 180,
        pages_per_session: Math.random() * 3 + 2
      });
    }
    
    setEngagementData(engagementMock);
    
    // Mock user segments
    setUserSegments([
      { segment: 'Active Users', count: 2500, percentage: 62.5 },
      { segment: 'Inactive Users', count: 800, percentage: 20 },
      { segment: 'New Users', count: 500, percentage: 12.5 },
      { segment: 'Churned Users', count: 200, percentage: 5 }
    ]);
  };
  
  // Prepare chart data for retention
  const prepareRetentionChartData = () => {
    if (!retentionData || retentionData.length === 0) return null;
    
    return {
      labels: retentionData.map(item => format(new Date(item.cohort_date), 'MMM yyyy')),
      datasets: [
        {
          label: 'Day 1',
          data: retentionData.map(item => (item.day_1 / item.day_0) * 100),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
        },
        {
          label: 'Day 7',
          data: retentionData.map(item => (item.day_7 / item.day_0) * 100),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
        },
        {
          label: 'Day 30',
          data: retentionData.map(item => (item.day_30 / item.day_0) * 100),
          backgroundColor: 'rgba(245, 158, 11, 0.7)',
        },
        {
          label: 'Day 90',
          data: retentionData.map(item => (item.day_90 / item.day_0) * 100),
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
        }
      ]
    };
  };
  
  // Prepare chart data for engagement
  const prepareEngagementChartData = () => {
    if (!engagementData || engagementData.length === 0) return null;
    
    return {
      labels: engagementData.map(item => format(new Date(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Sessions',
          data: engagementData.map(item => item.sessions),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Avg. Session Duration (sec)',
          data: engagementData.map(item => item.avg_session_duration),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
  };
  
  // Chart options
  const retentionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Retention Rate (%)'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  const engagementChartOptions = {
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
          text: 'Sessions'
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
          text: 'Duration (sec)'
        }
      },
    },
    maintainAspectRatio: false,
  };
  
  // Render loading state
  if (loading && retentionData.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">User Metrics</h2>
          <p className="text-muted-foreground">
            Detailed user retention, engagement, and segmentation metrics
          </p>
        </div>
        <AnalyticsFilterBar
          timeRange={timeRange}
          onTimeRangeChange={(value) => {
            if (typeof value === 'string') {
              setTimeRange(value);
              // Keep advanced filters in sync
              setAdvancedFilters({
                ...advancedFilters,
                timeRange: value
              });
            } else {
              // Handle custom date range
              console.log('Custom date range:', value);
              setTimeRange('custom');
            }
          }}
          onRefresh={fetchMetrics}
          exportData={[
            ...retentionData.map(item => ({
              cohort: format(new Date(item.cohort_date), 'MMM yyyy'),
              initial_users: item.day_0,
              day_1_retention: `${((item.day_1 / item.day_0) * 100).toFixed(1)}%`,
              day_7_retention: `${((item.day_7 / item.day_0) * 100).toFixed(1)}%`,
              day_30_retention: `${((item.day_30 / item.day_0) * 100).toFixed(1)}%`,
              day_90_retention: `${((item.day_90 / item.day_0) * 100).toFixed(1)}%`
            }))
          ]} 
          exportFilename="user-retention-export"
          exportFormats={['csv', 'excel', 'json']}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          showDateRangePicker={timeRange === 'custom'}
        >
          <MetricsFilterPanel
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onApplyFilters={() => {
              // Apply advanced filters
              setTimeRange(advancedFilters.timeRange);
              if (advancedFilters.timeRange === 'custom' && advancedFilters.dateRange) {
                setDateRange(advancedFilters.dateRange);
              }
              fetchMetrics();
            }}
            onResetFilters={() => {
              // Reset to default filters
              const defaultFilters = {
                timeRange: '30d',
                dateRange: {
                  from: subDays(new Date(), 30),
                  to: new Date(),
                },
                segments: ['active', 'new'],
                includeInactive: false,
                minSessions: undefined as number | undefined,
              };
              setAdvancedFilters(defaultFilters);
              setTimeRange('30d');
              setDateRange({
                from: subDays(new Date(), 30),
                to: new Date(),
              });
              fetchMetrics();
            }}
          />
        </AnalyticsFilterBar>
      </div>
      
      {/* User Segments Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userSegments.map((segment) => (
          <Card key={segment.segment}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {segment.segment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">{segment.count.toLocaleString()}</div>
                </div>
                <div className="text-sm font-medium">
                  {segment.percentage.toFixed(1)}%
                </div>
              </div>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${segment.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="retention" className="w-full">
        <TabsList>
          <TabsTrigger value="retention">User Retention</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>User retention rates by cohort over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {retentionData.length > 0 ? (
                  <Bar 
                    data={prepareRetentionChartData() as any} 
                    options={retentionChartOptions} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No retention data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Retention Details</CardTitle>
              <CardDescription>Detailed retention metrics by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium">Cohort</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Users</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Day 1</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Day 7</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Day 30</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Day 90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionData.map((item) => (
                      <tr key={item.cohort_date} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle font-medium">
                          {format(new Date(item.cohort_date), 'MMM yyyy')}
                        </td>
                        <td className="p-4 align-middle">{item.day_0}</td>
                        <td className="p-4 align-middle">
                          {item.day_1} ({((item.day_1 / item.day_0) * 100).toFixed(1)}%)
                        </td>
                        <td className="p-4 align-middle">
                          {item.day_7} ({((item.day_7 / item.day_0) * 100).toFixed(1)}%)
                        </td>
                        <td className="p-4 align-middle">
                          {item.day_30 > 0 ? `${item.day_30} (${((item.day_30 / item.day_0) * 100).toFixed(1)}%)` : '-'}
                        </td>
                        <td className="p-4 align-middle">
                          {item.day_90 > 0 ? `${item.day_90} (${((item.day_90 / item.day_0) * 100).toFixed(1)}%)` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Metrics</CardTitle>
              <CardDescription>Sessions and session duration over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {engagementData.length > 0 ? (
                  <Line 
                    data={prepareEngagementChartData() as any} 
                    options={engagementChartOptions} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No engagement data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Sessions Per User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">
                    {engagementData.length > 0 
                      ? (engagementData.reduce((sum, item) => sum + item.sessions, 0) / engagementData.length / 100).toFixed(1)
                      : '0'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sessions per user in selected period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Session Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">
                    {engagementData.length > 0 
                      ? formatDuration(engagementData.reduce((sum, item) => sum + item.avg_session_duration, 0) / engagementData.length)
                      : '0:00'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average time spent per session
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pages Per Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileUp className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">
                    {engagementData.length > 0 
                      ? (engagementData.reduce((sum, item) => sum + item.pages_per_session, 0) / engagementData.length).toFixed(1)
                      : '0'}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Average pages viewed per session
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to format duration in seconds to mm:ss
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}