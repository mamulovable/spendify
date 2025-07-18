import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Download, Copy, ExternalLink } from 'lucide-react';
import { Transaction } from './TransactionTable';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetails({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsProps) {
  if (!transaction) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
            {getStatusBadge(transaction.status)}
          </DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Date</p>
            <p className="text-sm">{format(new Date(transaction.date), 'PPP p')}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-sm font-semibold">${transaction.amount.toFixed(2)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">User</p>
            <div className="flex items-center gap-1">
              <p className="text-sm">{transaction.user_email}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => copyToClipboard(transaction.user_email)}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy email</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <div className="flex items-center gap-1">
              <p className="text-sm">{transaction.user_id}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => copyToClipboard(transaction.user_id)}
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy user ID</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <p className="text-sm">{transaction.plan_type}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
            <p className="text-sm">{transaction.payment_method}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
            <p className="text-sm capitalize">{transaction.transaction_type.replace('_', ' ')}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Reference</p>
            <div className="flex items-center gap-1">
              <p className="text-sm">{transaction.reference || 'N/A'}</p>
              {transaction.reference && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={() => copyToClipboard(transaction.reference || '')}
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy reference</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            
            <Button variant="default" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View User Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}