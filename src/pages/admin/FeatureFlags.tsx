import { useState } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { FeatureFlagsTable } from '@/components/admin/FeatureFlagsTable';
import { FeatureFlagDialog } from '@/components/admin/FeatureFlagDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FeatureFlags() {
  const { isCreatingFlag, setIsCreatingFlag } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage feature flags and A/B testing configurations
          </p>
        </div>
        <Button onClick={() => setIsCreatingFlag(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Feature Flag
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Flags</TabsTrigger>
          <TabsTrigger value="enabled">Enabled</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <FeatureFlagsTable />
        </TabsContent>
        
        <TabsContent value="enabled" className="mt-6">
          <FeatureFlagsTable />
        </TabsContent>
        
        <TabsContent value="disabled" className="mt-6">
          <FeatureFlagsTable />
        </TabsContent>
        
        <TabsContent value="ab-testing" className="mt-6">
          <FeatureFlagsTable />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Feature Flag Best Practices</CardTitle>
            <CardDescription>
              Guidelines for effective feature flag management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use descriptive names that clearly indicate the feature's purpose</li>
              <li>Add detailed descriptions to help team members understand the flag's function</li>
              <li>Clean up flags that are no longer needed to reduce technical debt</li>
              <li>Use A/B testing for gradual rollouts of new features</li>
              <li>Target specific user segments for beta testing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>A/B Testing Overview</CardTitle>
            <CardDescription>
              Current active A/B tests and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No active A/B tests at the moment.
            </div>
          </CardContent>
        </Card>
      </div>

      {isCreatingFlag && (
        <FeatureFlagDialog
          open={isCreatingFlag}
          onOpenChange={setIsCreatingFlag}
          mode="create"
        />
      )}
    </div>
  );
}