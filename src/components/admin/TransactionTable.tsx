import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MoreHorizontal, Search, Download, Eye } from 'lucide-react';

export interface Transaction {
  id: string;
  date: string;
  user_email: string;
  user_id: string;
  plan_type: string;
  amount: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transaction_type: 'subscription' | 'one_time' | 'refund' | 'appsumo';
  reference?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewDetails?: (transaction: Transaction) => void;
  onExportCSV?: () => void;
  transactionType?: string;
  selectedPlans?: string[];
}

export function TransactionTable({
  transactions,
  isLoading = false,
  onViewDetails,
  onExportCSV,
  transactionType = 'all',
  selectedPlans = []
}: TransactionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter transactions based on search query, transaction type, and selected plans
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by search query
    const matchesSearch = 
      transaction.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by transaction type
    const matchesType = transactionType === 'all' || transaction.transaction_type === transactionType;
    
    // Filter by plan type
    const matchesPlan = selectedPlans.length === 0 || 
      selectedPlans.includes('all') || 
      selectedPlans.includes(transaction.plan_type.toLowerCase());
    
    return matchesSearch && matchesType && matchesPlan;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortField === 'date') {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    if (sortField === 'amount') {
      return sortDirection === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
    }
    
    const valueA = String(a[sortField]).toLowerCase();
    const valueB = String(b[sortField]).toLowerCase();
    return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });

  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get status badge color
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get transaction type badge
  const getTransactionTypeBadge = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'subscription':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Subscription</Badge>;
      case 'one_time':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">One-time</Badge>;
      case 'refund':
        return <Badge variant="outline" className="border-red-500 text-red-700">Refund</Badge>;
      case 'appsumo':
        return <Badge variant="outline" className="border-amber-500 text-amber-700">AppSumo</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('date')}
              >
                Date
                {sortField === 'date' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('user_email')}
              >
                User
                {sortField === 'user_email' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('plan_type')}
              >
                Plan
                {sortField === 'plan_type' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('amount')}
              >
                Amount
                {sortField === 'amount' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : sortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{transaction.user_email}</TableCell>
                  <TableCell>{transaction.plan_type}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{getTransactionTypeBadge(transaction.transaction_type)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails?.(transaction)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Showing {sortedTransactions.length} of {transactions.length} transactions
      </div>
    </div>
  );
}