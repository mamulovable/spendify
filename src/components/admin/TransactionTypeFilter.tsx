import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TransactionType = 'all' | 'subscription' | 'one_time' | 'refund' | 'appsumo';

interface TransactionTypeFilterProps {
  selectedType: TransactionType;
  onChange: (type: TransactionType) => void;
  className?: string;
  label?: string;
}

export function TransactionTypeFilter({ 
  selectedType, 
  onChange, 
  className,
  label = 'Transaction Type'
}: TransactionTypeFilterProps) {
  const transactionTypes: TransactionType[] = ['all', 'subscription', 'one_time', 'refund', 'appsumo'];
  
  const getTypeLabel = (type: TransactionType): string => {
    switch (type) {
      case 'all':
        return 'All Transactions';
      case 'subscription':
        return 'Subscriptions';
      case 'one_time':
        return 'One-time Payments';
      case 'refund':
        return 'Refunds';
      case 'appsumo':
        return 'AppSumo Redemptions';
      default:
        return type;
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("flex items-center gap-2", className)}
          size="sm"
        >
          <Filter className="h-4 w-4" />
          <span>{getTypeLabel(selectedType)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Filter by Transaction Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {transactionTypes.map(type => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={selectedType === type}
            onCheckedChange={() => onChange(type)}
          >
            {getTypeLabel(type)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}