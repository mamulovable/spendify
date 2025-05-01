import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { getSavedAnalyses, deleteAnalysis, SavedAnalysis } from '@/services/storageService';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Download } from 'lucide-react';

interface SavedAnalysesProps {
  onLoadAnalysis: (analysis: any) => void;
}

export function SavedAnalyses({ onLoadAnalysis }: SavedAnalysesProps) {
  const { toast } = useToast();
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = async () => {
    try {
      const analyses = await getSavedAnalyses();
      setSavedAnalyses(analyses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load saved analyses:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved analyses."
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnalysis(id);
      setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      toast({
        title: "Success",
        description: "Analysis deleted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the analysis."
      });
    }
  };

  const handleLoad = (analysis: SavedAnalysis) => {
    onLoadAnalysis(analysis);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedAnalyses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>No saved analyses yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {savedAnalyses.map((analysis) => (
              <Card key={analysis.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{analysis.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(analysis.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLoad(analysis)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Income: </span>
                      <span className="text-green-600">{formatCurrency(analysis.totalIncome)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expenses: </span>
                      <span className="text-red-600">{formatCurrency(analysis.totalExpense)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transactions: </span>
                      <span>{analysis.transactions.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Categories: </span>
                      <span>{analysis.categories?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 