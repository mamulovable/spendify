import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { ModuleConfigFormData, ModuleSettingField } from '@/types/moduleConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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
import { X } from 'lucide-react';

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'ltd_solo', label: 'LTD Solo' },
  { value: 'ltd_pro', label: 'LTD Pro' },
];

// Dynamic schema based on module definition
const createModuleConfigSchema = () => {
  return z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    description: z.string().optional(),
    enabled: z.boolean().default(false),
    requiredPlan: z.array(z.string()).default([]),
    settings: z.record(z.any()),
  });
};

interface ModuleConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
}

export function ModuleConfigDialog({
  open,
  onOpenChange,
  moduleId,
}: ModuleConfigDialogProps) {
  const { getMergedModuleData, getModuleDefinition, saveModuleConfig, isSaving } = useModuleConfig();
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  
  const moduleData = getMergedModuleData(moduleId);
  const moduleDefinition = getModuleDefinition(moduleId);
  
  const form = useForm<ModuleConfigFormData>({
    resolver: zodResolver(createModuleConfigSchema()),
    defaultValues: {
      name: '',
      description: '',
      enabled: false,
      requiredPlan: [],
      settings: {},
    },
  });
  
  useEffect(() => {
    if (moduleData) {
      form.reset({
        name: moduleData.name,
        description: moduleData.description,
        enabled: moduleData.enabled,
        requiredPlan: moduleData.requiredPlan || [],
        settings: moduleData.settings || {},
      });
      
      if (moduleData.requiredPlan) {
        setSelectedPlans(moduleData.requiredPlan);
      }
    }
  }, [moduleData, form]);
  
  const onSubmit = (data: ModuleConfigFormData) => {
    saveModuleConfig({
      moduleId,
      configData: {
        ...data,
        requiredPlan: selectedPlans,
      },
    });
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
  
  if (!moduleData || !moduleDefinition) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configure {moduleData.name}</DialogTitle>
          <DialogDescription>
            Configure module settings and access controls
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Module Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
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
                    <FormLabel className="text-base">Module Status</FormLabel>
                    <FormDescription>
                      Enable or disable this module for all users
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
            
            <div className="space-y-2">
              <FormLabel>Required Plans</FormLabel>
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
                Select which subscription plans have access to this module.
                If none are selected, the module will be available to all plans when enabled.
              </FormDescription>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Module Settings</h3>
              
              {moduleDefinition.settings.map((setting: ModuleSettingField) => (
                <FormField
                  key={setting.key}
                  control={form.control}
                  name={`settings.${setting.key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{setting.label}</FormLabel>
                      <FormControl>
                        {setting.type === 'text' && (
                          <Input
                            {...field}
                            value={field.value || setting.defaultValue || ''}
                          />
                        )}
                        {setting.type === 'number' && (
                          <Input
                            {...field}
                            type="number"
                            value={field.value ?? setting.defaultValue ?? ''}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                        {setting.type === 'boolean' && (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value ?? setting.defaultValue ?? false}
                              onCheckedChange={field.onChange}
                            />
                            <span>
                              {field.value ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        )}
                        {setting.type === 'select' && setting.options && (
                          <Select
                            value={field.value ?? setting.defaultValue ?? ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {setting.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {setting.type === 'multiselect' && setting.options && (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {(field.value || []).map((value: string) => (
                                <Badge key={value} variant="secondary" className="px-2 py-1">
                                  {setting.options?.find((o) => o.value === value)?.label || value}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValues = (field.value || []).filter((v: string) => v !== value);
                                      field.onChange(newValues);
                                    }}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (!field.value?.includes(value)) {
                                  field.onChange([...(field.value || []), value]);
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Add option" />
                              </SelectTrigger>
                              <SelectContent>
                                {setting.options
                                  .filter((option) => !(field.value || []).includes(option.value))
                                  .map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </FormControl>
                      {setting.description && (
                        <FormDescription>{setting.description}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
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
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}