import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Loader2
} from 'lucide-react';
import { exportData, prepareAnalyticsDataForExport, type ExportFormat } from '@/lib/exportUtils';
import { useToast } from '@/hooks/useToast';

interface ExportDataButtonProps {
  data: any[];
  dataType: 'userGrowth' | 'revenue' | 'retention' | 'documentProcessing' | 'featureUsage';
  className?: string;
  disabled?: boolean;
}

export function ExportDataButton({ 
  data, 
  dataType, 
  className = "", 
  disabled = false 
}: ExportDataButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      toast({
        title: "No data to export",
        description: "There is currently no data available for export.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    try {
      const preparedData = prepareAnalyticsDataForExport(data, dataType);
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `spendify_${dataType}_${timestamp}`;
      
      exportData(preparedData, fileName, format);
      
      toast({
        title: "Export successful",
        description: `Data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const formatLabel = (type: string): string => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace('User Growth', 'User Data')
      .replace('Document Processing', 'Document Data');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={className}
          disabled={disabled || exporting || data.length === 0}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export {formatLabel(dataType)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
