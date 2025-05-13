import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getSavedAnalyses, deleteAnalysis, SavedAnalysis } from '@/services/storageService';
import { useStatement } from '@/contexts/StatementContext';
import { ProcessedStatement } from '@/services/pdfService';
import Navbar from '@/components/Navbar';
import { Download, Trash2, ArrowLeft } from 'lucide-react';

const SavedAnalyses = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const savedAnalyses = await getSavedAnalyses();
      setAnalyses(savedAnalyses);
    } catch (error) {
      console.error('Failed to load analyses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved analyses. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const { setStatementData, clearData } = useStatement();

  const handleLoadAnalysis = (analysis: SavedAnalysis) => {
    // Clear existing data first
    clearData();
    
    // Convert SavedAnalysis to ProcessedStatement format
    const processedStatement = {
      transactions: analysis.transactions,
      totalIncome: analysis.totalIncome,
      totalExpense: analysis.totalExpense,
      categories: analysis.categories,
      insights: analysis.insights
    };
    
    // Update the statement context with the processed statement
    setStatementData(processedStatement);
    
    // Navigate to analyze page
    navigate('/dashboard/analyze');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/analyze')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </Button>
            <h1 className="text-3xl font-bold">Saved Analyses</h1>
          </div>
          
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <div className="h-5 w-32 bg-muted/50 rounded-md mb-4"></div>
                    <div className="h-4 w-24 bg-muted/50 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await deleteAnalysis(id);
      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      toast({
        title: "Analysis Deleted",
        description: "The saved analysis has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the analysis. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard/analyze')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Analysis
            </Button>
            <h1 className="text-3xl font-bold">Saved Analyses</h1>
          </div>
          
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <div className="h-5 w-32 bg-muted/50 rounded-md mb-4"></div>
                    <div className="h-4 w-24 bg-muted/50 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/analyze')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Button>
          <h1 className="text-3xl font-bold">Saved Analyses</h1>
        </div>

        {analyses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">No Saved Analyses</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't saved any analyses yet. Go back to the analysis page to create and save your first analysis.
                </p>
                <Button onClick={() => navigate('/dashboard/analyze')}>
                  Go to Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">{analysis.name}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLoadAnalysis(analysis)}
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Transactions: {analysis.transactions.length}</p>
                    <p>Total Income: ${analysis.totalIncome.toFixed(2)}</p>
                    <p>Total Expenses: ${analysis.totalExpense.toFixed(2)}</p>
                    <p>Saved: {new Date(analysis.date).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAnalyses; 