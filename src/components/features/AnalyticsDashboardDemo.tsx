import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Sample data for the analytics charts
const MONTHLY_SPENDING_DATA = [
  { month: 'Jan', amount: 2100 },
  { month: 'Feb', amount: 2300 },
  { month: 'Mar', amount: 2000 },
  { month: 'Apr', amount: 2780 },
  { month: 'May', amount: 1890 },
  { month: 'Jun', amount: 2390 },
  { month: 'Jul', amount: 2490 },
];

const CATEGORY_SPENDING_DATA = [
  { name: 'Housing', value: 1200, color: '#4f46e5' },
  { name: 'Food', value: 450, color: '#0ea5e9' },
  { name: 'Transport', value: 300, color: '#10b981' },
  { name: 'Utilities', value: 200, color: '#f59e0b' },
  { name: 'Entertainment', value: 250, color: '#ec4899' },
  { name: 'Other', value: 180, color: '#8b5cf6' },
];

const WEEKLY_SPENDING_DATA = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 85 },
  { day: 'Wed', amount: 110 },
  { day: 'Thu', amount: 95 },
  { day: 'Fri', amount: 180 },
  { day: 'Sat', amount: 210 },
  { day: 'Sun', amount: 150 },
];

// Insight cards data
const INSIGHT_CARDS = [
  {
    title: 'Monthly Spending',
    value: '$2,490',
    change: '+4.2%',
    trend: 'up',
    description: 'vs. last month',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    title: 'Largest Category',
    value: 'Housing',
    change: '$1,200',
    trend: 'neutral',
    description: '48% of total',
    icon: <PieChartIcon className="h-4 w-4" />
  },
  {
    title: 'Savings Rate',
    value: '15%',
    change: '+2.5%',
    trend: 'up',
    description: 'vs. last month',
    icon: <ArrowUpRight className="h-4 w-4" />
  },
  {
    title: 'Food Spending',
    value: '$450',
    change: '-5.2%',
    trend: 'down',
    description: 'vs. last month',
    icon: <ArrowDownRight className="h-4 w-4" />
  }
];

// Time period options
const TIME_PERIODS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
  { value: 'year', label: 'Yearly' }
];

// Chart type options
const CHART_TYPES = [
  { value: 'line', label: 'Line', icon: <LineChartIcon className="h-4 w-4" /> },
  { value: 'bar', label: 'Bar', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'pie', label: 'Pie', icon: <PieChartIcon className="h-4 w-4" /> }
];

/**
 * AnalyticsDashboardDemo Component
 * 
 * An interactive visualization of the analytics dashboard
 * with selectable time periods, chart types, and insight cards.
 */
const AnalyticsDashboardDemo = () => {
  const [timePeriod, setTimePeriod] = useState('month');
  const [chartType, setChartType] = useState('line');
  
  // Get data based on selected time period
  const getChartData = () => {
    switch (timePeriod) {
      case 'week':
        return WEEKLY_SPENDING_DATA;
      case 'month':
      default:
        return MONTHLY_SPENDING_DATA;
    }
  };
  
  // Render the appropriate chart based on selected type
  const renderChart = () => {
    const data = getChartData();
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={timePeriod === 'week' ? 'day' : 'month'} 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Spending']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={CATEGORY_SPENDING_DATA}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {CATEGORY_SPENDING_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Spending']}
                labelFormatter={(label) => `${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey={timePeriod === 'week' ? 'day' : 'month'} 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Spending']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium">Analytics Dashboard</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Premium Feature
          </Badge>
        </div>
        
        {/* Chart Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Tabs 
              value={timePeriod} 
              onValueChange={setTimePeriod}
              className="w-[300px]"
            >
              <TabsList className="grid grid-cols-4">
                {TIME_PERIODS.map((period) => (
                  <TabsTrigger 
                    key={period.value} 
                    value={period.value}
                    className="text-xs"
                  >
                    {period.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-2">
            {CHART_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={chartType === type.value ? "default" : "outline"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setChartType(type.value)}
              >
                {type.icon}
                <span className="ml-1 text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Chart Display */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          {renderChart()}
        </div>
        
        {/* Insight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INSIGHT_CARDS.map((card, index) => (
            <div 
              key={index}
              className="bg-muted/30 rounded-lg p-4 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{card.title}</span>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  card.trend === 'up' ? "bg-emerald-100 text-emerald-600" : 
                  card.trend === 'down' ? "bg-rose-100 text-rose-600" : 
                  "bg-blue-100 text-blue-600"
                )}>
                  {card.icon}
                </div>
              </div>
              <div className="text-xl font-bold mb-1">{card.value}</div>
              <div className="flex items-center text-xs">
                <span className={cn(
                  card.trend === 'up' ? "text-emerald-600" : 
                  card.trend === 'down' ? "text-rose-600" : 
                  "text-blue-600"
                )}>
                  {card.change}
                </span>
                <span className="text-muted-foreground ml-1">{card.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AnalyticsDashboardDemo;