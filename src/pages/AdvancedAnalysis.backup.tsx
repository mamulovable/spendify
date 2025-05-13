import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ChevronRight, 
  AlertTriangle, 
  TrendingUp,
  Tag,
  Fingerprint,
  LineChart,
  Calendar,
  RefreshCw, 
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import CategoryManager from '@/components/analysis/CategoryManager';
import SpendingPatterns from '@/components/analysis/SpendingPatterns';
import AnomalyDetection from '@/components/analysis/AnomalyDetection';
import PredictiveAnalysis from '@/components/analysis/PredictiveAnalysis';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AdvancedAnalysis() {
  const [activeTab, setActiveTab] = useState('categorization');
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    transactions,
    categories,
    patterns,
    anomalies,
    predictions,
    refreshData,
    analyzingData,
    error,
    selectedDocumentId,
    setSelectedDocumentId,
  } = useFinancialData();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Fetch user's documents (statements)
  const fetchDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    if (!user) {
      setLoadingDocuments(false);
      return;
    }
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, statement_date, created_at')
      .eq('user_id', user.id)
      .order('statement_date', { ascending: false });
    if (!error && data) setDocuments(data);
    setLoadingDocuments(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleRefreshAnalysis = () => {
    refreshData();
    toast({
      title: "Analysis Started",
      description: "Your financial data is being analyzed with our AI. This may take a moment.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analysis</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered insights to help you understand your finances better
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2">
          <label htmlFor="document-select" className="font-medium text-sm">Select Statement:</label>
          <select
            id="document-select"
            className="border rounded px-2 py-1"
            value={selectedDocumentId || ''}
            onChange={e => setSelectedDocumentId(e.target.value || null)}
            disabled={loadingDocuments}
          >
            <option value="">All Statements</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name} {doc.statement_date ? `(${doc.statement_date})` : ''}
              </option>
            ))}
          </select>
          <Button 
            onClick={handleRefreshAnalysis} 
            disabled={analyzingData}
            className="gap-2"
          >
            {analyzingData ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {analyzingData ? "Analyzing..." : "Refresh Analysis"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Analysis Overview</CardTitle>
            <CardDescription>Key insights summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Categorized Transactions</span>
              </div>
              <Badge variant="secondary">{transactions?.categorized || 0} / {transactions?.total || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>Spending Patterns</span>
              </div>
              <Badge variant="secondary">{patterns?.count || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span>Anomalies Detected</span>
              </div>
              <Badge variant={anomalies?.count > 0 ? "destructive" : "outline"}>{anomalies?.count || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Recurring Expenses</span>
              </div>
              <Badge variant="outline">{patterns?.recurring || 0}</Badge>
            </div>
            <div className="pt-4">
              <Button variant="outline" size="sm" className="w-full">
                <ChevronRight className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-full md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="categorization">
                <Tag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Categorization</span>
              </TabsTrigger>
              <TabsTrigger value="patterns">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Spending Patterns</span>
              </TabsTrigger>
              <TabsTrigger value="anomalies">
                <Fingerprint className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Anomaly Detection</span>
              </TabsTrigger>
              <TabsTrigger value="predictions">
                <LineChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Predictions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="categorization" className="mt-0">
              <CategoryManager 
                transactions={transactions}
                categories={categories}
              />
            </TabsContent>

            <TabsContent value="patterns" className="mt-0">
              <SpendingPatterns 
                patterns={patterns}
                transactions={transactions}
              />
            </TabsContent>

            <TabsContent value="anomalies" className="mt-0">
              <AnomalyDetection 
                anomalies={anomalies}
                transactions={transactions}
              />
            </TabsContent>

            <TabsContent value="predictions" className="mt-0">
              <PredictiveAnalysis 
                predictions={predictions}
                transactions={transactions}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
