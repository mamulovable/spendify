import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentQueueTable } from '@/components/admin/DocumentQueueTable';
import { DocumentQueueFilter } from '@/components/admin/DocumentQueueFilter';
import { DocumentQueueStatusCards } from '@/components/admin/DocumentQueueStatusCards';
import { DocumentQueueMetrics } from '@/components/admin/DocumentQueueMetrics';
import { DocumentQueueBatchActions } from '@/components/admin/DocumentQueueBatchActions';
import { useDocumentQueue, useProcessingMetrics } from '@/hooks/useDocumentProcessing';
import { useAdmin } from '@/contexts/AdminContext';
import { DocumentQueueFilter as FilterType } from '@/types/documentProcessing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
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

export default function DocumentQueue() {
  const navigate = useNavigate();
  const { logActivity } = useAdmin();
  const [filters, setFilters] = useState<FilterType>({});
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>('');
  const [tagMetadata, setTagMetadata] = useState({
    bank_name: '',
    currency: '',
    transaction_count: '',
  });
  
  const {
    queueItems,
    queueCounts,
    isLoading,
    reprocessDocument,
    isReprocessing,
    tagDocument,
    isTagging,
    performBatchAction,
    isBatchProcessing,
    refetch,
  } = useDocumentQueue(filters);
  
  const {
    metrics,
    isLoading: isLoadingMetrics,
  } = useProcessingMetrics();
  
  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };
  
  const handleReprocess = async (documentId: string) => {
    await reprocessDocument(documentId);
    await logActivity('reprocess_document', 'document', { document_id: documentId });
  };
  
  const handleManualTag = (documentId: string) => {
    setCurrentDocumentId(documentId);
    setTagMetadata({
      bank_name: '',
      currency: '',
      transaction_count: '',
    });
    setShowTagDialog(true);
  };
  
  const handleTagSubmit = async () => {
    // Convert transaction_count to number
    const metadata = {
      ...tagMetadata,
      transaction_count: tagMetadata.transaction_count 
        ? parseInt(tagMetadata.transaction_count, 10) 
        : undefined,
    };
    
    await tagDocument({ documentId: currentDocumentId, metadata });
    await logActivity('tag_document', 'document', { document_id: currentDocumentId });
    setShowTagDialog(false);
  };
  
  const handleViewDetails = (documentId: string) => {
    navigate(`/admin/documents/results?document=${documentId}`);
  };
  
  const handleBatchAction = async (params: any) => {
    await performBatchAction(params);
    await logActivity('batch_action', 'documents', { 
      action: params.action, 
      document_count: params.documentIds.length 
    });
    setSelectedDocuments([]);
  };
  
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Document Processing Queue</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <DocumentQueueStatusCards 
        queueCounts={queueCounts || {}} 
        isLoading={isLoading} 
      />
      
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue" className="space-y-4">
          <DocumentQueueFilter 
            onFilterChange={handleFilterChange} 
            queueCounts={queueCounts} 
          />
          
          <DocumentQueueBatchActions 
            selectedDocuments={selectedDocuments}
            onBatchAction={handleBatchAction}
            isProcessing={isBatchProcessing}
          />
          
          <DocumentQueueTable 
            documents={queueItems || []}
            isLoading={isLoading}
            onReprocess={handleReprocess}
            onManualTag={handleManualTag}
            onViewDetails={handleViewDetails}
            onSelectionChange={setSelectedDocuments}
            isReprocessing={isReprocessing}
          />
        </TabsContent>
        
        <TabsContent value="metrics">
          <DocumentQueueMetrics 
            metrics={metrics || []}
            isLoading={isLoadingMetrics}
          />
        </TabsContent>
      </Tabs>
      
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
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
            <Button onClick={handleTagSubmit} disabled={isTagging}>
              Apply Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}