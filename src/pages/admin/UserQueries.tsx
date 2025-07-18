import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserQueries() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Queries</h1>
          <p className="text-muted-foreground">
            Manage and respond to user queries
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Queries</CardTitle>
          <CardDescription>
            This feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p>The User Queries management interface will be available soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}