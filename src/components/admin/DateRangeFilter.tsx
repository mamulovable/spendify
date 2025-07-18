import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export type DateRange = {
  from: Date;
  to: Date;
};

export type PresetRange = '7d' | '30d' | '90d' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRangeFilterProps {
  value: DateRange | PresetRange;
  onChange: (value: DateRange | PresetRange) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [isCustomRange, setIsCustomRange] = useState(typeof value !== 'string');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  
  // Handle preset selection
  const handlePresetChange = (preset: PresetRange) => {
    if (preset === 'custom') {
      setIsCustomRange(true);
      // Initialize custom range with current date range
      const range = getDateRangeFromPreset(typeof value === 'string' ? value : '30d');
      setCustomRange(range);
      onChange(range);
    } else {
      setIsCustomRange(false);
      onChange(preset);
    }
  };
  
  // Handle custom range selection
  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
    if (range.from && range.to) {
      onChange(range);
    }
  };
  
  // Get current display text
  const getDisplayText = () => {
    if (typeof value === 'string') {
      switch (value) {
        case '7d':
          return 'Last 7 days';
        case '30d':
          return 'Last 30 days';
        case '90d':
          return 'Last 90 days';
        case 'month':
          return 'This month';
        case 'quarter':
          return 'This quarter';
        case 'year':
          return 'This year';
        default:
          return 'Select range';
      }
    } else {
      return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
    }
  };
  
  // Get date range from preset
  const getDateRangeFromPreset = (preset: PresetRange): DateRange => {
    const now = new Date();
    
    switch (preset) {
      case '7d':
        return { from: subDays(now, 7), to: now };
      case '30d':
        return { from: subDays(now, 30), to: now };
      case '90d':
        return { from: subDays(now, 90), to: now };
      case 'month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return { from: quarterStart, to: quarterEnd };
      case 'year':
        return { from: startOfYear(now), to: endOfYear(now) };
      default:
        return { from: subDays(now, 30), to: now };
    }
  };
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Select
        value={isCustomRange ? 'custom' : (value as string)}
        onValueChange={handlePresetChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
          <SelectItem value="month">This month</SelectItem>
          <SelectItem value="quarter">This quarter</SelectItem>
          <SelectItem value="year">This year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>
      
      {isCustomRange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !customRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, "LLL dd, y")} -{" "}
                    {format(customRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(customRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange.from}
              selected={customRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  handleCustomRangeChange(range as DateRange);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}