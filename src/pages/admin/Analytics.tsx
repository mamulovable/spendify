import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, TrendingUp, TrendingDown, Users, FileText, DollarSign, Activity } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminAnalytics, type AnalyticsTimeframe } from '@/hooks/useAdminAnalytics';
import { addDays, format, sub } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({  
    from: sub(new Date(), { days: 30 }),
    to: new Date(),
  });
  
  const timeframe: AnalyticsTimeframe = {
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
    loading,
    error,
    refresh
  } = useAdminAnalytics(timeframe);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Explore user analytics, revenue metrics, and platform performance
          </p>
        </div>
        <DatePickerWithRange
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="justify-self-end"
        />
      </div>

      <Tabs defaultValue="system">
        <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-5">
          <TabsTrigger value="system">Overview</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="financial">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {userGrowth.reduce((sum, item) => sum + item.new_users, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userGrowth.length > 0 && userGrowth[userGrowth.length - 1].new_users > 0 ? (
                        <span className="text-green-500 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{userGrowth[userGrowth.length - 1].new_users} new today
                        </span>
                      ) : (
                        <span>No new users today</span>
                      )}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documents Processed
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {documentProcessing.reduce((sum, item) => sum + item.documents_processed, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {documentProcessing.length > 0 ? (
                        <span>
                          Avg. {Math.round(documentProcessing.reduce((sum, item) => sum + item.avg_processing_time_seconds, 0) / documentProcessing.length)}s processing time
                        </span>
                      ) : (
                        <span>No documents processed</span>
                      )}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(revenue.reduce((sum, item) => sum + item.monthly_revenue, 0))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {revenue.length > 0 ? (
                        <span>
                          From {revenue.reduce((sum, item) => sum + item.paying_users, 0)} paying users
                        </span>
                      ) : (
                        <span>No revenue data</span>
                      )}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Trial Conversion
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-full" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {trialConversion.length > 0 ? (
                        <span>
                          {Math.round(trialConversion.reduce((sum, item) => sum + item.conversion_rate, 0) / trialConversion.length)}%
                        </span>
                      ) : (
                        "0%"
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trialConversion.length > 0 ? (
                        <span>
                          {trialConversion.reduce((sum, item) => sum + item.converted_users, 0)} conversions
                        </span>
                      ) : (
                        <span>No conversion data</span>
                      )}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : userGrowth.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">No user data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={userGrowth}>
                      <defs>
                        <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <RechartsTooltip
                        formatter={(value: number) => [`${value} new users`, 'New Users']}
                        labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="new_users" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#userGrowthFill)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used features</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : featureUsage.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">No feature usage data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={featureUsage.slice(0, 5)}>
                      <XAxis 
                        dataKey="event_type" 
                        tickFormatter={(event) => event.replace('feature_', '')}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <RechartsTooltip
                        formatter={(value: number, name: string) => [
                          `${value} times`, 
                          name === 'usage_count' ? 'Total Usage' : 'Unique Users'
                        ]}
                        labelFormatter={(event) => event.replace('feature_', '')}
                      />
                      <Bar 
                        dataKey="usage_count" 
                        fill="hsl(var(--primary))" 
                        name="Total Usage"
                      />
                      <Bar 
                        dataKey="unique_users" 
                        fill="hsl(var(--secondary))" 
                        name="Unique Users"
                      />
                      <Legend />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Details</CardTitle>
              <CardDescription>Detailed user acquisition metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : userGrowth.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center">
                  <p className="text-muted-foreground">No user data available</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                      />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <RechartsTooltip
                        formatter={(value: number) => [`${value} users`, 'New Users']}
                        labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="new_users" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div>
                    <h3 className="text-lg font-medium mb-4">User Growth Table</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>New Users</TableHead>
                            <TableHead>Total Users</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userGrowth.map((item, index) => {
                            const totalUsers = userGrowth
                              .slice(0, index + 1)
                              .reduce((sum, i) => sum + i.new_users, 0);
                              
                            return (
                              <TableRow key={item.date}>
                                <TableCell>{format(new Date(item.date), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{item.new_users}</TableCell>
                                <TableCell>{totalUsers}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
              <CardDescription>How well users are retained over time</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : retention.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No retention data available</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cohort Date</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Week 1</TableHead>
                  <TableHead>Week 2</TableHead>
                  <TableHead>Week 3</TableHead>
                  <TableHead>Week 4</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {retention.map((cohort) => (
                  <TableRow key={cohort.cohort_date}>
                    <TableCell>{format(new Date(cohort.cohort_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{cohort.total_users}</TableCell>
                    <TableCell className={cohort.week_1 >= 40 ? 'text-green-500' : cohort.week_1 >= 20 ? 'text-amber-500' : 'text-red-500'}>
                      {cohort.week_1}%
                    </TableCell>
                    <TableCell className={cohort.week_2 >= 30 ? 'text-green-500' : cohort.week_2 >= 15 ? 'text-amber-500' : 'text-red-500'}>
                      {cohort.week_2}%
                    </TableCell>
                    <TableCell className={cohort.week_3 >= 25 ? 'text-green-500' : cohort.week_3 >= 10 ? 'text-amber-500' : 'text-red-500'}>
                      {cohort.week_3}%
                    </TableCell>
                    <TableCell className={cohort.week_4 >= 20 ? 'text-green-500' : cohort.week_4 >= 8 ? 'text-amber-500' : 'text-red-500'}>
                      {cohort.week_4}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Retention Heat Map</h3>
            <div className="grid grid-cols-5 gap-2">
              <div className="font-medium">Cohort</div>
              <div className="font-medium text-center">Week 1</div>
              <div className="font-medium text-center">Week 2</div>
              <div className="font-medium text-center">Week 3</div>
              <div className="font-medium text-center">Week 4</div>
              
              {retention.map((cohort) => (
                <React.Fragment key={cohort.cohort_date}>
                  <div className="text-sm">{format(new Date(cohort.cohort_date), 'MMM dd')}</div>
                  <div 
                    className="p-2 text-center rounded-md text-sm" 
                    style={{ 
                      backgroundColor: `rgba(var(--primary-rgb), ${cohort.week_1 / 100})`,
                      color: cohort.week_1 > 50 ? 'white' : 'inherit'
                    }}
                  >
                    {cohort.week_1}%
                  </div>
                  <div 
                    className="p-2 text-center rounded-md text-sm" 
                    style={{ 
                      backgroundColor: `rgba(var(--primary-rgb), ${cohort.week_2 / 100})`,
                      color: cohort.week_2 > 50 ? 'white' : 'inherit'
                    }}
                  >
                    {cohort.week_2}%
                  </div>
                  <div 
                    className="p-2 text-center rounded-md text-sm" 
                    style={{ 
                      backgroundColor: `rgba(var(--primary-rgb), ${cohort.week_3 / 100})`,
                      color: cohort.week_3 > 50 ? 'white' : 'inherit'
                    }}
                  >
                    {cohort.week_3}%
                  </div>
                  <div 
                    className="p-2 text-center rounded-md text-sm" 
                    style={{ 
                      backgroundColor: `rgba(var(--primary-rgb), ${cohort.week_4 / 100})`,
                      color: cohort.week_4 > 50 ? 'white' : 'inherit'
                    }}
                  >
                    {cohort.week_4}%
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : revenue.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No revenue data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={revenue}>
              <XAxis 
                dataKey="month" 
                tickFormatter={(date) => format(new Date(date), 'MMM yy')}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <RechartsTooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(date) => format(new Date(date), 'MMMM yyyy')}
              />
              <Bar dataKey="monthly_revenue" fill="hsl(var(--primary))" name="Revenue" />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Trial Conversion</CardTitle>
        <CardDescription>Weekly trial to paid conversion rates</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : trialConversion.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No conversion data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trialConversion}>
              <XAxis 
                dataKey="week" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  name === 'conversion_rate' ? `${value}%` : value,
                  name === 'conversion_rate' ? 'Conversion Rate' : 
                  name === 'trial_users' ? 'Trial Users' : 'Converted Users'
                ]}
                labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
              />
              <Line 
                type="monotone" 
                dataKey="conversion_rate" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Conversion Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>

    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Trial to paid conversion funnel</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : trialConversion.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No conversion data available</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {(() => {
                  const totalTrialUsers = trialConversion.reduce((sum, item) => sum + item.trial_users, 0);
                  const totalConversions = trialConversion.reduce((sum, item) => sum + item.converted_users, 0);
                  const avgConversionRate = Math.round(trialConversion.reduce((sum, item) => sum + item.conversion_rate, 0) / trialConversion.length);
                  
                  return (
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-t-lg text-center">
                        <div className="text-2xl font-bold">{totalTrialUsers}</div>
                        <div className="text-muted-foreground">Free Trial Users</div>
                      </div>
                      <div className="h-8 flex justify-center items-center">
                        <div className="h-full w-1 bg-muted"></div>
                      </div>
                      <div className="bg-muted p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{totalConversions}</div>
                        <div className="text-muted-foreground">Converted to Paid</div>
                        <Badge variant="outline" className="mt-2">{avgConversionRate}% Conversion Rate</Badge>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Trial Users</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialConversion.map((item) => (
                    <TableRow key={item.week}>
                      <TableCell>{format(new Date(item.week), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{item.trial_users}</TableCell>
                      <TableCell>{item.converted_users}</TableCell>
                      <TableCell>
                        <Badge variant={item.conversion_rate >= 20 ? 'default' : 'secondary'}>
                          {item.conversion_rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Document Processing Metrics</CardTitle>
        <CardDescription>Processing time and volume</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : documentProcessing.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No document processing data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart 
              data={documentProcessing}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  name === 'documents_processed' ? value : `${value}s`,
                  name === 'documents_processed' ? 'Documents' : 'Avg. Processing Time'
                ]}
                labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="documents_processed" 
                stroke="hsl(var(--primary))" 
                name="Documents Processed"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avg_processing_time_seconds" 
                stroke="hsl(var(--secondary))" 
                name="Avg. Processing Time (s)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>API Performance</CardTitle>
        <CardDescription>Response times and success rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">API performance monitoring coming soon</p>
        </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Button
        onClick={refresh}
        variant="outline"
        className="mt-4"
      >
        Refresh Data
      </Button>
    </div>
  );
}
