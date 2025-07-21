import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the LTD plan types
export type LTDPlanType = 'basic_ltd' | 'premium_ltd' | 'ultimate_ltd';

// Define the plan structure
interface LTDPlan {
  id: LTDPlanType;
  name: string;
  description: string;
  features: string[];
  limits: string;
  popular?: boolean;
}

// Available LTD plans
const LTD_PLANS: LTDPlan[] = [
  {
    id: 'basic_ltd',
    name: 'Basic LTD',
    description: 'Perfect for personal expense tracking',
    features: [
      'Expense Tracking',
      'Basic Analytics',
      'Document Upload',
      'Monthly Reports',
      'Email Support'
    ],
    limits: 'Up to 1,000 transactions/month'
  },
  {
    id: 'premium_ltd',
    name: 'Premium LTD',
    description: 'Advanced features for power users',
    features: [
      'Everything in Basic',
      'AI Financial Advisor',
      'Advanced Analytics',
      'Budget Management',
      'Goal Tracking',
      'Priority Support'
    ],
    limits: 'Up to 5,000 transactions/month',
    popular: true
  },
  {
    id: 'ultimate_ltd',
    name: 'Ultimate LTD',
    description: 'Complete financial management solution',
    features: [
      'Everything in Premium',
      'Unlimited Transactions',
      'Advanced Reporting',
      'Custom Categories',
      'API Access',
      'White-label Options',
      'Dedicated Support'
    ],
    limits: 'Unlimited usage'
  }
];

interface LTDPlanSelectionProps {
  onPlanSelect: (planId: LTDPlanType) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export function LTDPlanSelection({ onPlanSelect, onBack, isLoading = false }: LTDPlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<LTDPlanType | null>(null);

  const handlePlanSelect = (planId: LTDPlanType) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onPlanSelect(selectedPlan);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your AppSumo LTD Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that matches your AppSumo purchase to proceed with code redemption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LTD_PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onBack && (
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan || isLoading}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Continue to Code Redemption
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: LTDPlan;
  isSelected: boolean;
  onSelect: (planId: LTDPlanType) => void;
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-300 hover:shadow-lg",
        isSelected 
          ? "border-primary shadow-md ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      )}
      onClick={() => onSelect(plan.id)}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Usage Limits
          </div>
          <div className="text-sm font-semibold text-primary">
            {plan.limits}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Features Included:
          </div>
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="pt-4">
          <div className={cn(
            "w-full h-10 rounded-md border-2 border-dashed flex items-center justify-center transition-all duration-300",
            isSelected 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/30"
          )}>
            {isSelected ? (
              <div className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle className="h-4 w-4" />
                Selected
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Click to select
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}