import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson, ChevronDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'excel' | 'json';

interface AnalyticsExportProps {
  data: any[];
  filename: string;
  label?: string;
  formats?: ExportFormat[];
  onExport?: (format: ExportFormat) => void;
  className?: string;
}

export function AnalyticsExport({ 
  data, 
  filename, 
  label = 'Export', 
  formats = ['csv', 'excel', 'json'],
  onExport,
  className 
}: AnalyticsExportProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  
  const handleExport = async (format: ExportFormat) => {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    
    setExporting(format);
    
    try {
      // Call onExport callback if provided
      if (onExport) {
        onExport(format);
      }
      
      switch (format) {
        case 'csv':
          exportToCsv();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'json':
          exportToJson();
          break;
      }
    } catch (error) {
      console.error(`Error exporting data as ${format}:`, error);
    } finally {
      setExporting(null);
    }
  };
  
  const exportToCsv = () => {
    // Convert data to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      // Headers row
      headers.join(','),
      
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle special cases (null, undefined, objects, etc.)
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          return value;
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  };
  
  const exportToExcel = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Generate Excel file and save
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };
  
  const exportToJson = () => {
    // Convert data to JSON string
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    saveAs(blob, `${filename}.json`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="mr-2 h-4 w-4" />
          {label}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')} disabled={exporting !== null}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Export as CSV</span>
            {exporting === 'csv' && (
              <span className="ml-2 h-4 w-4 animate-spin">⏳</span>
            )}
          </DropdownMenuItem>
        )}
        {formats.includes('excel') && (
          <DropdownMenuItem onClick={() => handleExport('excel')} disabled={exporting !== null}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export as Excel</span>
            {exporting === 'excel' && (
              <span className="ml-2 h-4 w-4 animate-spin">⏳</span>
            )}
          </DropdownMenuItem>
        )}
        {formats.includes('json') && (
          <DropdownMenuItem onClick={() => handleExport('json')} disabled={exporting !== null}>
            <FileJson className="mr-2 h-4 w-4" />
            <span>Export as JSON</span>
            {exporting === 'json' && (
              <span className="ml-2 h-4 w-4 animate-spin">⏳</span>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}