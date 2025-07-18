import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { featureFlagService } from '@/services/featureFlagService';
import { ABTestConfigurationInterface } from '@/components/admin/ABTestConfigurationInterface';
import { UserSegmentTargeting } from '@/components/admin/UserSegmentTargeting';
import { FeatureFlag, ABTestConfig, UserSegment } from '@/types/featureFlag';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function FeatureFlagDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFeatureFlag } = useFeatureFlags();
  
  const [featureFlag, setFeatureFlag] = useState<FeatureFlag | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [abTestConfig, setAbTestConfig] = useState<ABTestConfig | null>(null);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  
  useEffect(() => {
    const loadFeatureFlag = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const flag = await featureFlagService.getFeatureFlag(id);
        setFeatureFlag(flag);
        
        // In a real implementation, you would fetch the A/B test config and user segments
        // from the backend. For now, we'll use mock data.
        setAbTestConfig({
          enabled: false,
          userPercentage: 0,
          variants: [
            { name: 'control', weight: 50 },
            { name: 'variant_a', weight: 50 },
          ],
        });
        
        setUserSegments([]);
      } catch (error) {
        console.error('Error loading feature flag:', error);
        toast({
          title: 'Error',
          description: 'Failed to load feature flag details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeatureFlag();
  }, [id]);
  
  const handleToggle = () => {
    if (!featureFlag) return;
    
    toggleFeatureFlag({
      flagName: featureFlag.name,
      enabled: !featureFlag.enabled,
    });
    
    // Optimistically update the UI
    setFeatureFlag({
      ...featureFlag,
      enabled: !featureFlag.enabled,
    });
  };
  
  const handleSaveAbTestConfig = (config: ABTestConfig) => {
    setAbTestConfig(config);
    // In a real implementation, you would save this to the backend
    toast({
      title: 'A/B Test Configuration Saved',
      description: 'The A/B test configuration has been updated successfully.',
    });
  };
  
  const handleAddUserSegment = (segment: UserSegment) => {
    setUserSegments([...userSegments, segment]);
    // In a real implementation, you would save this to the backend
  };
  
  const handleRemoveUserSegment = (segmentId: string) => {
    setUserSegments(userSegments.filter((segment) => segment.id !== segmentId));
    // In a real implementation, you would save this to the backend
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading feature flag details...</p>
        </div>
      </div>
    );
  }
  
  if (!featureFlag) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <p>Feature flag not found.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/feature-flags')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{featureFlag.name}</h1>
        <Badge variant={featureFlag.enabled ? 'default' : 'secondary'}>
          {featureFlag.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Feature Flag Details</CardTitle>
            <CardDescription>
              {featureFlag.description || 'No description provided.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-sm text-gray-500">Enable or disable this feature flag</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={featureFlag.enabled} onCheckedChange={handleToggle} />
                  <span className={featureFlag.enabled ? 'text-green-600' : 'text-gray-500'}>
                    {featureFlag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">User Percentage</h3>
                  <p className="text-sm">
                    {featureFlag.user_percentage !== null
                      ? `${featureFlag.user_percentage}%`
                      : 'Not configured'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Allowed Plans</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {featureFlag.allowed_plans?.map((plan) => (
                      <Badge key={plan} variant="outline">
                        {plan}
                      </Badge>
                    )) || <p className="text-sm">All plans</p>}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Last Updated</h3>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(featureFlag.updated_at), { addSuffix: true })}
                  {featureFlag.last_updated_by_name && ` by ${featureFlag.last_updated_by_name}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => navigate(`/admin/feature-flags/edit/${id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Feature Flag
            </Button>
            <Button variant="outline" className="w-full">
              View Audit Log
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="ab-testing">
        <TabsList>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="user-targeting">User Targeting</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ab-testing" className="mt-6">
          <ABTestConfigurationInterface
            featureFlagId={id || ''}
            initialConfig={abTestConfig || undefined}
            onSave={handleSaveAbTestConfig}
          />
        </TabsContent>
        
        <TabsContent value="user-targeting" className="mt-6">
          <UserSegmentTargeting
            featureFlagId={id || ''}
            segments={userSegments}
            onAddSegment={handleAddUserSegment}
            onRemoveSegment={handleRemoveUserSegment}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flag Analytics</CardTitle>
              <CardDescription>
                Usage statistics and performance metrics for this feature flag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics data will be available once the feature flag has been active.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}