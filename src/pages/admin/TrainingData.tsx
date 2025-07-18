import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrainingData() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Data</h1>
          <p className="text-muted-foreground">
            Manage AI training data and datasets
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Data</CardTitle>
          <CardDescription>
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>The Training Data management interface will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}