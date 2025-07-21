import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Gift, CheckCircle, AlertCircle, Info, ArrowLeft } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { appSumoService } from '@/services/appSumoService';
import { useAuth } from '@/contexts/AuthContext';
import { LTDPlanType } from './LTDPlanSelection';

// Define the form schema with validation rules
const formSchema = z.object({
  code: z.string()
    .min(8, { message: 'AppSumo code is required' })
    .refine(val => {
      // Support both AS-XXXXXX format and 15-character format
      const oldFormatPattern = /^AS-[A-Z0-9]{6,}$/i;
      const newFormatPattern = /^[A-Z0-9]{15}$/;
      return oldFormatPattern.test(val) || newFormatPattern.test(val);
    }, {
      message: 'Invalid AppSumo code format. Should be like AS-XXXXXX or 15-character code',
    }),
});

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

// Plan display names
const PLAN_NAMES: Record<LTDPlanType, string> = {
  basic_ltd: 'Basic LTD',
  premium_ltd: 'Premium LTD',
  ultimate_ltd: 'Ultimate LTD'
};

// Plan features for display
const PLAN_FEATURES: Record<LTDPlanType, string[]> = {
  basic_ltd: [
    'Up to 1,000 transactions/month',
    'Basic analytics and reporting',
    'Document upload and processing',
    'Email support'
  ],
  premium_ltd: [
    'Up to 5,000 transactions/month',
    'AI Financial Advisor',
    'Advanced analytics',
    'Budget management',
    'Priority support'
  ],
  ultimate_ltd: [
    'Unlimited transactions',
    'All Premium features',
    'Advanced reporting',
    'API access',
    'Dedicated support'
  ]
};

interface EnhancedCodeRedemptionFormProps {
  selectedPlan: LTDPlanType;
  onSuccess?: () => void;
  onBack?: () => void;
}

export function EnhancedCodeRedemptionForm({ 
  selectedPlan, 
  onSuccess, 
  onBack 
}: EnhancedCodeRedemptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  
  // Get auth context
  const { user } = useAuth();

  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    console.log('Form submission started:', { code: data.code.trim(), selectedPlan, userId: user?.id });
    
    if (!user) {
      setServerError('You must be logged in to redeem an AppSumo code');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setRedemptionSuccess(false);

    try {
      console.log('Calling redeemCodeWithPlan service...');
      
      // Use the enhanced redemption service with plan validation
      const result = await appSumoService.redeemCodeWithPlan({
        code: data.code.trim(),
        planType: selectedPlan,
        userId: user.id
      });

      console.log('Service response:', result);

      if (result.success) {
        console.log('Redemption successful');
        setRedemptionSuccess(true);
        
        // Call the success callback if provided
        if (onSuccess) {
          // Give the user a moment to see the success message
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        console.log('Redemption failed:', result.error);
        
        // Handle specific error types
        if (result.error?.type === 'PLAN_MISMATCH') {
          setServerError(
            `This code is not valid for the ${PLAN_NAMES[selectedPlan]} plan. Please check your AppSumo purchase details or select the correct plan.`
          );
        } else if (result.error?.type === 'CODE_ALREADY_REDEEMED') {
          setServerError('This code has already been redeemed.');
        } else if (result.error?.type === 'INVALID_CODE') {
          setServerError('Invalid code. Please check and try again.');
        } else if (result.error?.type === 'EXPIRED_CODE') {
          setServerError('This code has expired. Please contact AppSumo support.');
        } else {
          setServerError(result.error?.message || 'An error occurred. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Exception in form submission:', error);
      setServerError(error.message || 'An error occurred during code redemption. Please try again.');
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  if (redemptionSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Code Successfully Redeemed!
          </h2>
          <p className="text-green-700 mb-4">
            Your {PLAN_NAMES[selectedPlan]} plan has been activated.
          </p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Activated Plan Benefits
            </CardTitle>
            <CardDescription className="text-green-700">
              You now have lifetime access to these features:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PLAN_FEATURES[selectedPlan].map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="animate-pulse flex items-center justify-center gap-2 text-primary mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Redirecting to your dashboard...</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You'll be automatically redirected to start using your new features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Redeem Your AppSumo Code</h2>
        <p className="text-muted-foreground">
          Enter your AppSumo code to activate your selected plan.
        </p>
      </div>

      {/* Selected Plan Display */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Selected Plan</CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {PLAN_NAMES[selectedPlan]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground mb-3">
            You'll get access to:
          </div>
          <ul className="space-y-1">
            {PLAN_FEATURES[selectedPlan].slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
            {PLAN_FEATURES[selectedPlan].length > 3 && (
              <li className="text-sm text-muted-foreground ml-5">
                ...and more
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AppSumo Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="AS-XXXXXX or 15-character code" 
                    {...field} 
                    className="uppercase font-mono text-center tracking-wider"
                    onChange={(e) => {
                      // Convert to uppercase and preserve hyphens for AS-XXXXXX format
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <div className="flex items-start gap-2 mt-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Enter your AppSumo code (AS-XXXXXX format or 15-character code). 
                    Make sure it matches the {PLAN_NAMES[selectedPlan]} plan you selected.
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Plan Selection
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={isSubmitting || form.watch('code').length < 8}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redeeming Code...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Redeem Code
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Need Help?</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Make sure your code matches the plan you selected</li>
          <li>• Check that the code hasn't been used before</li>
          <li>• Ensure you're entering the correct 15-character code</li>
          <li>• Contact AppSumo support if you continue having issues</li>
        </ul>
      </div>
    </div>
  );
}