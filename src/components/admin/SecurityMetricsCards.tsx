import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SecurityMetrics } from '@/types/security';
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface SecurityMetricsCardsProps {
  metrics?: SecurityMetrics;
  isLoading: boolean;
}

export function SecurityMetricsCards({ metrics, isLoading }: SecurityMetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin">
            <Loader2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading security metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium">No metrics available</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Security metrics data could not be loaded
        </p>
      </div>
    );
  }

  // Prepare data for alert type chart
  const alertTypeData = Object.entries(metrics.alertsByType).map(([key, value]) => ({
    name: key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    value
  })).sort((a, b) => b.value - a.value);

  // Prepare data for severity chart
  const severityData = Object.entries(metrics.alertsBySeverity).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  // Get color for severity
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                <p className="text-3xl font-bold">{metrics.totalAlerts}</p>
              </div>
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved Alerts</p>
                <p className="text-3xl font-bold">{metrics.unresolvedAlerts}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Alerts</p>
                <p className="text-3xl font-bold">{metrics.criticalAlerts}</p>
              </div>
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Login Success Rate</p>
                <p className="text-3xl font-bold">
                  {Math.round((metrics.loginAttempts.successful / (metrics.loginAttempts.successful + metrics.loginAttempts.failed)) * 100)}%
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.loginAttempts.successful} successful, {metrics.loginAttempts.failed} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Trend Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Alert Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.alertsTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value: number) => [`${value} alerts`, 'Alerts']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorAlerts)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alert Type and Severity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Alerts by Type</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={alertTypeData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }} 
                    width={150}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Alerts by Severity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={severityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSeverityColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}