import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis,
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Shield, ThumbsUp, ThumbsDown, Filter, ExternalLink } from 'lucide-react';
import { Transaction, Anomaly } from '@/hooks/useFinancialData';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/useToast';

interface AnomalyDetectionProps {
  anomalies: {
    data: Anomaly[];
    count: number;
    highSeverity: number;
  };
  transactions: {
    data: Transaction[];
    total: number;
    categorized: number;
  };
}

export default function AnomalyDetection({ anomalies, transactions }: AnomalyDetectionProps) {
  const { updateAnomalyStatus } = useFinancialData();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'false_positive'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Filter anomalies based on selected filters
  const filteredAnomalies = anomalies.data
    .filter(anomaly => statusFilter === 'all' || anomaly.status === statusFilter)
    .filter(anomaly => severityFilter === 'all' || anomaly.severity === severityFilter);

  // Get transaction details for an anomaly
  const getTransactionDetails = (transactionId: string) => {
    return transactions.data.find(t => t.id === transactionId);
  };

  // Handle marking anomaly as reviewed
  const handleMarkAsReviewed = async (anomalyId: string) => {
    await updateAnomalyStatus(anomalyId, 'reviewed');
    toast({
      title: "Anomaly marked as reviewed",
      description: "This anomaly has been marked as reviewed and will be used to improve detection",
    });
  };

  // Handle marking anomaly as false positive
  const handleMarkAsFalsePositive = async (anomalyId: string) => {
    await updateAnomalyStatus(anomalyId, 'false_positive');
    toast({
      title: "Marked as false positive",
      description: "This transaction will no longer be flagged as an anomaly",
    });
  };

  // Get badge color for severity
  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch(severity) {
      case 'high':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'medium':
        return <Badge variant="warning">{severity}</Badge>;
      case 'low':
        return <Badge variant="outline">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: 'new' | 'reviewed' | 'false_positive') => {
    switch(status) {
      case 'new':
        return <Badge variant="secondary">New</Badge>;
      case 'reviewed':
        return <Badge variant="success">Reviewed</Badge>;
      case 'false_positive':
        return <Badge variant="outline">False Positive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">
            We've identified {anomalies.count} potential anomalies in your transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={severityFilter} onValueChange={(value: any) => setSeverityFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomalies by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High', value: anomalies.data.filter(a => a.severity === 'high').length, color: '#ef4444' },
                      { name: 'Medium', value: anomalies.data.filter(a => a.severity === 'medium').length, color: '#f97316' },
                      { name: 'Low', value: anomalies.data.filter(a => a.severity === 'low').length, color: '#a3a3a3' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[
                      { name: 'High', value: anomalies.data.filter(a => a.severity === 'high').length, color: '#ef4444' },
                      { name: 'Medium', value: anomalies.data.filter(a => a.severity === 'medium').length, color: '#f97316' },
                      { name: 'Low', value: anomalies.data.filter(a => a.severity === 'low').length, color: '#a3a3a3' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Count']} 
                    labelFormatter={(name) => `${name} Severity`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-center text-muted-foreground">
              Total: {anomalies.count} anomalies
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anomaly Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius={60} data={[
                  { subject: 'Unusual Amount', A: anomalies.data.filter(a => a.type === 'unusual_amount').length },
                  { subject: 'Unusual Merchant', A: anomalies.data.filter(a => a.type === 'unusual_merchant').length },
                  { subject: 'Unusual Timing', A: anomalies.data.filter(a => a.type === 'unusual_timing').length },
                  { subject: 'Potential Fraud', A: anomalies.data.filter(a => a.type === 'potential_fraud').length }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar name="Anomalies" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-sm text-center text-muted-foreground">
              High severity: {anomalies.highSeverity}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-lg font-medium">Protected</span>
              </div>
              <Badge variant={anomalies.highSeverity > 0 ? "destructive" : "outline"} className="ml-auto">
                {anomalies.highSeverity > 0 ? `${anomalies.highSeverity} alerts` : 'No alerts'}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Fraud detection</span>
                <span className="font-medium text-green-500">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Last scan</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Monitoring status</span>
                <span className="font-medium text-green-500">Real-time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredAnomalies.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-green-500/50 mb-3" />
            <h3 className="text-lg font-medium mb-2">No anomalies found with current filters</h3>
            <p className="text-muted-foreground mb-4">
              {anomalies.count > 0 
                ? "Try adjusting your filters to see anomalies"
                : "We haven't detected any unusual activity in your transactions"
              }
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              setStatusFilter('all');
              setSeverityFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnomalies.map(anomaly => {
            const transaction = getTransactionDetails(anomaly.transaction_id);
            if (!transaction) return null;

            return (
              <Card key={anomaly.id} className={anomaly.severity === 'high' ? 'border-red-200' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>{transaction.description}</CardTitle>
                      <CardDescription>
                        Transaction on {new Date(transaction.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(anomaly.severity)}
                      {getStatusBadge(anomaly.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>
                      {anomaly.description}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Detected on {new Date(anomaly.detected_at).toLocaleString()}
                    </div>
                    <span className={`font-bold ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {anomaly.type === 'potential_fraud' ? (
                      <span className="text-red-500 font-medium">Potential fraud - review immediately</span>
                    ) : (
                      <span>Type: {anomaly.type.replace('_', ' ')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {anomaly.status === 'new' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsFalsePositive(anomaly.id)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          False
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsReviewed(anomaly.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Reviewed
                        </Button>
                      </>
                    )}
                    {anomaly.type === 'potential_fraud' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Report Fraud
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Report Fraud</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will mark the transaction as fraudulent and notify your bank. Would you like to proceed?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Contact Bank</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAnomalies.length} of {anomalies.count} anomalies
        </p>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Security Tips
        </Button>
      </div>
    </div>
  );
}
