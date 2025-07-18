import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { X, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const planOptions = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'ltd_solo', label: 'LTD Solo' },
  { value: 'ltd_pro', label: 'LTD Pro' },
];

const announcementSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
  type: z.enum(['info', 'warning', 'success', 'error']),
  startDate: z.date(),
  endDate: z.date(),
  targetPlans: z.array(z.string()).nullable(),
  isActive: z.boolean().default(true),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement;
  onSave: (data: AnnouncementFormData) => void;
  isSubmitting: boolean;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  onSave,
  isSubmitting,
}: AnnouncementDialogProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'info',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      targetPlans: null,
      isActive: true,
    },
  });
  
  useEffect(() => {
    if (announcement) {
      form.reset({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        startDate: new Date(announcement.startDate),
        endDate: new Date(announcement.endDate),
        targetPlans: announcement.targetPlans,
        isActive: announcement.isActive,
      });
      
      if (announcement.targetPlans) {
        setSelectedPlans(announcement.targetPlans);
      } else {
        setSelectedPlans([]);
      }
    } else {
      form.reset({
        title: '',
        content: '',
        type: 'info',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        targetPlans: null,
        isActive: true,
      });
      setSelectedPlans([]);
    }
  }, [announcement, form]);
  
  const onSubmit = (data: AnnouncementFormData) => {
    onSave({
      ...data,
      targetPlans: selectedPlans.length > 0 ? selectedPlans : null,
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {announcement ? 'Edit Announcement' : 'Create Announcement'}
          </DialogTitle>
          <DialogDescription>
            {announcement
              ? 'Update the announcement details'
              : 'Create a new announcement to display to users'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Announcement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Announcement content"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select announcement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
              <FormLabel>Target Plans (Optional)</FormLabel>
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
                  <span className="text-sm text-gray-500">No plans selected (visible to all users)</span>
                )}
              </div>
              <FormDescription>
                Select which subscription plans will see this announcement.
                If none are selected, the announcement will be visible to all users.
              </FormDescription>
            </div>
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this announcement
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : announcement ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}