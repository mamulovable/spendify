import React from 'react';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface OnboardingStep3Props {
  onNext: () => void;
  onPrevious: () => void;
  setData: (data: { analysisFrequency: string }) => void;
  currentData: { analysisFrequency: string };
  totalSteps: number;
  currentStepNumber: number;
}

const frequencyOptions = [
  { id: 'monthly', label: 'Monthly (when new statements arrive)' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'as_needed', label: 'As needed (e.g., for specific projects, tax time)' },
  { id: 'exploring', label: "I'm just exploring for now" },
];

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  onNext,
  onPrevious,
  setData,
  currentData,
  totalSteps,
  currentStepNumber,
}) => {
  const handleSelection = (value: string) => {
    setData({ analysisFrequency: value });
  };

  return (
    <OnboardingStepWrapper
      title="Analysis Frequency"
      description="How frequently do you plan to analyze your statements?"
      currentStep={currentStepNumber}
      totalSteps={totalSteps}
      onNext={onNext}
      onPrevious={onPrevious}
      isNextDisabled={!currentData.analysisFrequency}
    >
      <RadioGroup
        value={currentData.analysisFrequency}
        onValueChange={handleSelection}
        className="space-y-2"
      >
        {frequencyOptions.map((option) => (
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

export default OnboardingStep3;
