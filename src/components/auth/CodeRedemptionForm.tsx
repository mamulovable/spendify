import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Gift, CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authService } from '@/services/authService';
import { appSumoService } from '@/services/appSumoService';
import { useAuth } from '@/contexts/AuthContext';
import { AppSumoRedemptionResponse } from '@/types/auth';

// Define the form schema with validation rules
const formSchema = z.object({
  code: z.string()
    .min(5, { message: 'AppSumo code is required' })
    .refine(val => /^AS-[A-Z0-9]{6,}$/i.test(val), {
      message: 'Invalid AppSumo code format. Should be like: AS-XXXXXX',
    }),
});

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

interface CodeRedemptionFormProps {
  onSuccess?: (response: AppSumoRedemptionResponse) => void;
}

export function CodeRedemptionForm({ onSuccess }: CodeRedemptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [redemptionResponse, setRedemptionResponse] = useState<AppSumoRedemptionResponse | null>(null);
  
  // Upgrade confirmation dialog state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    hasSubscription: boolean;
    subscriptionType?: string;
    planType?: string;
    willUpgrade: boolean;
  } | null>(null);

  // Get auth context
  const { user } = useAuth();

  // Initialize the form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  // Validate code in real-time
  const validateCodeInRealTime = async (code: string) => {
    if (!code || code.length < 8) return; // Don't validate until we have enough characters
    
    try {
      const validation = await appSumoService.validateCode({ code });
      
      if (!validation.isValid) {
        form.setError('code', { 
          type: 'manual', 
          message: validation.message 
        });
      } else if (validation.isRedeemed) {
        form.setError('code', { 
          type: 'manual', 
          message: 'This code has already been redeemed' 
        });
      } else {
        // Clear any previous errors if the code is valid
        form.clearErrors('code');
      }
    } catch (error) {
      // Silently fail on real-time validation errors
      console.error('Real-time validation error:', error);
    }
  };

  // Handle upgrade confirmation
  const handleUpgradeConfirm = async () => {
    if (!user || !pendingCode) return;
    
    setShowUpgradeDialog(false);
    setIsSubmitting(true);
    
    try {
      // Use the dedicated upgrade flow for existing users
      const upgradeResult = await appSumoService.upgradeExistingUser(user.id, pendingCode);
      
      if (upgradeResult.success) {
        // Get the redemption details to show the plan benefits
        const response = await authService.redeemAppSumoCode({
          code: pendingCode,
          userId: user.id,
        });
        
        setRedemptionResponse(response);
        setRedemptionSuccess(true);
        
        // Call the success callback if provided
        if (onSuccess && response.success) {
          // Give the user a moment to see the success message
          setTimeout(() => {
            onSuccess(response);
          }, 2000);
        }
      } else {
        setServerError(upgradeResult.message || 'Failed to upgrade your account');
      }
    } catch (error: any) {
      setServerError(error.message || 'An error occurred during the upgrade process');
    } finally {
      setIsSubmitting(false);
      setPendingCode(null);
    }
  };
  
  // Handle upgrade cancellation
  const handleUpgradeCancel = () => {
    setShowUpgradeDialog(false);
    setPendingCode(null);
    setSubscriptionInfo(null);
    setIsSubmitting(false);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      setServerError('You must be logged in to redeem an AppSumo code');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setRedemptionSuccess(false);
    setRedemptionResponse(null);

    try {
      // First validate the code
      const validation = await appSumoService.validateCode({ code: data.code });
      
      if (!validation.isValid) {
        setServerError(validation.message);
        setIsSubmitting(false);
        return;
      }
      
      if (validation.isRedeemed) {
        setServerError('This AppSumo code has already been redeemed');
        setIsSubmitting(false);
        return;
      }
      
      // Check if the user has an existing subscription
      const subscriptionInfo = await appSumoService.getUserSubscriptionInfo(user.id);
      
      if (subscriptionInfo.hasSubscription) {
        // Store the code and subscription info for the confirmation dialog
        setPendingCode(data.code);
        setSubscriptionInfo(subscriptionInfo);
        setShowUpgradeDialog(true);
        setIsSubmitting(false);
        return;
      }
      
      // For new users without existing subscriptions, proceed with normal redemption
      const response = await authService.redeemAppSumoCode({
        code: data.code,
        userId: user.id,
      });

      setRedemptionResponse(response);

      if (response.success) {
        setRedemptionSuccess(true);
        
        // Call the success callback if provided
        if (onSuccess) {
          // Give the user a moment to see the success message
          setTimeout(() => {
            onSuccess(response);
          }, 2000);
        }
      } else {
        setServerError(response.message || 'Failed to redeem code');
      }
    } catch (error: any) {
      setServerError(error.message || 'An error occurred during code redemption. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Your Subscription</DialogTitle>
            <DialogDescription>
              You already have an active subscription. Would you like to upgrade to the AppSumo Lifetime Deal?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Subscription</h4>
                <p className="text-sm text-muted-foreground">
                  {subscriptionInfo?.subscriptionType === 'lifetime' 
                    ? 'You currently have a lifetime subscription.' 
                    : subscriptionInfo?.subscriptionType === 'annual'
                      ? 'You currently have an annual subscription.'
                      : 'You currently have a monthly subscription.'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Plan: {subscriptionInfo?.planType || 'Standard'}
                </p>
              </div>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowRight className="h-4 w-4 mr-1 text-primary" />
                  AppSumo Lifetime Deal Benefits
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Lifetime access with no recurring fees</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>All future updates included</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Premium support</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>All your existing data will be preserved</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your existing subscription will be replaced with the AppSumo Lifetime Deal. 
                    All your data and settings will be preserved during this upgrade.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpgradeCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpgradeConfirm}
              className="bg-primary"
            >
              Upgrade to Lifetime Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      
      {redemptionSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your AppSumo code has been successfully redeemed. Your account has been upgraded to the lifetime plan!
          </AlertDescription>
        </Alert>
      )}

      {!redemptionSuccess && (
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
                      placeholder="AS-XXXXXX" 
                      {...field} 
                      className="uppercase"
                      onChange={(e) => {
                        // Convert to uppercase as the user types
                        const value = e.target.value.toUpperCase();
                        field.onChange(value);
                        
                        // Validate code in real-time if it's long enough
                        if (value.length >= 8) {
                          validateCodeInRealTime(value);
                        }
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        // Also validate on blur for better UX
                        if (e.target.value.length >= 8) {
                          validateCodeInRealTime(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the code you received from AppSumo to activate your lifetime plan.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary" 
              disabled={isSubmitting}
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
          </form>
        </Form>
      )}

      {redemptionSuccess && redemptionResponse?.redemption && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="font-medium mb-2">Your {redemptionResponse.redemption.planType.charAt(0).toUpperCase() + redemptionResponse.redemption.planType.slice(1)} Plan Benefits:</h4>
          
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Plan successfully activated! You now have lifetime access.
            </p>
          </div>
          
          <ul className="space-y-2">
            {/* Base features that all plans have */}
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1" />
              <span>
                <span className="font-medium">Expense Tracking:</span> {' '}
                {redemptionResponse.redemption.features?.expenseLimit === 'unlimited' 
                  ? 'Unlimited expenses' 
                  : `Up to ${redemptionResponse.redemption.features?.expenseLimit} expenses`}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1" />
              <span>
                <span className="font-medium">AI Financial Advisor:</span> {' '}
                {redemptionResponse.redemption.features?.aiQueriesPerMonth === 'unlimited' 
                  ? 'Unlimited AI queries' 
                  : `${redemptionResponse.redemption.features?.aiQueriesPerMonth} AI queries per month`}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1" />
              <span>
                <span className="font-medium">Document Processing:</span> {' '}
                {redemptionResponse.redemption.features?.documentLimit === 'unlimited' 
                  ? 'Unlimited document processing' 
                  : `Up to ${redemptionResponse.redemption.features?.documentLimit} documents per month`}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1" />
              <span>
                <span className="font-medium">Support Level:</span> {' '}
                {redemptionResponse.redemption.features?.support === 'premium' 
                  ? 'Premium priority support' 
                  : redemptionResponse.redemption.features?.support === 'priority'
                    ? 'Priority support'
                    : 'Standard support'}
              </span>
            </li>
            
            {/* Advanced features based on plan */}
            {redemptionResponse.redemption.features?.advancedAnalytics && (
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-1" />
                <span>
                  <span className="font-medium">Advanced Analytics:</span> Detailed financial insights and reporting
                </span>
              </li>
            )}
            
            {redemptionResponse.redemption.features?.dataExport && (
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-1" />
                <span>
                  <span className="font-medium">Data Export:</span> Export your financial data in multiple formats
                </span>
              </li>
            )}
            
            {redemptionResponse.redemption.features?.apiAccess && (
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-1" />
                <span>
                  <span className="font-medium">API Access:</span> Connect with our API for custom integrations
                </span>
              </li>
            )}
            
            {redemptionResponse.redemption.features?.earlyAccess && (
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-1" />
                <span>
                  <span className="font-medium">Early Access:</span> Be the first to try new features
                </span>
              </li>
            )}
            
            {/* Always included features */}
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-1" />
              <span>
                <span className="font-medium">Future Updates:</span> Access to all future platform updates
              </span>
            </li>
          </ul>
          
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              You'll be redirected to your dashboard in a moment, where you can start using all these features.
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex items-center gap-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Preparing your dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}