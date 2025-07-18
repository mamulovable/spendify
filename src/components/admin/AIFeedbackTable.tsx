import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AIFeedback, AIFeedbackFilters } from '@/types/aiFeedback';
import { Loader2, Eye, Check, X, AlertCircle, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AIFeedbackTableProps {
  feedbackList: AIFeedback[];
  filters: AIFeedbackFilters;
  onFilterChange: (key: keyof AIFeedbackFilters, value: any) => void;
  onReviewFeedback: (feedbackId: string, addToTraining: boolean) => Promise<boolean>;
  isLoading: boolean;
}

export const AIFeedbackTable: React.FC<AIFeedbackTableProps> = ({
  feedbackList,
  filters,
  onFilterChange,
  onReviewFeedback,
  isLoading
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<AIFeedback | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleViewClick = (feedback: AIFeedback) => {
    setSelectedFeedback(feedback);
    setIsViewDialogOpen(true);
  };
  
  const handleReviewSubmit = async (addToTraining: boolean) => {
    if (!selectedFeedback) return;
    
    setIsProcessing(true);
    try {
      await onReviewFeedback(selectedFeedback.id, addToTraining);
      setIsViewDialogOpen(false);
    } catch (error) {
      console.error('Error reviewing feedback:', error);
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
  
  // Get feedback type icon
  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'helpful':
      case 'correct':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'not_helpful':
      case 'incorrect':
        return <X className="h-4 w-4 text-red-500" />;
      case 'other':
        return <HelpCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Get feedback type badge
  const getFeedbackTypeBadge = (type: string) => {
    switch (type) {
      case 'helpful':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Helpful</Badge>;
      case 'correct':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Correct</Badge>;
      case 'not_helpful':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Not Helpful</Badge>;
      case 'incorrect':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Incorrect</Badge>;
      case 'other':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Other</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  // Filter feedback list based on search query
  const filteredFeedback = feedbackList.filter(feedback => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      feedback.model_version.toLowerCase().includes(query) ||
      (feedback.user_comment && feedback.user_comment.toLowerCase().includes(query)) ||
      feedback.feedback_type.toLowerCase().includes(query)
    );
  });
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:max-w-xs"
          />
          
          <Select 
            value={filters.feedbackType || 'all'} 
            onValueChange={(value) => onFilterChange('feedbackType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Feedback Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="helpful">Helpful</SelectItem>
              <SelectItem value="not_helpful">Not Helpful</SelectItem>
              <SelectItem value="correct">Correct</SelectItem>
              <SelectItem value="incorrect">Incorrect</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.reviewStatus || 'all'} 
            onValueChange={(value) => onFilterChange('reviewStatus', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Review Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="unreviewed">Unreviewed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.trainingStatus || 'all'} 
            onValueChange={(value) => onFilterChange('trainingStatus', value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Training Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="added">Added to Training</SelectItem>
              <SelectItem value="not_added">Not Added</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Model Version</TableHead>
                <TableHead>User Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <span className="mt-2 text-sm text-muted-foreground">Loading feedback data...</span>
                  </TableCell>
                </TableRow>
              ) : filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <p className="text-muted-foreground">No feedback found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFeedbackTypeIcon(feedback.feedback_type)}
                        {getFeedbackTypeBadge(feedback.feedback_type)}
                      </div>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(feedback)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              View detailed information about this feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="grid gap-6">
              <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <span className="text-sm font-medium mr-2">Type:</span>
                  {getFeedbackTypeBadge(selectedFeedback.feedback_type)}
                </div>
                <div>
                  <span className="text-sm font-medium mr-2">Date:</span>
                  <span>{formatDate(selectedFeedback.created_at)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium mr-2">Model:</span>
                  <span>{selectedFeedback.model_version}</span>
                </div>
              </div>
              
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
                  <h3 className="text-sm font-medium mb-2">Actual Output</h3>
                  {renderJsonData(selectedFeedback.actual_output)}
                </div>
              </div>
              
              {selectedFeedback.expected_output && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Expected Output</h3>
                  {renderJsonData(selectedFeedback.expected_output)}
                </div>
              )}
              
              {selectedFeedback.reviewed && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Review Information</h3>
                  <p className="text-sm">
                    Reviewed by {selectedFeedback.reviewed_by_name || 'Unknown'} on {formatDate(selectedFeedback.reviewed_at || '')}
                  </p>
                  <p className="text-sm mt-1">
                    {selectedFeedback.added_to_training ? 'Added to training dataset' : 'Not added to training dataset'}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedFeedback && !selectedFeedback.reviewed && (
              <>
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
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};