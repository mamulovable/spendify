import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ChevronDown, RefreshCw, Tag } from 'lucide-react';
import { BatchActionParams } from '@/types/documentProcessing';

interface DocumentQueueBatchActionsProps {
  selectedDocuments: string[];
  onBatchAction: (params: BatchActionParams) => void;
  isProcessing: boolean;
}

export function DocumentQueueBatchActions({
  selectedDocuments,
  onBatchAction,
  isProcessing,
}: DocumentQueueBatchActionsProps) {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagMetadata, setTagMetadata] = useState({
    bank_name: '',
    currency: '',
    transaction_count: '',
  });

  const handleReprocessBatch = () => {
    onBatchAction({
      documentIds: selectedDocuments,
      action: 'reprocess',
    });
  };

  const handleTagBatch = () => {
    // Convert transaction_count to number
    const metadata = {
      ...tagMetadata,
      transaction_count: tagMetadata.transaction_count 
        ? parseInt(tagMetadata.transaction_count, 10) 
        : undefined,
    };
    
    onBatchAction({
      documentIds: selectedDocuments,
      action: 'tag',
      metadata,
    });
    
    setShowTagDialog(false);
  };

  const openTagDialog = () => {
    setTagMetadata({
      bank_name: '',
      currency: '',
      transaction_count: '',
    });
    setShowTagDialog(true);
  };

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              Batch Actions
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleReprocessBatch} disabled={isProcessing}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reprocess Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openTagDialog} disabled={isProcessing}>
              <Tag className="mr-2 h-4 w-4" />
              Tag Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Tag Documents</DialogTitle>
            <DialogDescription>
              Apply the same metadata tags to {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank_name" className="text-right">
                Bank Name
              </Label>
              <Input
                id="bank_name"
                value={tagMetadata.bank_name}
                onChange={(e) => setTagMetadata({ ...tagMetadata, bank_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                value={tagMetadata.currency}
                onChange={(e) => setTagMetadata({ ...tagMetadata, currency: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transaction_count" className="text-right">
                Transaction Count
              </Label>
              <Input
                id="transaction_count"
                type="number"
                value={tagMetadata.transaction_count}
                onChange={(e) => setTagMetadata({ ...tagMetadata, transaction_count: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTagBatch} disabled={isProcessing}>
              Apply Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}