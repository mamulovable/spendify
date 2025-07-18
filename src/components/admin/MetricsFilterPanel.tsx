import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DateRange } from '@/components/admin/DateRangeFilter';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Filter, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface FilterOptions {
  timeRange: string;
  dateRange: DateRange | undefined;
  segments: string[];
  includeInactive: boolean;
  minSessions: number | undefined;
}

interface MetricsFilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export function MetricsFilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onResetFilters
}: MetricsFilterPanelProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };
  
  const segmentOptions = [
    { id: 'active', label: 'Active Users' },
    { id: 'new', label: 'New Users' },
    { id: 'returning', label: 'Returning Users' },
    { id: 'churned', label: 'Churned Users' },
    { id: 'free', label: 'Free Plan' },
    { id: 'paid', label: 'Paid Plans' },
  ];
  
  const toggleSegment = (segmentId: string) => {
    const currentSegments = [...filters.segments];
    if (currentSegments.includes(segmentId)) {
      updateFilter('segments', currentSegments.filter(id => id !== segmentId));
    } else {
      updateFilter('segments', [...currentSegments, segmentId]);
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Metrics</SheetTitle>
          <SheetDescription>
            Customize your metrics view with advanced filters
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label>Time Range</Label>
            <Select 
              value={filters.timeRange} 
              onValueChange={(value) => updateFilter('timeRange', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filters.timeRange === 'custom' && (
            <div className="space-y-2">
              <Label>Custom Date Range</Label>
              <DateRangePicker
                date={filters.dateRange}
                onDateChange={(range) => updateFilter('dateRange', range)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>User Segments</Label>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {segmentOptions.map((segment) => (
                <div key={segment.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`segment-${segment.id}`}
                    checked={filters.segments.includes(segment.id)}
                    onCheckedChange={() => toggleSegment(segment.id)}
                  />
                  <label 
                    htmlFor={`segment-${segment.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {segment.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-inactive"
                checked={filters.includeInactive}
                onCheckedChange={(checked) => 
                  updateFilter('includeInactive', checked === true)
                }
              />
              <Label htmlFor="include-inactive">Include inactive users</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-sessions">Minimum Sessions</Label>
            <Input
              id="min-sessions"
              type="number"
              min="0"
              value={filters.minSessions || ''}
              onChange={(e) => updateFilter('minSessions', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Enter minimum sessions"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onResetFilters}>
            <X className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <SheetClose asChild>
            <Button onClick={onApplyFilters}>Apply Filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}