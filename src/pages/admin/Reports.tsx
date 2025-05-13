import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  LineChart,
  FileText,
  Users,
  FileSpreadsheet,
  Calendar,
  Filter,
  ChevronDown,
  Download,
  Loader2
} from 'lucide-react';
import { format, sub } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExportDataButton } from '@/components/admin/ExportDataButton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';

type ReportTimeframe = 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ReportCategory = 'financial' | 'user' | 'document' | 'feature';

const reportTypes = [
  { name: 'Financial Summary', value: 'financial', icon: <BarChart className="h-4 w-4" /> },
  { name: 'User Activity', value: 'user', icon: <Users className="h-4 w-4" /> },
  { name: 'Document Processing', value: 'document', icon: <FileText className="h-4 w-4" /> },
  { name: 'Feature Usage', value: 'feature', icon: <FileSpreadsheet className="h-4 w-4" /> },
];

const timeframeOptions = [
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last 90 Days', value: 'quarter' },
  { label: 'Last 365 Days', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
];

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<ReportCategory>('financial');
  const [selectedTimeframe, setSelectedTimeframe] = useState<ReportTimeframe>('month');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: sub(new Date(), { days: 30 }),
    to: new Date(),
  });
  const [generateReport, setGenerateReport] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Get analytics data
  const timeframeObj = {
    start_date: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : sub(new Date(), { days: 30 }).toISOString().split('T')[0],
    end_date: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : new Date().toISOString().split('T')[0]
  };
  
  const {
    userGrowth,
    documentProcessing,
    revenue,
    featureUsage,
    trialConversion,
    retention,
    loading
  } = useAdminAnalytics(timeframeObj);

  // Handle timeframe changes
  const handleTimeframeChange = (value: string) => {
    const tfValue = value as ReportTimeframe;
    setSelectedTimeframe(tfValue);
    
    // Set appropriate date range based on timeframe
    const today = new Date();
    let fromDate;
    
    switch (tfValue) {
      case 'week':
        fromDate = sub(today, { days: 7 });
        break;
      case 'month':
        fromDate = sub(today, { days: 30 });
        break;
      case 'quarter':
        fromDate = sub(today, { days: 90 });
        break;
      case 'year':
        fromDate = sub(today, { days: 365 });
        break;
      default:
        // Keep existing custom range
        return;
    }
    
    setDateRange({
      from: fromDate,
      to: today,
    });
  };

  // Handle generating report
  const handleGenerateReport = () => {
    setGenerateReport(true);
  };

  // Get report data based on type
  const getReportData = () => {
    switch (selectedReportType) {
      case 'financial':
        return revenue;
      case 'user':
        return userGrowth;
      case 'document':
        return documentProcessing;
      case 'feature':
        return featureUsage;
      default:
        return [];
    }
  };

  // Get appropriate export data type
  const getExportDataType = () => {
    switch (selectedReportType) {
      case 'financial':
        return 'revenue';
      case 'user':
        return 'userGrowth';
      case 'document':
        return 'documentProcessing';
      case 'feature':
        return 'featureUsage';
      default:
        return 'userGrowth';
    }
  };

  // Render financial report
  const renderFinancialReport = () => {
    if (loading) {
      return <Skeleton className="w-full h-[400px]" />;
    }

    if (!revenue || revenue.length === 0) {
      return <div className="text-center py-8">No financial data available for the selected period.</div>;
    }

    // Calculate summary metrics
    const totalRevenue = revenue.reduce((sum, item) => sum + item.monthly_revenue, 0);
    const avgMonthlyRevenue = totalRevenue / revenue.length;
    const totalUsers = revenue.reduce((sum, item) => sum + item.paying_users, 0) / revenue.length;
    const avgRevPerUser = totalRevenue / totalUsers;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgMonthlyRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Paying Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalUsers)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Revenue Per User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgRevPerUser)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Details</CardTitle>
            <CardDescription>Monthly revenue breakdown for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Paying Users</TableHead>
                  <TableHead>Avg. Revenue Per User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenue.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(item.month), 'MMMM yyyy')}</TableCell>
                    <TableCell>{formatCurrency(item.monthly_revenue)}</TableCell>
                    <TableCell>{item.paying_users}</TableCell>
                    <TableCell>{formatCurrency(item.monthly_revenue / item.paying_users)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render user report
  const renderUserReport = () => {
    if (loading) {
      return <Skeleton className="w-full h-[400px]" />;
    }

    if (!userGrowth || userGrowth.length === 0) {
      return <div className="text-center py-8">No user data available for the selected period.</div>;
    }

    // Calculate summary metrics
    const totalNewUsers = userGrowth.reduce((sum, item) => sum + item.new_users, 0);
    const avgDailyNewUsers = totalNewUsers / userGrowth.length;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNewUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Daily New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDailyNewUsers.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">User Growth Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userGrowth.length > 1 
                  ? `${((userGrowth[userGrowth.length - 1].new_users / userGrowth[0].new_users - 1) * 100).toFixed(1)}%`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Growth Details</CardTitle>
            <CardDescription>Daily user acquisition for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>New Users</TableHead>
                  <TableHead>Active Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userGrowth.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{item.new_users}</TableCell>
                    <TableCell>{(item as any).active_users || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render document report
  const renderDocumentReport = () => {
    if (loading) {
      return <Skeleton className="w-full h-[400px]" />;
    }

    if (!documentProcessing || documentProcessing.length === 0) {
      return <div className="text-center py-8">No document processing data available for the selected period.</div>;
    }

    // Calculate summary metrics
    const totalDocuments = documentProcessing.reduce((sum, item) => sum + item.documents_processed, 0);
    const avgProcessingTime = documentProcessing.reduce((sum, item) => sum + item.avg_processing_time_seconds, 0) / documentProcessing.length;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Documents Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProcessingTime.toFixed(2)}s</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Daily Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalDocuments / documentProcessing.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Processing Details</CardTitle>
            <CardDescription>Daily document processing metrics for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Documents Processed</TableHead>
                  <TableHead>Avg. Processing Time (s)</TableHead>
                  <TableHead>Error Rate (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentProcessing.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{item.documents_processed}</TableCell>
                    <TableCell>{item.avg_processing_time_seconds.toFixed(2)}</TableCell>
                    <TableCell>{(item as any).error_rate?.toFixed(2) || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render feature usage report
  const renderFeatureReport = () => {
    if (loading) {
      return <Skeleton className="w-full h-[400px]" />;
    }

    if (!featureUsage || featureUsage.length === 0) {
      return <div className="text-center py-8">No feature usage data available for the selected period.</div>;
    }

    // Calculate summary metrics
    const totalUsage = featureUsage.reduce((sum, item) => sum + item.usage_count, 0);
    const totalUniqueUsers = featureUsage.reduce((sum, item) => sum + item.unique_users, 0);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Feature Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsage}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUniqueUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Avg. Usage Per User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalUsage / totalUniqueUsers).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Usage Details</CardTitle>
            <CardDescription>Feature usage breakdown for the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Total Usage</TableHead>
                  <TableHead>Unique Users</TableHead>
                  <TableHead>Avg. Usage Per User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureUsage.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.event_type.replace('feature_', '').replace(/_/g, ' ')}</TableCell>
                    <TableCell>{item.usage_count}</TableCell>
                    <TableCell>{item.unique_users}</TableCell>
                    <TableCell>{(item.usage_count / item.unique_users).toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render appropriate report based on selected type
  const renderReport = () => {
    if (!generateReport) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Generate a Report</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Configure your report parameters and click the Generate button to view detailed analytics.
          </p>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      );
    }

    switch (selectedReportType) {
      case 'financial':
        return renderFinancialReport();
      case 'user':
        return renderUserReport();
      case 'document':
        return renderDocumentReport();
      case 'feature':
        return renderFeatureReport();
      default:
        return <div>Select a report type</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Reports</h2>
          <p className="text-muted-foreground">
            Generate detailed reports on system performance and usage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Configure the parameters for your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select
                value={selectedReportType}
                onValueChange={(value) => setSelectedReportType(value as ReportCategory)}
              >
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Time Period</Label>
              <Select
                value={selectedTimeframe}
                onValueChange={handleTimeframeChange}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className={selectedTimeframe === 'custom' ? 'opacity-100' : 'opacity-50 pointer-events-none'}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setGenerateReport(false)}>Reset</Button>
          <div className="flex gap-2">
            <Button onClick={handleGenerateReport}>Generate Report</Button>
            {generateReport && (
              <ExportDataButton 
                data={getReportData()} 
                dataType={getExportDataType() as any} 
                disabled={loading || !generateReport}
              />
            )}
          </div>
        </CardFooter>
      </Card>

      {renderReport()}
    </div>
  );
}
