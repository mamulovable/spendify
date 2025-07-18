import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, RefreshCw, Tag, Eye, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { formatBytes } from '@/lib/utils';
import type { DocumentQueueItem } from '@/types/documentProcessing';

interface DocumentQueueTableProps {
  documents: DocumentQueueItem[];
  isLoading: boolean;
  onReprocess: (documentId: string) => void;
  onManualTag: (documentId: string) => void;
  onViewDetails: (documentId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  isReprocessing?: boolean;
}

export function DocumentQueueTable({
  documents,
  isLoading,
  onReprocess,
  onManualTag,
  onViewDetails,
  onSelectionChange,
  isReprocessing = false,
}: DocumentQueueTableProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = documents.map(doc => doc.document_id);
      setSelectedDocuments(allIds);
      onSelectionChange?.(allIds);
    } else {
      setSelectedDocuments([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    let newSelection: string[];
    
    if (checked) {
      newSelection = [...selectedDocuments, documentId];
    } else {
      newSelection = selectedDocuments.filter(id => id !== documentId);
    }
    
    setSelectedDocuments(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No documents found in the processing queue.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                onCheckedChange={(checked) => handleSelectAll(!!checked)} 
                checked={selectedDocuments.length === documents.length && documents.length > 0}
                indeterminate={selectedDocuments.length > 0 && selectedDocuments.length < documents.length}
              />
            </TableHead>
            <TableHead>Document</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Model Version</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.queue_id}>
              <TableCell>
                <Checkbox 
                  checked={selectedDocuments.includes(doc.document_id)}
                  onCheckedChange={(checked) => handleSelectDocument(doc.document_id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">{doc.file_name}</div>
                <div className="text-xs text-muted-foreground">{formatBytes(doc.file_size)}</div>
              </TableCell>
              <TableCell>{doc.user_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                  {doc.status === 'failed' && doc.error_message && (
                    <span className="text-xs text-destructive" title={doc.error_message}>
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  )}
                </div>
                {doc.processing_duration && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {doc.processing_duration}s processing time
                  </div>
                )}
              </TableCell>
              <TableCell>{doc.model_version || 'N/A'}</TableCell>
              <TableCell>
                <div title={format(new Date(doc.created_at), 'PPpp')}>
                  {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(doc.document_id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onReprocess(doc.document_id)}
                      disabled={isReprocessing || doc.status === 'processing'}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reprocess
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManualTag(doc.document_id)}>
                      <Tag className="mr-2 h-4 w-4" />
                      Manual Tagging
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}