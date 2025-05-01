import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { saveAnalysis } from '@/services/storageService';
import { BankTransaction } from '@/services/pdfService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SaveAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: BankTransaction[];
  totalIncome: number;
  totalExpense: number;
  categories: any[];
  insights: string[];
}

export function SaveAnalysisDialog({
  isOpen,
  onClose,
  transactions,
  totalIncome,
  totalExpense,
  categories,
  insights
}: SaveAnalysisDialogProps) {
  const { toast } = useToast();
  const [analysisName, setAnalysisName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!analysisName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please provide a name for your analysis.",
      });
      return;
    }

    try {
      setIsSaving(true);
      await saveAnalysis(
        analysisName,
        transactions,
        totalIncome,
        totalExpense,
        categories,
        insights
      );
      
      toast({
        title: "Analysis Saved",
        description: "Your analysis has been saved successfully.",
      });
      
      setAnalysisName('');
      onClose();
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was an error saving your analysis. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Your Analysis</DialogTitle>
          <DialogDescription>
            Save your current analysis to access it later
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="analysis-name">Analysis Name</Label>
            <Input
              id="analysis-name"
              placeholder="Monthly Budget Analysis"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="grid gap-2">
            <div className="text-sm text-muted-foreground">
              This will save:
            </div>
            <ul className="text-sm list-disc list-inside text-muted-foreground">
              <li>{transactions.length} transactions</li>
              <li>Category breakdown</li>
              <li>Income and expenses</li>
              <li>{insights.length} AI insights</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !analysisName.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Analysis'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 