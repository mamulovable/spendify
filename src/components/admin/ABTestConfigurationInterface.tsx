import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ABTestConfig } from '@/types/featureFlag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const abTestSchema = z.object({
  enabled: z.boolean().default(false),
  userPercentage: z.number().min(1).max(100),
  variants: z.array(
    z.object({
      name: z.string().min(1, { message: 'Variant name is required' }),
      weight: z.number().min(1).max(100),
    })
  ).min(2, { message: 'At least two variants are required' }),
});

interface ABTestConfigurationInterfaceProps {
  featureFlagId: string;
  initialConfig?: ABTestConfig;
  onSave: (config: ABTestConfig) => void;
}

export function ABTestConfigurationInterface({
  featureFlagId,
  initialConfig,
  onSave,
}: ABTestConfigurationInterfaceProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ABTestConfig>({
    resolver: zodResolver(abTestSchema),
    defaultValues: initialConfig || {
      enabled: false,
      userPercentage: 50,
      variants: [
        { name: 'control', weight: 50 },
        { name: 'variant_a', weight: 50 },
      ],
    },
  });

  const { control, handleSubmit, watch, setValue, formState } = form;
  const variants = watch('variants');
  const enabled = watch('enabled');

  const addVariant = () => {
    const currentVariants = form.getValues('variants');
    setValue('variants', [
      ...currentVariants,
      { name: `variant_${currentVariants.length}`, weight: 0 },
    ]);
  };

  const removeVariant = (index: number) => {
    const currentVariants = form.getValues('variants');
    if (currentVariants.length <= 2) {
      toast({
        title: 'Cannot remove variant',
        description: 'A/B tests require at least two variants.',
        variant: 'destructive',
      });
      return;
    }
    setValue(
      'variants',
      currentVariants.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data: ABTestConfig) => {
    // Validate that weights sum to 100%
    const totalWeight = data.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (totalWeight !== 100) {
      toast({
        title: 'Invalid weights',
        description: 'Variant weights must sum to 100%.',
        variant: 'destructive',
      });
      return;
    }

    onSave(data);
    setIsEditing(false);
    toast({
      title: 'A/B test configuration saved',
      description: 'The A/B test configuration has been updated successfully.',
    });
  };

  if (!isEditing && initialConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>A/B Test Configuration</CardTitle>
          <CardDescription>
            Configure A/B testing parameters for this feature flag
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <span className={initialConfig.enabled ? 'text-green-600' : 'text-gray-500'}>
                {initialConfig.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">User Percentage:</span>
              <span>{initialConfig.userPercentage}%</span>
            </div>
            <div className="space-y-2">
              <span className="font-medium">Variants:</span>
              <div className="space-y-2">
                {initialConfig.variants.map((variant, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{variant.name}</span>
                    <span>{variant.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsEditing(true)}>Edit Configuration</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>A/B Test Configuration</CardTitle>
        <CardDescription>
          Configure A/B testing parameters for this feature flag
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable A/B Testing</FormLabel>
                    <FormDescription>
                      Turn A/B testing on or off for this feature.
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

            {enabled && (
              <>
                <FormField
                  control={control}
                  name="userPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Percentage</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            defaultValue={[field.value]}
                            max={100}
                            step={1}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                          <div className="flex justify-between">
                            <span>0%</span>
                            <span className="font-medium">{field.value}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Percentage of users who will be included in this A/B test.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Variants</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>

                  {variants.map((_, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <FormField
                        control={control}
                        name={`variants.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="col-span-5">
                            <FormControl>
                              <Input placeholder="Variant name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`variants.${index}.weight`}
                        render={({ field }) => (
                          <FormItem className="col-span-6">
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Slider
                                  defaultValue={[field.value]}
                                  max={100}
                                  step={1}
                                  onValueChange={(values) => field.onChange(values[0])}
                                />
                                <span className="w-12 text-right">{field.value}%</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="col-span-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <FormDescription>
                    Define variants for your A/B test. Weights must sum to 100%.
                  </FormDescription>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}