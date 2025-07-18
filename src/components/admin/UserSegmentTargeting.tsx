import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserSegment } from '@/types/featureFlag';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const userSegmentSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().optional(),
  criteria: z.record(z.any()),
});

interface UserSegmentTargetingProps {
  featureFlagId: string;
  segments: UserSegment[];
  onAddSegment: (segment: UserSegment) => void;
  onRemoveSegment: (segmentId: string) => void;
}

export function UserSegmentTargeting({
  featureFlagId,
  segments,
  onAddSegment,
  onRemoveSegment,
}: UserSegmentTargetingProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [criteriaType, setCriteriaType] = useState<string>('');
  const [criteriaValue, setCriteriaValue] = useState<string>('');
  const [criteriaList, setCriteriaList] = useState<Record<string, any>>({});

  const form = useForm<UserSegment>({
    resolver: zodResolver(userSegmentSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      criteria: {},
    },
  });

  const criteriaOptions = [
    { value: 'plan', label: 'Subscription Plan' },
    { value: 'country', label: 'Country' },
    { value: 'signup_date', label: 'Signup Date' },
    { value: 'last_active', label: 'Last Active Date' },
    { value: 'document_count', label: 'Document Count' },
  ];

  const addCriteria = () => {
    if (!criteriaType || !criteriaValue) return;
    
    setCriteriaList({
      ...criteriaList,
      [criteriaType]: criteriaValue,
    });
    
    form.setValue('criteria', {
      ...form.getValues('criteria'),
      [criteriaType]: criteriaValue,
    });
    
    setCriteriaType('');
    setCriteriaValue('');
  };

  const removeCriteria = (key: string) => {
    const newCriteriaList = { ...criteriaList };
    delete newCriteriaList[key];
    setCriteriaList(newCriteriaList);
    
    const newCriteria = { ...form.getValues('criteria') };
    delete newCriteria[key];
    form.setValue('criteria', newCriteria);
  };

  const onSubmit = (data: UserSegment) => {
    // Generate a unique ID for the segment
    const newSegment = {
      ...data,
      id: `segment_${Date.now()}`,
      criteria: criteriaList,
    };
    
    onAddSegment(newSegment);
    setIsCreating(false);
    setCriteriaList({});
    form.reset();
    
    toast({
      title: 'User segment created',
      description: 'The user segment has been created successfully.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segment Targeting</CardTitle>
        <CardDescription>
          Define user segments to target specific user groups with this feature
        </CardDescription>
      </CardHeader>
      <CardContent>
        {segments.length > 0 ? (
          <div className="space-y-4 mb-4">
            <h4 className="text-sm font-medium">Active Segments</h4>
            <div className="space-y-2">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div>
                    <h5 className="font-medium">{segment.name}</h5>
                    {segment.description && (
                      <p className="text-sm text-gray-500">{segment.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(segment.criteria).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {criteriaOptions.find((o) => o.value === key)?.label || key}: {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSegment(segment.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            No user segments defined for this feature flag.
          </div>
        )}

        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add User Segment
          </Button>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this user segment"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Segment Criteria</FormLabel>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(criteriaList).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="px-2 py-1">
                      {criteriaOptions.find((o) => o.value === key)?.label || key}: {value}
                      <button
                        type="button"
                        onClick={() => removeCriteria(key)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Select value={criteriaType} onValueChange={setCriteriaType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select criteria" />
                      </SelectTrigger>
                      <SelectContent>
                        {criteriaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Criteria value"
                      value={criteriaValue}
                      onChange={(e) => setCriteriaValue(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      onClick={addCriteria}
                      disabled={!criteriaType || !criteriaValue}
                      className="w-full"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <FormDescription>
                  Define criteria to determine which users will be included in this segment.
                </FormDescription>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setCriteriaList({});
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Segment</Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}