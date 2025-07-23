import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TransactionTableProps<TData> {
  data: TData[];
  columns: string[];
  pageSize?: number;
}

export function TransactionTable<TData extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
}: TransactionTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // Generate column definitions from the provided column names
  const columnDefs: ColumnDef<TData>[] = columns.map((column) => ({
    accessorKey: column,
    header: column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1'),
    cell: ({ row }) => {
      const value = row.getValue(column);
      
      // Format based on column type
      if (column === 'amount' || column === 'totalSpent' || column === 'averageSpent') {
        return typeof value === 'number' ? `₦${value.toLocaleString()}` : value;
      }
      
      if (column === 'date') {
        return value ? new Date(value as string).toLocaleDateString() : '';
      }
      
      if (column === 'riskScore' && typeof value === 'number') {
        const score = value as number;
        let color = 'text-green-500';
        if (score > 70) color = 'text-red-500';
        else if (score > 40) color = 'text-amber-500';
        
        return <span className={color}>{score}</span>;
      }
      
      return value;
    },
  }));

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-[40px]"></TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    <TableCell className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleRowExpanded(row.id)}
                      >
                        {expandedRows[row.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.id] && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length + 1} className="bg-muted/50 p-4">
                        <div className="text-sm">
                          <h4 className="font-medium mb-2">Transaction Details</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(row.original).map(([key, value]) => {
                              // Skip columns that are already displayed in the main row
                              if (columns.includes(key)) return null;
                              
                              return (
                                <div key={key} className="flex flex-col">
                                  <span className="text-xs text-muted-foreground">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                  </span>
                                  <span>
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}