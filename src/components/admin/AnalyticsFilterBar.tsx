import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RefreshCw, Download } from 'lucide-react';
import { ExportDataButton } from '@/components/admin/ExportDataButton';
import { DateRangeFilter, DateRange, PresetRange } from '@/components/admin/DateRangeFilter';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { PlanTypeFilter, PlanType } from '@/components/admin/PlanTypeFilter';
import { TransactionTypeFilter, TransactionType } from '@/components/admin/TransactionTypeFilter';
import { AnalyticsExport, ExportFormat } from '@/components/admin/AnalyticsExport';

interface AnalyticsFilterBarProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  onRefresh: () => void;
  exportData: any[];
  exportFilename: string;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  showDateRangePicker?: boolean;
  selectedPlans?: PlanType[];
  onPlanTypeChange?: (plans: PlanType[]) => void;
  showPlanTypeFilter?: boolean;
  transactionType?: TransactionType;
  onTransactionTypeChange?: (type: TransactionType) => void;
  showTransactionTypeFilter?: boolean;
  exportFormats?: ExportFormat[];
  children?: React.ReactNode;
  className?: string;
}

export function AnalyticsFilterBar({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  exportData,
  exportFilename,
  dateRange,
  onDateRangeChange,
  showDateRangePicker = false,
  selectedPlans,
  onPlanTypeChange,
  showPlanTypeFilter = false,
  transactionType,
  onTransactionTypeChange,
  showTransactionTypeFilter = false,
  exportFormats = ['csv', 'excel', 'json'],
  children,
  className
}: AnalyticsFilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
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
        
        {showDateRangePicker && timeRange === 'custom' && dateRange && onDateRangeChange && (
          <DateRangePicker
            date={dateRange}
            onDateChange={onDateRangeChange}
          />
        )}
        
        {showPlanTypeFilter && selectedPlans && onPlanTypeChange && (
          <PlanTypeFilter
            selectedPlans={selectedPlans}
            onChange={onPlanTypeChange}
          />
        )}
        
        {showTransactionTypeFilter && transactionType && onTransactionTypeChange && (
          <TransactionTypeFilter
            selectedType={transactionType}
            onChange={onTransactionTypeChange}
          />
        )}
        
        {children}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        
        <AnalyticsExport 
          data={exportData} 
          filename={exportFilename}
          formats={exportFormats}
        />
      </div>
    </div>
  );
}