import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminDocuments } from '@/hooks/useAdminDocuments';
import {
  FileText,
  Search,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowDownWideNarrow,
  MoreHorizontal,
  RefreshCw,
  Ban,
  Play,
  Zap,
  PlusCircle,
  Loader2,
  RotateCcw,
  BarChart4,
  FileType,
  Check,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Documents() {
  const { toast } = useToast();
  const {
    documents,
    templates,
    errors,
    stats,
    loading,
    error,
    refreshDocuments,
    refreshTemplates,
    refreshErrors,
    refreshStats,
    prioritizeDocument,
    cancelProcessing,
    retryProcessing,
    activateTemplate,
    markErrorResolved,
  } = useAdminDocuments();
  
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter documents based on search query and filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = !searchQuery || 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePrioritizeDocument = async (documentId: string) => {
    try {
      await prioritizeDocument(documentId);
      toast({
        title: 'Document Prioritized',
        description: 'Document has been moved to the front of the processing queue',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to prioritize document',
        variant: 'destructive',
      });
    }
  };

  const handleCancelProcessing = async () => {
    if (!selectedDocument) return;
    
    try {
      await cancelProcessing(selectedDocument);
      toast({
        title: 'Processing Cancelled',
        description: 'Document processing has been cancelled',
      });
      setShowCancelDialog(false);
      setSelectedDocument(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to cancel processing',
        variant: 'destructive',
      });
    }
  };

  const handleRetryProcessing = async (documentId: string) => {
    try {
      await retryProcessing(documentId);
      toast({
        title: 'Processing Retried',
        description: 'Document has been resubmitted for processing',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to retry processing',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" /> Error</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><Ban className="mr-1 h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">
            Manage document processing, templates, and content moderation
          </p>
        </div>
        <Button onClick={() => {
          refreshDocuments();
          refreshTemplates();
          refreshErrors();
          refreshStats();
        }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="queue">Processing Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search documents by name or user email..."
                value={searchQuery}
                onChange={handleSearch}
                className="max-w-sm"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('processing')}>Processing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('error')}>Error</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <FileType className="mr-2 h-4 w-4" />
                  Type: {typeFilter === 'all' ? 'All' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter('all')}>All</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('bank_statement')}>Bank Statement</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('credit_card')}>Credit Card</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('invoice')}>Invoice</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('receipt')}>Receipt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter('other')}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Document Processing Queue</CardTitle>
              <CardDescription>
                {loading.documents ? (
                  'Loading documents...'
                ) : (
                  `${filteredDocuments.length} document${filteredDocuments.length === 1 ? '' : 's'} found`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.documents ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8 text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>{error.message}</span>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <FileText className="mb-2 h-8 w-8" />
                  <span>No documents found</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>{doc.user_email}</TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="capitalize">{doc.type.replace('_', ' ')}</TableCell>
                          <TableCell>{Math.round(doc.file_size / 1024)} KB</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(doc.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {doc.status === 'pending' && (
                                  <DropdownMenuItem onClick={() => handlePrioritizeDocument(doc.id)}>
                                    <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                                    Prioritize
                                  </DropdownMenuItem>
                                )}
                                {(doc.status === 'pending' || doc.status === 'processing') && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedDocument(doc.id);
                                      setShowCancelDialog(true);
                                    }}
                                  >
                                    <Ban className="mr-2 h-4 w-4 text-red-500" />
                                    Cancel Processing
                                  </DropdownMenuItem>
                                )}
                                {(doc.status === 'error' || doc.status === 'cancelled') && (
                                  <DropdownMenuItem onClick={() => handleRetryProcessing(doc.id)}>
                                    <RotateCcw className="mr-2 h-4 w-4 text-blue-500" />
                                    Retry Processing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-muted-foreground">
                  {stats?.processed_last_24h || 0} documents processed in the last 24 hours
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={refreshDocuments} disabled={loading.documents}>
                {loading.documents ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium">Document Templates</h3>
              <p className="text-sm text-muted-foreground">
                Configure templates for bank statement analysis and financial document processing
              </p>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                {loading.templates ? (
                  'Loading templates...'
                ) : (
                  `${templates.length} template${templates.length === 1 ? '' : 's'} configured`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.templates ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8 text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>{error.message}</span>
                </div>
              ) : templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <FileSpreadsheet className="mb-2 h-8 w-8" />
                  <span>No templates created yet</span>
                  <Button variant="outline" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Template
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id} className={!template.is_active ? 'opacity-70' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant={template.is_active ? 'default' : 'outline'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <CardDescription>
                          {template.type.replace('_', ' ').charAt(0).toUpperCase() + template.type.replace('_', ' ').slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Fields:</span>
                            <span className="font-medium">{template.field_count}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated:</span>
                            <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground italic mt-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-between pt-0">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant={template.is_active ? 'ghost' : 'default'} 
                          size="sm"
                          onClick={() => activateTemplate(template.id, !template.is_active)}
                        >
                          {template.is_active ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <p className="text-sm text-muted-foreground">
                  Templates will be used to process and analyze financial documents
                </p>
                <Button variant="outline" size="sm" onClick={refreshTemplates} disabled={loading.templates}>
                  {loading.templates ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Template Guide</CardTitle>
              <CardDescription>
                Understanding how templates work with financial document processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Bank Statement Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure how bank statements are analyzed, including transaction categorization, 
                      recurring payment detection, and income tracking.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Credit Card Statement Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up templates for credit card statements to extract purchases, interest charges,
                      minimum payments, and spending categories.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Invoice Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure templates for invoices to extract vendor information, line items,
                      tax details, and payment terms.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Receipt Templates</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up templates for receipts to capture purchase details, taxes, merchant information,
                      and expense categorization.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium">Content Moderation</h3>
              <p className="text-sm text-muted-foreground">
                Review, flag, and moderate financial documents for quality control
              </p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  Documents Flagged
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Pending review</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" size="sm">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Review Flagged
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-muted-foreground" />
                  Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-sm text-muted-foreground">Processing accuracy</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" size="sm">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  View Report
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                  Average Review Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2 hrs</div>
                <p className="text-sm text-muted-foreground">For flagged documents</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Flagged Documents</CardTitle>
              <CardDescription>
                Documents that require administrator review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead>Flagged On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Q1-2025-Statement.pdf</TableCell>
                    <TableCell>user@example.com</TableCell>
                    <TableCell>Bank Statement</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Potential PII
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Invoice-ABC-2025.pdf</TableCell>
                    <TableCell>client@domain.com</TableCell>
                    <TableCell>Invoice</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        Format Error
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                View All Flagged
              </Button>
              <Button variant="default" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Settings</CardTitle>
              <CardDescription>
                Configure automatic flagging rules and moderation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Automatic PII Detection</h4>
                    <p className="text-sm text-muted-foreground">Flag documents with unredacted personal information</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Flag Low-Quality Scans</h4>
                    <p className="text-sm text-muted-foreground">Identify documents with poor image quality</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Flag Potential Fraud</h4>
                    <p className="text-sm text-muted-foreground">Detect documents with potentially fraudulent information</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Require Double-Review</h4>
                    <p className="text-sm text-muted-foreground">Two admin approvals for flagged documents</p>
                  </div>
                  <Switch checked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_documents || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  All-time total
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Processed (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.processed_last_24h || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last 24 hours
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : '0%'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats?.error_rate ? `${stats.error_rate.toFixed(1)}%` : '0%'} error rate
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg. Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.average_processing_time ? `${stats.average_processing_time.toFixed(1)}s` : '0s'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Per document
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Volume by Time</CardTitle>
              <CardDescription>
                Documents processed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.stats ? (
                <div className="flex items-center justify-center h-[350px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats?.processing_times || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Documents Processed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documents by Type</CardTitle>
                <CardDescription>
                  Distribution of document types
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading.stats ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Bank Statements', value: stats?.documents_by_type?.bank_statement || 0 },
                          { name: 'Credit Cards', value: stats?.documents_by_type?.credit_card || 0 },
                          { name: 'Invoices', value: stats?.documents_by_type?.invoice || 0 },
                          { name: 'Receipts', value: stats?.documents_by_type?.receipt || 0 },
                          { name: 'Other', value: stats?.documents_by_type?.other || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Bank Statements', value: stats?.documents_by_type?.bank_statement || 0, fill: '#8884d8' },
                          { name: 'Credit Cards', value: stats?.documents_by_type?.credit_card || 0, fill: '#82ca9d' },
                          { name: 'Invoices', value: stats?.documents_by_type?.invoice || 0, fill: '#ffc658' },
                          { name: 'Receipts', value: stats?.documents_by_type?.receipt || 0, fill: '#ff8042' },
                          { name: 'Other', value: stats?.documents_by_type?.other || 0, fill: '#0088fe' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
                <CardDescription>
                  System performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">{stats?.success_rate ? `${stats.success_rate.toFixed(1)}%` : '0%'}</span>
                    </div>
                    <Progress value={stats?.success_rate || 0} className="bg-green-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>OCR Accuracy</span>
                      <span className="font-medium">92.8%</span>
                    </div>
                    <Progress value={92.8} className="bg-blue-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Data Extraction</span>
                      <span className="font-medium">89.5%</span>
                    </div>
                    <Progress value={89.5} className="bg-indigo-100" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Queue Utilization</span>
                      <span className="font-medium">68.3%</span>
                    </div>
                    <Progress value={68.3} className="bg-yellow-100" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={refreshStats} className="w-full" disabled={loading.stats}>
                  {loading.stats ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Statistics
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="text-lg font-medium">Processing Error Logs</h3>
              <p className="text-sm text-muted-foreground">
                Track and resolve document processing errors
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <ArrowDownWideNarrow className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Errors</DropdownMenuItem>
                  <DropdownMenuItem>Unresolved Only</DropdownMenuItem>
                  <DropdownMenuItem>Resolved Only</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>OCR Errors</DropdownMenuItem>
                  <DropdownMenuItem>Validation Errors</DropdownMenuItem>
                  <DropdownMenuItem>Processing Errors</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={refreshErrors} disabled={loading.errors}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>
                Overview of document processing errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col space-y-2 rounded-lg border p-4">
                  <span className="text-sm font-medium text-muted-foreground">Total Errors</span>
                  <span className="text-2xl font-bold">{errors.length}</span>
                  <span className="text-xs text-muted-foreground">
                    {errors.filter(e => !e.resolved_at).length} unresolved
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2 rounded-lg border p-4">
                  <span className="text-sm font-medium text-muted-foreground">Most Common Error</span>
                  <span className="text-base font-medium">
                    {errors.length > 0 ? 
                      (() => {
                        const errorCounts: Record<string, number> = {};
                        errors.forEach(e => {
                          errorCounts[e.error_type] = (errorCounts[e.error_type] || 0) + 1;
                        });
                        const mostCommon = Object.entries(errorCounts).sort((a, b) => b[1] - a[1])[0];
                        return mostCommon ? mostCommon[0] : 'None';
                      })() : 'None'}
                  </span>
                  <span className="text-xs text-muted-foreground">Based on all errors</span>
                </div>
                
                <div className="flex flex-col space-y-2 rounded-lg border p-4">
                  <span className="text-sm font-medium text-muted-foreground">Resolution Time</span>
                  <span className="text-2xl font-bold">
                    {errors.filter(e => e.resolved_at).length > 0 ? 
                      (() => {
                        const resolvedErrors = errors.filter(e => e.resolved_at);
                        if (resolvedErrors.length === 0) return '0m';
                        
                        const avgTime = resolvedErrors.reduce((sum, e) => {
                          const created = new Date(e.created_at).getTime();
                          const resolved = new Date(e.resolved_at as string).getTime();
                          return sum + (resolved - created);
                        }, 0) / resolvedErrors.length;
                        
                        // Convert to minutes
                        return `${Math.round(avgTime / (1000 * 60))}m`;
                      })() : 'N/A'}
                  </span>
                  <span className="text-xs text-muted-foreground">Average time to resolve</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>
                {loading.errors ? (
                  'Loading error logs...'
                ) : (
                  `${errors.length} error${errors.length === 1 ? '' : 's'} found`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.errors ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center p-8 text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span>{error.message}</span>
                </div>
              ) : errors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <CheckCircle className="mb-2 h-8 w-8 text-green-500" />
                  <span>No errors found</span>
                  <p className="mt-2 text-sm text-muted-foreground">All documents have processed successfully</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Error Type</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.map((error) => (
                        <TableRow key={error.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(error.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{error.document_id.substring(0, 8)}...</TableCell>
                          <TableCell>{error.user_email}</TableCell>
                          <TableCell className="capitalize">{error.error_type.replace('_', ' ')}</TableCell>
                          <TableCell className="max-w-xs truncate">{error.error_message}</TableCell>
                          <TableCell>
                            {error.resolved_at ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" /> Resolved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800">
                                <AlertCircle className="mr-1 h-3 w-3" /> Unresolved
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              {!error.resolved_at && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Mark as Resolved"
                                  onClick={() => markErrorResolved(error.id)}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Retry Document"
                                onClick={() => handleRetryProcessing(error.document_id)}
                              >
                                <RotateCcw className="h-4 w-4 text-blue-500" />
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
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Error Prevention</CardTitle>
              <CardDescription>
                Common issues and how to resolve them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      OCR Recognition Errors
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Poor scan quality can lead to OCR errors. Ensure documents are clearly
                      scanned at 300 DPI or higher with good lighting.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      Format Validation Failures
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Some documents may not match expected templates. Review templates
                      and ensure they cover all common variations of financial documents.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      Processing Timeouts
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Very large documents may cause processing timeouts. Consider splitting
                      large documents or adjusting timeout settings for better results.
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4 space-y-2">
                    <h4 className="font-medium flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      Data Extraction Issues
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Non-standard document layouts may cause data extraction errors. Update
                      extraction rules and train AI models on more diverse examples.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Processing</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel processing for this document? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, continue processing</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelProcessing}>Yes, cancel processing</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
