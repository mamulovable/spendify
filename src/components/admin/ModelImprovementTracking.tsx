import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ModelImprovement } from '@/types/aiFeedback';

interface ModelImprovementTrackingProps {
  modelImprovements: ModelImprovement[];
  isLoading: boolean;
}

export const ModelImprovementTracking: React.FC<ModelImprovementTrackingProps> = ({
  modelImprovements,
  isLoading
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const calculateChange = (before: number, after: number) => {
    const change = after - before;
    const percentChange = (change / before) * 100;
    
    return {
      value: change,
      percent: percentChange,
      isPositive: change > 0,
      isNeutral: change === 0
    };
  };
  
  const renderChangeIndicator = (before: number, after: number) => {
    const change = calculateChange(before, after);
    
    if (change.isNeutral) {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="h-4 w-4 mr-1" />
          <span>No change</span>
        </div>
      );
    }
    
    if (change.isPositive) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span>+{formatPercentage(Math.abs(change.percent))}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-red-600">
        <TrendingDown className="h-4 w-4 mr-1" />
        <span>-{formatPercentage(Math.abs(change.percent))}</span>
      </div>
    );
  };
  
  const renderMetricComparison = (before: number, after: number) => {
    return (
      <div className="flex flex-col">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Before:</span>
          <span>{formatPercentage(before)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">After:</span>
          <span className="font-medium">{formatPercentage(after)}</span>
        </div>
        <div className="mt-1">
          {renderChangeIndicator(before, after)}
        </div>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Improvement History</CardTitle>
        <CardDescription>
          Track performance improvements across model versions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : modelImprovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <h3 className="text-lg font-medium">No model improvements recorded</h3>
            <p className="text-muted-foreground mt-2">
              Model improvement data will appear here after training new models
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Model Version</TableHead>
                  <TableHead>Training Examples</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Precision</TableHead>
                  <TableHead>Recall</TableHead>
                  <TableHead>F1 Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelImprovements.map((improvement) => (
                  <TableRow key={improvement.id}>
                    <TableCell>{formatDate(improvement.training_date)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1">
                          {improvement.model_version}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          from {improvement.previous_version}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{improvement.training_examples_count.toLocaleString()}</TableCell>
                    <TableCell>
                      {renderMetricComparison(improvement.accuracy_before, improvement.accuracy_after)}
                    </TableCell>
                    <TableCell>
                      {renderMetricComparison(improvement.precision_before, improvement.precision_after)}
                    </TableCell>
                    <TableCell>
                      {renderMetricComparison(improvement.recall_before, improvement.recall_after)}
                    </TableCell>
                    <TableCell>
                      {renderMetricComparison(improvement.f1_before, improvement.f1_after)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};