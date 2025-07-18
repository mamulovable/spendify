import { ConfigHistoryEntry } from '@/types/appConfig';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConfigHistoryTableProps {
  history: ConfigHistoryEntry[];
  isLoading: boolean;
}

export function ConfigHistoryTable({ history, isLoading }: ConfigHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading history...</div>;
  }
  
  if (history.length === 0) {
    return <div className="text-center py-4 text-gray-500">No history available for this configuration.</div>;
  }
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Date</TableHead>
          <TableHead>Changed By</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((entry) => (
          <>
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{format(new Date(entry.createdAt), 'MMM d, yyyy')}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(entry.createdAt), 'h:mm a')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </TableCell>
              <TableCell>{entry.changedBy || 'System'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRow(entry.id)}
                >
                  {expandedRows[entry.id] ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Changes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      View Changes
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
            {expandedRows[entry.id] && (
              <TableRow>
                <TableCell colSpan={3} className="bg-gray-50">
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Previous Value</h4>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">
                        {entry.previousValue ? formatValue(entry.previousValue) : 'No previous value'}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">New Value</h4>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">
                        {formatValue(entry.newValue)}
                      </pre>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  );
}