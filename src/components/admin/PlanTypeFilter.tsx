import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Filter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlanType = 'free' | 'premium' | 'ltd_solo' | 'ltd_pro' | 'all';

interface PlanTypeFilterProps {
  selectedPlans: PlanType[];
  onChange: (plans: PlanType[]) => void;
  className?: string;
  label?: string;
  showAllOption?: boolean;
}

export function PlanTypeFilter({ 
  selectedPlans, 
  onChange, 
  className,
  label = 'Filter by Plan',
  showAllOption = true
}: PlanTypeFilterProps) {
  const allPlans: PlanType[] = ['free', 'premium', 'ltd_solo', 'ltd_pro'];
  
  const handleTogglePlan = (plan: PlanType) => {
    if (plan === 'all') {
      // Toggle between all plans and no plans
      onChange(selectedPlans.length === allPlans.length ? [] : [...allPlans]);
    } else {
      // Toggle individual plan
      const newSelectedPlans = selectedPlans.includes(plan)
        ? selectedPlans.filter(p => p !== plan)
        : [...selectedPlans, plan];
      
      onChange(newSelectedPlans);
    }
  };
  
  const getPlanLabel = (plan: PlanType): string => {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'premium':
        return 'Premium';
      case 'ltd_solo':
        return 'LTD Solo';
      case 'ltd_pro':
        return 'LTD Pro';
      case 'all':
        return 'All Plans';
      default:
        return plan;
    }
  };
  
  const isAllSelected = allPlans.every(plan => selectedPlans.includes(plan));
  const isNoneSelected = selectedPlans.length === 0;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("flex items-center gap-2", className)}
          size="sm"
        >
          <Filter className="h-4 w-4" />
          <span>{label}</span>
          {!isNoneSelected && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
              {selectedPlans.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Filter by Plan Type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {showAllOption && (
          <DropdownMenuCheckboxItem
            checked={isAllSelected}
            onCheckedChange={() => handleTogglePlan('all')}
          >
            All Plans
          </DropdownMenuCheckboxItem>
        )}
        
        {allPlans.map(plan => (
          <DropdownMenuCheckboxItem
            key={plan}
            checked={selectedPlans.includes(plan)}
            onCheckedChange={() => handleTogglePlan(plan)}
          >
            {getPlanLabel(plan)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}