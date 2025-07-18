import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DocumentProcessingMetrics } from '@/types/documentProcessing';

interface DocumentQueueMetricsProps {
  metrics: DocumentProcessingMetrics[];
  isLoading: boolean;
}

export function DocumentQueueMetrics({ metrics, isLoading }: DocumentQueueMetricsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No metrics data available.</p>
      </div>
    );
  }

  // Format data for charts
  const formattedData = metrics
    .sort((a, b) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
    .map(metric => ({
      date: format(parseISO(metric.metric_date), 'MMM dd'),
      pending: metric.pending_documents,
      processing: metric.processing_documents,
      completed: metric.completed_documents,
      failed: metric.failed_documents,
      total: metric.total_documents,
      avgTime: metric.avg_processing_time || 0,
      successRate: metric.success_rate || 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Processing Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="volume">
          <TabsList className="mb-4">
            <TabsTrigger value="volume">Processing Volume</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="volume" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" stackId="a" />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" stackId="a" />
                  <Bar dataKey="processing" name="Processing" fill="#6366f1" stackId="a" />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <p className="text-sm font-medium mb-2">Average Processing Time (seconds)</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avgTime" 
                      name="Avg. Processing Time" 
                      stroke="#6366f1" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-64">
                <p className="text-sm font-medium mb-2">Success Rate (%)</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="successRate" 
                      name="Success Rate" 
                      stroke="#10b981" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}