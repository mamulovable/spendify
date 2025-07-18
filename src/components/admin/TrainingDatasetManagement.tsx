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
import { AITrainingExample } from '@/types/aiFeedback';
import { Loader2, Plus, Download, Upload, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TrainingDatasetManagementProps {
  trainingExamples: AITrainingExample[];
  isLoading: boolean;
  onAddExample: (
    inputData: Record<string, any>,
    expectedOutput: Record<string, any>,
    category: string
  ) => Promise<string>;
  onDeleteExample?: (id: string) => Promise<boolean>;
  onVerifyExample?: (id: string, isVerified: boolean) => Promise<boolean>;
  onExportDataset?: () => Promise<void>;
  onImportDataset?: (file: File) => Promise<void>;
}

export const TrainingDatasetManagement: React.FC<TrainingDatasetManagementProps> = ({
  trainingExamples,
  isLoading,
  onAddExample,
  onDeleteExample,
  onVerifyExample,
  onExportDataset,
  onImportDataset
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedExample, setSelectedExample] = useState<AITrainingExample | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  
  // New example form state
  const [newExample, setNewExample] = useState({
    inputData: '{\n  \n}',
    expectedOutput: '{\n  \n}',
    category: 'transaction_categorization'
  });
  
  // File input ref for import
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleAddExample = async () => {
    setIsProcessing(true);
    try {
      const inputData = JSON.parse(newExample.inputData);
      const expectedOutput = JSON.parse(newExample.expectedOutput);
      
      await onAddExample(
        inputData,
        expectedOutput,
        newExample.category
      );
      
      setIsAddDialogOpen(false);
      setNewExample({
        inputData: '{\n  \n}',
        expectedOutput: '{\n  \n}',
        category: 'transaction_categorization'
      });
    } catch (error) {
      console.error('Error adding training example:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleViewExample = (example: AITrainingExample) => {
    setSelectedExample(example);
    setIsViewDialogOpen(true);
  };
  
  const handleVerifyExample = async (id: string, isVerified: boolean) => {
    if (!onVerifyExample) return;
    
    setIsProcessing(true);
    try {
      await onVerifyExample(id, isVerified);
    } catch (error) {
      console.error('Error verifying example:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteExample = async (id: string) => {
    if (!onDeleteExample) return;
    
    setIsProcessing(true);
    try {
      await onDeleteExample(id);
    } catch (error) {
      console.error('Error deleting example:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredExamples.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };
  
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportDataset) {
      setIsProcessing(true);
      try {
        await onImportDataset(file);
      } catch (error) {
        console.error('Error importing dataset:', error);
      } finally {
        setIsProcessing(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
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
  
  // Filter examples based on search query and filters
  const filteredExamples = trainingExamples.filter(example => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      example.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(example.input_data).toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(example.expected_output).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = categoryFilter === 'all' || example.category === categoryFilter;
    
    // Filter by verification status
    const matchesVerification = 
      verificationFilter === 'all' || 
      (verificationFilter === 'verified' && example.is_verified) ||
      (verificationFilter === 'unverified' && !example.is_verified);
    
    return matchesSearch && matchesCategory && matchesVerification;
  });
  
  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(trainingExamples.map(example => example.category)));
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Training Dataset Management</CardTitle>
            <CardDescription>
              Manage AI training examples for model improvement
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {onExportDataset && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onExportDataset}
                disabled={isProcessing || trainingExamples.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Dataset
              </Button>
            )}
            
            {onImportDataset && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleImportClick}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Dataset
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleFileChange}
                />
              </>
            )}
            
            <Button 
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Example
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Search examples..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sm:max-w-xs"
              />
              
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={verificationFilter} 
                onValueChange={setVerificationFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedItems.length === filteredExamples.length && filteredExamples.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <span className="mt-2 text-sm text-muted-foreground">Loading training examples...</span>
                      </TableCell>
                    </TableRow>
                  ) : filteredExamples.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <p className="text-muted-foreground">No training examples found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExamples.map((example) => (
                      <TableRow key={example.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedItems.includes(example.id)}
                            onCheckedChange={(checked) => handleSelectItem(example.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {example.category.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{example.added_by}</TableCell>
                        <TableCell>{formatDate(example.created_at)}</TableCell>
                        <TableCell>
                          {example.is_verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewExample(example)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            
                            {onVerifyExample && !example.is_verified && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleVerifyExample(example.id, true)}
                                disabled={isProcessing}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Verify</span>
                              </Button>
                            )}
                            
                            {onVerifyExample && example.is_verified && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleVerifyExample(example.id, false)}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Unverify</span>
                              </Button>
                            )}
                            
                            {onDeleteExample && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteExample(example.id)}
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredExamples.length} of {trainingExamples.length} examples
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} selected
              </span>
              {onDeleteExample && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    // Batch delete would go here
                    alert('Batch delete not implemented');
                  }}
                  disabled={isProcessing}
                >
                  Delete Selected
                </Button>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Add Example Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Training Example</DialogTitle>
            <DialogDescription>
              Create a new training example for the AI model
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={newExample.category} 
                onValueChange={(value) => setNewExample({...newExample, category: value})}
              >
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="inputData">Input Data (JSON)</Label>
                <Textarea
                  id="inputData"
                  className="font-mono text-xs h-[300px]"
                  value={newExample.inputData}
                  onChange={(e) => setNewExample({...newExample, inputData: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="expectedOutput">Expected Output (JSON)</Label>
                <Textarea
                  id="expectedOutput"
                  className="font-mono text-xs h-[300px]"
                  value={newExample.expectedOutput}
                  onChange={(e) => setNewExample({...newExample, expectedOutput: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddExample}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Example
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Example Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Training Example Details</DialogTitle>
            <DialogDescription>
              View detailed information about this training example
            </DialogDescription>
          </DialogHeader>
          
          {selectedExample && (
            <div className="grid gap-6">
              <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <span className="text-sm font-medium mr-2">Category:</span>
                  <Badge variant="outline">
                    {selectedExample.category.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium mr-2">Created:</span>
                  <span>{formatDate(selectedExample.created_at)}</span>
                </div>
                <div>
                  <span className="text-sm font-medium mr-2">Status:</span>
                  {selectedExample.is_verified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Input Data</h3>
                  {renderJsonData(selectedExample.input_data)}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Expected Output</h3>
                  {renderJsonData(selectedExample.expected_output)}
                </div>
              </div>
              
              {selectedExample.feedback_id && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Source</h3>
                  <p className="text-sm">
                    Created from feedback ID: {selectedExample.feedback_id}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedExample && onVerifyExample && !selectedExample.is_verified && (
              <Button 
                onClick={() => handleVerifyExample(selectedExample.id, true)}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Verify Example
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};