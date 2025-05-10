import React from 'react';
import OnboardingStepWrapper from './OnboardingStepWrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface OnboardingStep1Props {
  onNext: () => void;
  onPrevious?: () => void; // Optional for the first step
  setData: (data: { documentTypes: string }) => void;
  currentData: { documentTypes: string };
  totalSteps: number;
  currentStepNumber: number;
}

const documentOptions = [
  { id: 'bank_statements', label: 'Bank Account Statements (PDF/Image)' },
  { id: 'credit_card_statements', label: 'Credit Card Statements (PDF/Image)' },
  { id: 'invoices_receipts', label: 'Invoices or Receipts (for expense tracking)' },
  { id: 'mix_of_above', label: 'A mix of the above' },
];

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onNext, setData, currentData, totalSteps, currentStepNumber, onPrevious }) => {
  const handleSelection = (value: string) => {
    setData({ documentTypes: value });
  };

  return (
    <OnboardingStepWrapper
      title="Document Types"
      description="What type of documents will you primarily be uploading?"
      currentStep={currentStepNumber}
      totalSteps={totalSteps}
      onNext={onNext}
      onPrevious={onPrevious} // Pass previous if available
      isNextDisabled={!currentData.documentTypes}
    >
      <RadioGroup
        value={currentData.documentTypes}
        onValueChange={handleSelection}
        className="space-y-2"
      >
        {documentOptions.map((option) => (
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

export default OnboardingStep1;
