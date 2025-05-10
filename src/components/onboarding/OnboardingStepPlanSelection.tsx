import React from 'react';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANS, Plan } from '@/config/pricing'; // Assuming Plan interface is exported
import { Check } from 'lucide-react';

interface OnboardingStepPlanSelectionProps {
  onNext: () => void;
  onPrevious: () => void;
  setData: (data: { selectedPlanId: string }) => void;
  currentData: { selectedPlanId?: string };
  totalSteps: number;
  currentStepNumber: number;
}

const OnboardingStepPlanSelection: React.FC<OnboardingStepPlanSelectionProps> = ({
  onNext,
  onPrevious,
  setData,
  currentData,
  totalSteps,
  currentStepNumber
}) => {
  const handleSelection = (planId: string) => {
    setData({ selectedPlanId: planId });
  };

  return (
    <OnboardingStepWrapper
      title="Choose Your Trial Plan"
      description="Select a plan for your 7-day free trial. You can change or cancel anytime."
      currentStep={currentStepNumber}
      totalSteps={totalSteps}
      onNext={onNext}
      onPrevious={onPrevious}
      isNextDisabled={!currentData.selectedPlanId}
      nextButtonText="Next"
    >
      <RadioGroup
        value={currentData.selectedPlanId}
        onValueChange={handleSelection}
        className="grid grid-cols-1 md:grid-cols-1 gap-4"
      >
        {PLANS.map((plan: Plan) => (
          <Label // Using Label to make the whole card clickable for the radio item
            key={plan.id}
            htmlFor={plan.id}
            className={`cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow ${currentData.selectedPlanId === plan.id ? 'border-primary ring-2 ring-primary' : 'border-border'}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
              <RadioGroupItem value={plan.id} id={plan.id} className="translate-y-[2px]" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <ul className="space-y-1 text-sm">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className={`flex items-center ${feature.included ? '' : 'text-muted-foreground line-through'}`}>
                    <Check className={`h-4 w-4 mr-2 ${feature.included ? 'text-green-500' : 'text-gray-400'}`} />
                    {feature.name}
                  </li>
                ))}
                {plan.features.length > 3 && (
                    <li className="text-xs text-muted-foreground pt-1">+ {plan.features.length - 3} more features...</li>
                )}
              </ul>
            </CardContent>
          </Label>
        ))}
      </RadioGroup>
    </OnboardingStepWrapper>
  );
};

export default OnboardingStepPlanSelection;
