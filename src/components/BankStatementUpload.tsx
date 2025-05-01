import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Upload, Edit2, Check, X } from 'lucide-react';
import { bankStatementService } from '@/services/bankStatementService';
import type { ExtractedTransaction } from '@/services/bankStatementService';

export function BankStatementUpload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    transactions: ExtractedTransaction[];
    summary: {
      totalIncome: number;
      totalExpenses: number;
      period: {
        startDate: string;
        endDate: string;
      };
    };
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setIsProcessing(true);
        
        try {
          // Extract transactions using Gemini
          const result = await bankStatementService.extractTransactions(base64);
          setExtractedData(result);
          setShowPreview(true);
        } catch (error) {
          console.error('Error processing statement:', error);
          let errorMessage = 'Failed to extract transactions. Please try again.';
          
          if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              errorMessage = 'API key authorization failed. Please check your Gemini API key configuration.';
            } else if (error.message.includes('API key')) {
              errorMessage = 'Gemini API key is missing or invalid. Please check your configuration.';
            }
          }
          
          toast({
            title: 'Processing failed',
            description: errorMessage,
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTransactions = async () => {
    if (!user || !extractedData) return;

    try {
      await bankStatementService.saveTransactions(user.id, extractedData.transactions);
      toast({
        title: 'Success',
        description: 'Transactions saved successfully',
      });
      setShowPreview(false);
      setExtractedData(null);
    } catch (error) {
      console.error('Error saving transactions:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save transactions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="statement-upload">Upload Bank Statement</Label>
            <Input
              id="statement-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading || isProcessing}
              className="mt-2"
            />
          </div>
          
          {(isUploading || isProcessing) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview Extracted Transactions</DialogTitle>
            <DialogDescription>
              Review the extracted transactions before saving.
            </DialogDescription>
          </DialogHeader>

          {extractedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Period</p>
                  <p className="text-sm text-muted-foreground">
                    {extractedData.summary.period.startDate} to {extractedData.summary.period.endDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Income: ${extractedData.summary.totalIncome.toFixed(2)} |
                    Expenses: ${extractedData.summary.totalExpenses.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedData.transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTransactions}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Transactions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 