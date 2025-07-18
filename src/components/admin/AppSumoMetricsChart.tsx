import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RedemptionData {
  date: string;
  count: number;
  plan_type: string;
}

interface AppSumoMetricsChartProps {
  redemptionData: RedemptionData[];
  timeRange: string;
  className?: string;
}

export function AppSumoMetricsChart({ 
  redemptionData, 
  timeRange,
  className 
}: AppSumoMetricsChartProps) {
  // Process data for charts
  const prepareRedemptionChartData = () => {
    if (!redemptionData || redemptionData.length === 0) return null;
    
    // Group by date and plan type
    const groupedData: Record<string, Record<string, number>> = {};
    const planTypes = new Set<string>();
    
    redemptionData.forEach(item => {
      const date = format(parseISO(item.date), 'yyyy-MM-dd');
      if (!groupedData[date]) {
        groupedData[date] = {};
      }
      
      if (!groupedData[date][item.plan_type]) {
        groupedData[date][item.plan_type] = 0;
      }
      
      groupedData[date][item.plan_type] += item.count;
      planTypes.add(item.plan_type);
    });
    
    // Generate dates for the selected time range
    const now = new Date();
    const dates: string[] = [];
    let daysToShow = 30; // Default
    
    switch (timeRange) {
      case '7d':
        daysToShow = 7;
        break;
      case '30d':
        daysToShow = 30;
        break;
      case '90d':
        daysToShow = 90;
        break;
      default:
        daysToShow = 30;
    }
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      dates.push(format(subDays(now, i), 'yyyy-MM-dd'));
    }
    
    // Create datasets for each plan type
    const datasets = Array.from(planTypes).map((planType, index) => {
      const colors = [
        { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.2)' }, // Blue
        { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.2)' }, // Green
        { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.2)' }, // Amber
        { border: 'rgb(239, 68, 68)', background: 'rgba(239, 68, 68, 0.2)' }    // Red
      ];
      
      const color = colors[index % colors.length];
      
      return {
        label: planType === 'ltd_solo' ? 'LTD Solo' : planType === 'ltd_pro' ? 'LTD Pro' : planType,
        data: dates.map(date => groupedData[date]?.[planType] || 0),
        borderColor: color.border,
        backgroundColor: color.background,
        tension: 0.3,
        fill: true
      };
    });
    
    return {
      labels: dates.map(date => format(parseISO(date), 'MMM d')),
      datasets
    };
  };
  
  // Prepare daily redemption data for bar chart
  const prepareDailyRedemptionData = () => {
    if (!redemptionData || redemptionData.length === 0) return null;
    
    // Group by date
    const groupedData: Record<string, number> = {};
    
    redemptionData.forEach(item => {
      const date = format(parseISO(item.date), 'yyyy-MM-dd');
      if (!groupedData[date]) {
        groupedData[date] = 0;
      }
      
      groupedData[date] += item.count;
    });
    
    // Generate dates for the selected time range
    const now = new Date();
    const dates: string[] = [];
    let daysToShow = 14; // Show last 14 days for daily chart
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      dates.push(format(subDays(now, i), 'yyyy-MM-dd'));
    }
    
    return {
      labels: dates.map(date => format(parseISO(date), 'MMM d')),
      datasets: [
        {
          label: 'Daily Redemptions',
          data: dates.map(date => groupedData[date] || 0),
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1
        }
      ]
    };
  };
  
  const chartData = prepareRedemptionChartData();
  const dailyData = prepareDailyRedemptionData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
        title: {
          display: true,
          text: 'Redemptions'
        }
      }
    }
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Redemption Trends</CardTitle>
          <CardDescription>AppSumo code redemptions over time by plan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No redemption data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Redemptions</CardTitle>
          <CardDescription>AppSumo code redemptions for the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {dailyData ? (
              <Bar 
                data={dailyData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No redemption data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}