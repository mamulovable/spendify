import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDocumentDetail } from '@/hooks/useDocumentProcessing';
import { DocumentActionControls } from '@/components/admin/DocumentActionControls';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { formatBytes } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { DocumentMetadata } from '@/types/documentProcessing';

export default function DocumentResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useAdmin();
  
  const documentId = searchParams.get('document') || undefined;
  
  const {
    document,
    processingHistory,
    documentResult,
    isLoading,
    refetch,
  } = useDocumentDetail(documentId);
  
  useEffect(() => {
    if (!documentId) {
      navigate('/admin/documents/queue');
    }
  }, [documentId, navigate]);
  
  const handleReprocess = async (docId: string) => {
    try {
      // This would typically call a service function
      // For now, we'll just show a toast and log the activity
      toast({
        title: 'Document Reprocessing Started',
        description: 'The document has been queued for reprocessing.',
      });
      
      await logActivity('reprocess_document', 'document', { document_id: docId });
      refetch();
    } catch (error) {
      toast({
        title: 'Reprocessing Failed',
        description: `Failed to reprocess document: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleManualTag = async (docId: string, metadata: DocumentMetadata) => {
    try {
      // This would typically call a service function
      // For now, we'll just show a toast and log the activity
      toast({
        title: 'Document Tagged',
        description: 'The document has been manually tagged.',
      });
      
      await logActivity('tag_document', 'document', { document_id: docId, metadata });
      refetch();
    } catch (error) {
      toast({
        title: 'Tagging Failed',
        description: `Failed to tag document: ${error.message}`,
        variant: 'destructive',
      });
    }
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
  
  if (isLoading || !document) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const latestProcessing = processingHistory && processingHistory.length > 0 
    ? processingHistory[0] 
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/documents/queue')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Queue
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Document Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.file_name}
              </CardTitle>
              <CardDescription>
                {formatBytes(document.file_size)} • {document.mime_type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Uploaded By</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{document.user_name || 'Unknown User'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Upload Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {document.created_at 
                        ? format(new Date(document.created_at), 'PPpp')
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Processing Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {latestProcessing ? (
                      <>
                        {latestProcessing.status === 'processing' ? (
                          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        ) : latestProcessing.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : latestProcessing.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        {getStatusBadge(latestProcessing.status)}
                      </>
                    ) : (
                      <span>Not processed</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Processing Time</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {latestProcessing?.processing_duration 
                        ? `${latestProcessing.processing_duration} seconds`
                        : 'Not completed'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <DocumentActionControls 
                documentId={document.id}
                status={latestProcessing?.status || 'pending'}
                onReprocess={handleReprocess}
                onManualTag={handleManualTag}
              />
            </CardFooter>
          </Card>
          
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList>
              <TabsTrigger value="results">Processing Results</TabsTrigger>
              <TabsTrigger value="history">Processing History</TabsTrigger>
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Data</CardTitle>
                  <CardDescription>
                    Information extracted from the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {documentResult ? (
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <p className="text-sm font-medium">Bank Name</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.bank_name || 'Not detected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Currency</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.currency || 'Not detected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account Number</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.account_number || 'Not detected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Transaction Count</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.transaction_count || 'Not detected'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Statement Period</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.start_date && documentResult.end_date ? (
                            `${format(parseISO(documentResult.start_date), 'PP')} - ${format(parseISO(documentResult.end_date), 'PP')}`
                          ) : (
                            'Not detected'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence Score</p>
                        <p className="text-sm text-muted-foreground">
                          {documentResult.confidence_score 
                            ? `${documentResult.confidence_score.toFixed(2)}%`
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">No processing results available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Processing History</CardTitle>
                  <CardDescription>
                    Timeline of document processing attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processingHistory && processingHistory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Model Version</TableHead>
                          <TableHead>Retry #</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processingHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {format(new Date(item.created_at), 'PPp')}
                            </TableCell>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              {item.processing_duration 
                                ? `${item.processing_duration}s`
                                : '-'}
                            </TableCell>
                            <TableCell>{item.model_version_id || 'Unknown'}</TableCell>
                            <TableCell>{item.retry_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center p-4 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">No processing history available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>
                    Preview of the uploaded document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-center h-64 border rounded-md bg-muted/20">
                    <p className="text-muted-foreground">Document preview not available.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI Model Information</CardTitle>
              <CardDescription>
                Model used for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentResult?.model_version ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Model Version</p>
                    <p className="text-sm text-muted-foreground">
                      {documentResult.model_version}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Confidence Score</p>
                    <p className="text-sm text-muted-foreground">
                      {documentResult.confidence_score 
                        ? `${documentResult.confidence_score.toFixed(2)}%`
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-sm text-muted-foreground">
                      {documentResult.processing_duration 
                        ? `${documentResult.processing_duration} seconds`
                        : 'Not available'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No model information available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}