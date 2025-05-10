import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface OnboardingStepWrapperProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
}

const OnboardingStepWrapper: React.FC<OnboardingStepWrapperProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  children,
  onNext,
  onPrevious,
  isNextDisabled = false,
  nextButtonText = 'Next', 
  previousButtonText = 'Previous',
}) => {
  return (
    <Card className="w-full max-w-lg mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <p className="text-sm text-muted-foreground pt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter className="flex justify-between">
        {onPrevious && currentStep > 1 ? (
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {previousButtonText}
          </Button>
        ) : (
          <div /> 
        )}
        {onNext && (
          <Button onClick={onNext} disabled={isNextDisabled}>
            {nextButtonText} 
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OnboardingStepWrapper;
