import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AIFeedback } from '@/types/aiFeedback';
import { Loader2, CheckCircle, XCircle, AlertCircle, Eye, Edit, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MisclassificationReviewInterfaceProps {
  feedbackList: AIFeedback[];
  onReviewFeedback: (feedbackId: string, addToTraining: boolean) => Promise<boolean>;
  onAddTrainingExample: (
    inputData: Record<string, any>,
    expectedOutput: Record<string, any>,
    category: string,
    feedbackId?: string
  ) => Promise<string>;
  isLoading: boolean;
}

export const MisclassificationReviewInterface: React.FC<MisclassificationReviewInterfaceProps> = ({
  feedbackList,
  onReviewFeedback,
  onAddTrainingExample,
  isLoading
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<AIFeedback | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [correctedOutput, setCorrectedOutput] = useState<Record<string, any> | null>(null);
  const [category, setCategory] = useState('transaction_categorization');
  
  const handleReviewClick = (feedback: AIFeedback) => {
    setSelectedFeedback(feedback);
    setIsReviewDialogOpen(true);
  };
  
  const handleCorrectClick = (feedback: AIFeedback) => {
    setSelectedFeedback(feedback);
    // Initialize corrected output with the actual output as a starting point
    setCorrectedOutput(feedback.actual_output || {});
    setIsCorrectionDialogOpen(true);
  };
  
  const handleReviewSubmit = async (addToTraining: boolean) => {
    if (!selectedFeedback) return;
    
    setIsProcessing(true);
    try {
      await onReviewFeedback(selectedFeedback.id, addToTraining);
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error('Error reviewing feedback:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCorrectionSubmit = async () => {
    if (!selectedFeedback || !correctedOutput) return;
    
    setIsProcessing(true);
    try {
      await onAddTrainingExample(
        selectedFeedback.input_data || {},
        correctedOutput,
        category,
        selectedFeedback.id
      );
      
      // Mark as reviewed and added to training
      await onReviewFeedback(selectedFeedback.id, true);
      
      setIsCorrectionDialogOpen(false);
    } catch (error) {
      console.error('Error submitting correction:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(feedbackList.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };
  
  const handleSelectItem = (feedbackId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, feedbackId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== feedbackId));
    }
  };
  
  const handleBatchProcess = async () => {
    setIsProcessing(true);
    try {
      // Process each selected item
      for (const feedbackId of selectedItems) {
        await onReviewFeedback(feedbackId, false);
      }
      // Clear selection after processing
      setSelectedItems([]);
    } catch (error) {
      console.error('Error batch processing feedback:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Helper function to render JSON data in a readable format
  const renderJsonData = (data: Record<string, any> | undefined) => {
    if (!data) return <p className="text-muted-foreground">No data available</p>;
    
    return (
      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  // Helper function to render editable JSON
  const renderEditableJson = (
    data: Record<string, any> | undefined, 
    onChange: (newData: Record<string, any>) => void
  ) => {
    if (!data) return <p className="text-muted-foreground">No data available</p>;
    
    return (
      <Textarea
        className="font-mono text-xs h-[300px]"
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch (error) {
            // Don't update if JSON is invalid
            console.error('Invalid JSON:', error);
          }
        }}
      />
    );
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Misclassification Review</CardTitle>
            <CardDescription>
              Review and correct AI misclassifications to improve model accuracy
            </CardDescription>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBatchProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Mark Reviewed
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No misclassifications found</h3>
              <p className="text-muted-foreground mt-2">
                There are currently no misclassifications that need review
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedItems.length === feedbackList.length && feedbackList.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Model Version</TableHead>
                    <TableHead>User Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedItems.includes(feedback.id)}
                          onCheckedChange={(checked) => handleSelectItem(feedback.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(feedback.created_at)}</TableCell>
                      <TableCell>{feedback.model_version}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {feedback.user_comment || 'No comment provided'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {feedback.reviewed ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending Review
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReviewClick(feedback)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCorrectClick(feedback)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Correct</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {feedbackList.length} misclassification{feedbackList.length !== 1 ? 's' : ''}
          </div>
        </CardFooter>
      </Card>
      
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Misclassification</DialogTitle>
            <DialogDescription>
              Review the input data, actual output, and expected output for this misclassification
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="grid gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">User Comment</h3>
                <p className="text-sm">
                  {selectedFeedback.user_comment || 'No comment provided'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Input Data</h3>
                  {renderJsonData(selectedFeedback.input_data)}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Actual Output (Incorrect)</h3>
                  {renderJsonData(selectedFeedback.actual_output)}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Expected Output (User Expectation)</h3>
                {renderJsonData(selectedFeedback.expected_output)}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleReviewSubmit(false)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Mark as Reviewed
            </Button>
            <Button 
              onClick={() => handleReviewSubmit(true)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add to Training Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Correction Dialog */}
      <Dialog open={isCorrectionDialogOpen} onOpenChange={setIsCorrectionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Correct Misclassification</DialogTitle>
            <DialogDescription>
              Edit the output to create a training example for the AI model
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Input Data (Read-only)</h3>
                  {renderJsonData(selectedFeedback.input_data)}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Corrected Output (Editable)</h3>
                  {renderEditableJson(correctedOutput || {}, setCorrectedOutput)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction_categorization">Transaction Categorization</SelectItem>
                    <SelectItem value="expense_analysis">Expense Analysis</SelectItem>
                    <SelectItem value="budget_recommendation">Budget Recommendation</SelectItem>
                    <SelectItem value="financial_insight">Financial Insight</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCorrectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCorrectionSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Submit Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};