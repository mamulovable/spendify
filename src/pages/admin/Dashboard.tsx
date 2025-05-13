import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  BarChart as BarChartIcon,
  PiggyBank,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Wifi,
  LoaderCircle,
  Database,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminMetrics } from '@/hooks/useAdminMetrics';
import { useAdminActivity } from '@/hooks/useAdminActivity';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';



export default function AdminDashboard() {
  const { adminUser } = useAdmin();
  const { metrics, loading, error, refresh } = useAdminMetrics();
  const { logs: activityLogs, loading: activityLoading } = useAdminActivity(5);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            System overview and key metrics
          </p>
          <div className="mt-4 flex space-x-3">
            <Link to="/admin/documents" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Document Management
            </Link>
            <Link to="/admin/settings" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md inline-flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              System Settings
            </Link>
          </div>
        </div>
        <div>
          <Link to="/admin/analytics" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            View Analytics
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/users" className="group">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70">
                    Manage users and permissions
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/subscriptions" className="group">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70">
                    Manage user subscriptions
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/settings" className="group">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Admin</div>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70">
                    Configure application settings
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/plans" className="group">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plans</CardTitle>
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70">
                    Manage subscription plans
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/admin/analytics" className="group">
              <Card className="transition-colors hover:border-primary/50 hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <BarChartIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70">
                    View detailed analytics
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {metrics.activeUsers} active now
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                {metrics.userGrowth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.userGrowth >= 0 ? '+' : ''}
                  {metrics.userGrowth.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.newUsers} new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Subscriptions
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  ${metrics.monthlyRevenue.toFixed(2)} MRR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  System Health
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.errorRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.processingQueue} in queue
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>User growth and document processing over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={[
                    { name: 'Jan', users: 150, documents: 210 },
                    { name: 'Feb', users: 180, documents: 280 },
                    { name: 'Mar', users: 210, documents: 350 },
                    { name: 'Apr', users: 250, documents: 420 },
                    { name: 'May', users: 300, documents: 520 },
                    { name: 'Jun', users: 350, documents: 650 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" name="Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="documents" name="Documents" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* System Status Card */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">System Status <Badge variant="outline" className="ml-2">Live</Badge></CardTitle>
                <CardDescription>Current operational status of the Spendify Guru system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> Operational
                      </Badge>
                      <span className="text-sm font-medium">API Service</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{metrics.apiLoad.toFixed(2)}% load</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> Operational
                      </Badge>
                      <span className="text-sm font-medium">Database</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Connected</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="mr-1 h-3 w-3 text-yellow-500" /> Processing
                      </Badge>
                      <span className="text-sm font-medium">Document Queue</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{metrics.processingQueue} pending</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {metrics.errorRate > 5 ? (
                        <Badge variant="outline" className="mr-2 bg-red-100 text-red-800 hover:bg-red-100">
                          <AlertCircle className="mr-1 h-3 w-3 text-red-500" /> Warning
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="mr-1 h-3 w-3 text-green-500" /> Normal
                        </Badge>
                      )}
                      <span className="text-sm font-medium">Error Rate</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{metrics.errorRate.toFixed(1)}%</div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>System Health</span>
                      <span className="font-medium">
                        {metrics.errorRate > 5 ? "Needs Attention" : "Good"}
                      </span>
                    </div>
                    <Progress value={100 - metrics.errorRate} className={metrics.errorRate > 5 ? "bg-red-100" : "bg-green-100"} />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" size="sm">
                  <LoaderCircle className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-4 md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLoading ? (
                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Loading activity...
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                      No recent activity
                    </div>
                  ) : (
                    activityLogs.map((log: any) => {
                      const getActivityIcon = () => {
                        switch(log.action) {
                          case 'created':
                            return <CheckCircle className="h-4 w-4 text-green-500" />;
                          case 'updated':
                            return <Activity className="h-4 w-4 text-blue-500" />;
                          case 'deleted':
                            return <AlertCircle className="h-4 w-4 text-red-500" />;
                          case 'error':
                            return <AlertCircle className="h-4 w-4 text-red-500" />;
                          default:
                            return <Activity className="h-4 w-4 text-muted-foreground" />;
                        }
                      };
                      
                      return (
                        <div
                          key={log.id}
                          className="flex items-start space-x-3 rounded-md border p-3">
                          <div className="mt-1">
                            {getActivityIcon()}
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {log.action.charAt(0).toUpperCase() + log.action.slice(1)} {log.resource}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                            {log.details && (
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Summary of app usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center">
                <Link to="/admin/analytics" className="inline-flex items-center justify-center">
                  <Button>
                    <BarChartIcon className="mr-2 h-4 w-4" />
                    View Full Analytics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and export detailed reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center">
                <Link to="/admin/reports" className="inline-flex items-center justify-center">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
