import React from 'react';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface OnboardingStep2Props {
  onNext: () => void;
  onPrevious: () => void;
  setData: (data: { mainGoal: string }) => void;
  currentData: { mainGoal: string };
  totalSteps: number;
  currentStepNumber: number;
}

const goalOptions = [
  { id: 'spending_overview', label: 'Get a clear overview of my spending patterns' },
  { id: 'track_expenses', label: 'Track specific types of expenses (e.g., business, subscriptions)' },
  { id: 'fraud_detection', label: 'Identify unusual transactions or potential fraud' },
  { id: 'tax_preparation', label: 'Simplify tax preparation' },
  { id: 'visualize_income_expenses', label: 'Visualize my income vs. expenses' },
];

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ onNext, onPrevious, setData, currentData, totalSteps, currentStepNumber }) => {
  const handleSelection = (value: string) => {
    setData({ mainGoal: value });
  };

  return (
    <OnboardingStepWrapper
      title="Main Goal"
      description="What's your main goal for analyzing these documents?"
      currentStep={currentStepNumber}
      totalSteps={totalSteps}
      onNext={onNext}
      onPrevious={onPrevious}
      isNextDisabled={!currentData.mainGoal}
    >
      <RadioGroup
        value={currentData.mainGoal}
        onValueChange={handleSelection}
        className="space-y-2"
      >
        {goalOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </OnboardingStepWrapper>
  );
};

export default OnboardingStep2;
