import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Tag, AlertCircle } from 'lucide-react';
import { DocumentMetadata } from '@/types/documentProcessing';

interface DocumentActionControlsProps {
  documentId: string;
  status: string;
  onReprocess: (documentId: string) => void;
  onManualTag: (documentId: string, metadata: DocumentMetadata) => void;
  isReprocessing?: boolean;
  isTagging?: boolean;
}

export function DocumentActionControls({
  documentId,
  status,
  onReprocess,
  onManualTag,
  isReprocessing = false,
  isTagging = false,
}: DocumentActionControlsProps) {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagMetadata, setTagMetadata] = useState<DocumentMetadata>({
    bank_name: '',
    currency: '',
    transaction_count: undefined,
    start_date: '',
    end_date: '',
    account_number: '',
    account_holder: '',
    total_deposits: undefined,
    total_withdrawals: undefined,
    confidence_score: undefined,
  });

  const handleReprocess = () => {
    onReprocess(documentId);
  };

  const handleTagSubmit = () => {
    onManualTag(documentId, tagMetadata);
    setShowTagDialog(false);
  };

  const handleInputChange = (field: keyof DocumentMetadata, value: string) => {
    // Handle numeric fields
    if (['transaction_count', 'total_deposits', 'total_withdrawals', 'confidence_score'].includes(field)) {
      const numValue = value === '' ? undefined : parseFloat(value);
      setTagMetadata({ ...tagMetadata, [field]: numValue });
    } else {
      setTagMetadata({ ...tagMetadata, [field]: value });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReprocess}
          disabled={isReprocessing || status === 'processing'}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reprocess Document
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTagDialog(true)}
          disabled={isTagging}
          className="flex items-center gap-2"
        >
          <Tag className="h-4 w-4" />
          Manual Tagging
        </Button>
        
        {status === 'failed' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-destructive"
          >
            <AlertCircle className="h-4 w-4" />
            View Error Details
          </Button>
        )}
      </div>
      
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Document Tagging</DialogTitle>
            <DialogDescription>
              Add metadata tags to help improve document processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank_name" className="text-right">
                Bank Name
              </Label>
              <Input
                id="bank_name"
                value={tagMetadata.bank_name || ''}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                value={tagMetadata.currency || ''}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_number" className="text-right">
                Account Number
              </Label>
              <Input
                id="account_number"
                value={tagMetadata.account_number || ''}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_holder" className="text-right">
                Account Holder
              </Label>
              <Input
                id="account_holder"
                value={tagMetadata.account_holder || ''}
                onChange={(e) => handleInputChange('account_holder', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="start_date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={tagMetadata.start_date || ''}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="end_date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={tagMetadata.end_date || ''}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="transaction_count" className="text-right">
                  Transactions
                </Label>
                <Input
                  id="transaction_count"
                  type="number"
                  value={tagMetadata.transaction_count?.toString() || ''}
                  onChange={(e) => handleInputChange('transaction_count', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="confidence_score" className="text-right">
                  Confidence
                </Label>
                <Input
                  id="confidence_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={tagMetadata.confidence_score?.toString() || ''}
                  onChange={(e) => handleInputChange('confidence_score', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="total_deposits" className="text-right">
                  Deposits
                </Label>
                <Input
                  id="total_deposits"
                  type="number"
                  step="0.01"
                  value={tagMetadata.total_deposits?.toString() || ''}
                  onChange={(e) => handleInputChange('total_deposits', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="total_withdrawals" className="text-right">
                  Withdrawals
                </Label>
                <Input
                  id="total_withdrawals"
                  type="number"
                  step="0.01"
                  value={tagMetadata.total_withdrawals?.toString() || ''}
                  onChange={(e) => handleInputChange('total_withdrawals', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTagSubmit} disabled={isTagging}>
              Apply Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}