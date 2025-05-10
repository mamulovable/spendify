import React from 'react';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface OnboardingStep4Props {
  onFinish: () => void;
  onPrevious: () => void;
  setData: (data: { interestedTools: string[] }) => void;
  currentData: { interestedTools: string[] };
  totalSteps: number;
  currentStepNumber: number;
}

const toolOptions = [
  { id: 'budget_tracking', label: 'Budget creation and tracking' },
  { id: 'ai_advice', label: 'AI-powered financial advice' },
  { id: 'financial_goals', label: 'Setting and tracking financial goals' },
  { id: 'none', label: "Not right now, I'm focused on statement analysis" },
];

const OnboardingStep4: React.FC<OnboardingStep4Props> = ({
  onFinish,
  onPrevious,
  setData,
  currentData,
  totalSteps,
  currentStepNumber,
}) => {
  const handleSelectionChange = (toolId: string, checked: boolean) => {
    let newSelection = [...(currentData.interestedTools || [])];
    if (toolId === 'none') {
      newSelection = checked ? ['none'] : [];
    } else {
      newSelection = newSelection.filter(id => id !== 'none'); // Remove 'none' if other options are selected
      if (checked) {
        if (!newSelection.includes(toolId)) {
          newSelection.push(toolId);
        }
      } else {
        newSelection = newSelection.filter(id => id !== toolId);
      }
    }
    setData({ interestedTools: newSelection });
  };

  return (
    <OnboardingStepWrapper
      title="Other Financial Tools"
      description="Are you interested in exploring other financial tools we offer? (Optional)"
      currentStep={currentStepNumber}
      totalSteps={totalSteps}
      onNext={onFinish} 
      onPrevious={onPrevious}
      isNextDisabled={false} 
      nextButtonText="Finish"
    >
      <div className="space-y-3">
        {toolOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-3">
            <Checkbox
              id={option.id}
              checked={(currentData.interestedTools || []).includes(option.id)}
              onCheckedChange={(checked) => handleSelectionChange(option.id, !!checked)}
            />
            <Label htmlFor={option.id} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </OnboardingStepWrapper>
  );
};

export default OnboardingStep4;
