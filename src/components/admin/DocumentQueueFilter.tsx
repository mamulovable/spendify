import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DocumentQueueFilter as FilterType } from '@/types/documentProcessing';

const filterSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

interface DocumentQueueFilterProps {
  onFilterChange: (filters: FilterType) => void;
  queueCounts?: Record<string, number>;
}

export function DocumentQueueFilter({ onFilterChange, queueCounts }: DocumentQueueFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: 'all',
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  });

  const handleSubmit = (values: z.infer<typeof filterSchema>) => {
    const newFilters: FilterType = {
      ...values,
    };
    
    // Track active filters for display
    const active: string[] = [];
    if (values.status && values.status !== 'all') active.push(`Status: ${values.status}`);
    if (values.search) active.push(`Search: ${values.search}`);
    if (values.dateRange?.from) active.push('Date range');
    if (values.sortBy && values.sortBy !== 'created_at') active.push(`Sort: ${values.sortBy}`);
    
    setActiveFilters(active);
    onFilterChange(newFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    form.reset({
      status: 'all',
      search: '',
      dateRange: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    
    setActiveFilters([]);
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents or users..."
            className="pl-8"
            value={form.watch('search') || ''}
            onChange={(e) => {
              form.setValue('search', e.target.value);
              handleSubmit(form.getValues());
            }}
          />
        </div>
        
        <div className="flex gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {activeFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              All ({queueCounts?.total || 0})
                            </SelectItem>
                            <SelectItem value="pending">
                              Pending ({queueCounts?.pending || 0})
                            </SelectItem>
                            <SelectItem value="processing">
                              Processing ({queueCounts?.processing || 0})
                            </SelectItem>
                            <SelectItem value="completed">
                              Completed ({queueCounts?.completed || 0})
                            </SelectItem>
                            <SelectItem value="failed">
                              Failed ({queueCounts?.failed || 0})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Range</FormLabel>
                        <FormControl>
                          <DateRangePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="sortBy"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Sort By</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sort by" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="created_at">Date</SelectItem>
                              <SelectItem value="file_name">File Name</SelectItem>
                              <SelectItem value="user_name">User</SelectItem>
                              <SelectItem value="status">Status</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Order</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Order" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="desc">Descending</SelectItem>
                              <SelectItem value="asc">Ascending</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      Clear Filters
                    </Button>
                    <Button type="submit">Apply Filters</Button>
                  </div>
                </form>
              </Form>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {filter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={clearFilters}
              />
            </Badge>
          ))}
          {activeFilters.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}