import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FeatureFlag, FeatureFlagFormData } from '@/types/featureFlag';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'ltd_solo', label: 'LTD Solo' },
  { value: 'ltd_pro', label: 'LTD Pro' },
];

const featureFlagSchema = z.object({
  name: z.string()
    .min(3, { message: 'Name must be at least 3 characters' })
    .max(50, { message: 'Name must be less than 50 characters' })
    .regex(/^[a-z0-9_]+$/, { 
      message: 'Name must contain only lowercase letters, numbers, and underscores' 
    }),
  description: z.string().max(200, { message: 'Description must be less than 200 characters' }).optional(),
  enabled: z.boolean().default(false),
  user_percentage: z.number().min(0).max(100).nullable().optional(),
  allowed_plans: z.array(z.string()).nullable().optional(),
});

interface FeatureFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureFlag?: FeatureFlag;
  mode: 'create' | 'edit';
}

export function FeatureFlagDialog({
  open,
  onOpenChange,
  featureFlag,
  mode,
}: FeatureFlagDialogProps) {
  const { createFeatureFlag, updateFeatureFlag, isCreating, isUpdating } = useFeatureFlags();
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('');

  const form = useForm<FeatureFlagFormData>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      name: '',
      description: '',
      enabled: false,
      user_percentage: null,
      allowed_plans: [],
    },
  });

  useEffect(() => {
    if (featureFlag && mode === 'edit') {
      form.reset({
        name: featureFlag.name,
        description: featureFlag.description || '',
        enabled: featureFlag.enabled,
        user_percentage: featureFlag.user_percentage,
        allowed_plans: featureFlag.allowed_plans,
      });
      
      if (featureFlag.allowed_plans) {
        setSelectedPlans(featureFlag.allowed_plans);
      }
    }
  }, [featureFlag, mode, form]);

  const onSubmit = (data: FeatureFlagFormData) => {
    if (mode === 'create') {
      createFeatureFlag({
        ...data,
        allowed_plans: selectedPlans.length > 0 ? selectedPlans : null,
      });
    } else if (mode === 'edit' && featureFlag) {
      updateFeatureFlag({
        id: featureFlag.id,
        data: {
          ...data,
          allowed_plans: selectedPlans.length > 0 ? selectedPlans : null,
        },
      });
    }
    onOpenChange(false);
  };

  const addPlan = () => {
    if (currentPlan && !selectedPlans.includes(currentPlan)) {
      setSelectedPlans([...selectedPlans, currentPlan]);
      setCurrentPlan('');
    }
  };

  const removePlan = (plan: string) => {
    setSelectedPlans(selectedPlans.filter((p) => p !== plan));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Feature Flag' : 'Edit Feature Flag'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new feature flag to control feature availability.'
              : 'Update the settings for this feature flag.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="feature_name" 
                      {...field} 
                      disabled={mode === 'edit'}
                    />
                  </FormControl>
                  <FormDescription>
                    Use lowercase letters, numbers, and underscores only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this feature flag controls"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Turn the feature on or off globally.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Percentage (A/B Testing)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Slider
                        defaultValue={[field.value || 0]}
                        max={100}
                        step={1}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                      <div className="flex justify-between">
                        <span>0%</span>
                        <span className="font-medium">{field.value || 0}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Percentage of users who will see this feature. Set to 0 to disable A/B testing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Allowed Plans</FormLabel>
              <div className="flex gap-2">
                <Select value={currentPlan} onValueChange={setCurrentPlan}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addPlan} disabled={!currentPlan}>
                  Add Plan
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedPlans.map((plan) => (
                  <Badge key={plan} variant="secondary" className="px-2 py-1">
                    {planOptions.find((p) => p.value === plan)?.label || plan}
                    <button
                      type="button"
                      onClick={() => removePlan(plan)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedPlans.length === 0 && (
                  <span className="text-sm text-gray-500">No plans selected (available to all)</span>
                )}
              </div>
              <FormDescription>
                Select which subscription plans have access to this feature.
                If none are selected, the feature will be available to all plans when enabled.
              </FormDescription>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}