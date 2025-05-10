import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={[
                    { name: 'Jan', value: 100 },
                    { name: 'Feb', value: 120 },
                    { name: 'Mar', value: 170 },
                    // Add more data points
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLoading ? (
                      <p className="text-sm text-muted-foreground">Loading activity...</p>
                    ) : activityLogs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    ) : (
                      activityLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              {log.action} {log.resource}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {log.admin_email}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics content */}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Reports content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
