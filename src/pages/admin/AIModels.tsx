import React, { useState } from 'react';
import { useAIModels } from '@/hooks/useDocumentProcessing';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  Loader2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  BarChart3 
} from 'lucide-react';

export default function AIModels() {
  const { toast } = useToast();
  const { logActivity } = useAdmin();
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [newModelData, setNewModelData] = useState({
    version_name: '',
    model_type: '',
    description: '',
    accuracy_score: '',
    training_data_size: '',
  });
  
  const {
    modelVersions,
    activeModel,
    isLoading,
    refetch,
  } = useAIModels();
  
  const handleDeployModel = async () => {
    try {
      // This would typically call a service function
      // For now, we'll just show a toast and log the activity
      toast({
        title: 'Model Deployed',
        description: `Model ${newModelData.version_name} has been deployed successfully.`,
      });
      
      await logActivity('deploy_model', 'ai_model', { 
        version_name: newModelData.version_name,
        model_type: newModelData.model_type,
      });
      
      setShowDeployDialog(false);
      refetch();
    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: `Failed to deploy model: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setNewModelData({ ...newModelData, [field]: value });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">AI Model Versions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowDeployDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Deploy New Model
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Model Version History</CardTitle>
              <CardDescription>
                History of all AI model versions deployed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelVersions && modelVersions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Deployed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modelVersions.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.version_name}</TableCell>
                        <TableCell>{model.model_type}</TableCell>
                        <TableCell>
                          {model.accuracy_score ? `${model.accuracy_score}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {model.deployed_at 
                            ? format(new Date(model.deployed_at), 'PP')
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {model.is_active ? (
                            <Badge variant="success" className="flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-fit">Inactive</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No model versions found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Model</CardTitle>
              <CardDescription>
                Currently active AI model
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeModel ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Version Name</p>
                    <p className="text-sm text-muted-foreground">
                      {activeModel.version_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Model Type</p>
                    <p className="text-sm text-muted-foreground">
                      {activeModel.model_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Accuracy Score</p>
                    <p className="text-sm text-muted-foreground">
                      {activeModel.accuracy_score ? `${activeModel.accuracy_score}%` : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Training Data Size</p>
                    <p className="text-sm text-muted-foreground">
                      {activeModel.training_data_size 
                        ? `${activeModel.training_data_size.toLocaleString()} samples`
                        : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Deployed At</p>
                    <p className="text-sm text-muted-foreground">
                      {activeModel.deployed_at 
                        ? format(new Date(activeModel.deployed_at), 'PPpp')
                        : 'Unknown'}
                    </p>
                  </div>
                  {activeModel.description && (
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">
                        {activeModel.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No active model available.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Performance metrics coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deploy New AI Model</DialogTitle>
            <DialogDescription>
              Deploy a new AI model version for document processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="version_name" className="text-right">
                Version Name
              </Label>
              <Input
                id="version_name"
                placeholder="e.g., v1.2.0"
                value={newModelData.version_name}
                onChange={(e) => handleInputChange('version_name', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model_type" className="text-right">
                Model Type
              </Label>
              <Input
                id="model_type"
                placeholder="e.g., OCR-Enhanced"
                value={newModelData.model_type}
                onChange={(e) => handleInputChange('model_type', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="accuracy_score" className="text-right">
                Accuracy (%)
              </Label>
              <Input
                id="accuracy_score"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g., 95.5"
                value={newModelData.accuracy_score}
                onChange={(e) => handleInputChange('accuracy_score', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="training_data_size" className="text-right">
                Training Size
              </Label>
              <Input
                id="training_data_size"
                type="number"
                placeholder="e.g., 10000"
                value={newModelData.training_data_size}
                onChange={(e) => handleInputChange('training_data_size', e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Model description..."
                value={newModelData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeployDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeployModel}>
              Deploy Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}