import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';

interface ExportDataButtonProps {
  data: any[];
  filename: string;
  buttonProps?: ButtonProps;
  children: React.ReactNode;
}

export function ExportDataButton({
  data,
  filename,
  buttonProps,
  children
}: ExportDataButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return;
    }
    
    try {
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
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  return (
    <Button onClick={handleExport} {...buttonProps}>
      {children}
    </Button>
  );
}