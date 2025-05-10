import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { PLANS, formatPrice } from '@/config/pricing';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activePlan,
    planEndDate,
    trialEndsAt,
    isTrialActive,
    loading: subscriptionLoading,
    // cancelSubscription, // Placeholder for future implementation
    // deactivateTrial,    // Placeholder for future implementation
  } = useSubscription();
  const navigate = useNavigate();

  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isDeactivatingTrial, setIsDeactivatingTrial] = React.useState(false);

  const currentPlanDetails = activePlan ? PLANS.find(p => p.id === activePlan) : null;

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    toast({ title: 'Cancelling subscription...', description: 'This feature is not yet implemented.' });
    // try {
    //   await cancelSubscription();
    //   toast({ title: 'Subscription Cancelled', description: 'Your subscription has been cancelled.' });
    // } catch (error) {
    //   toast({ title: 'Error', description: 'Could not cancel subscription.', variant: 'destructive' });
    // }
    setIsCancelling(false);
  };

  const handleDeactivateTrial = async () => {
    setIsDeactivatingTrial(true);
    toast({ title: 'Deactivating trial...', description: 'This feature is not yet implemented.' });
    // try {
    //   await deactivateTrial();
    //   toast({ title: 'Trial Deactivated', description: 'Your trial has been deactivated.' });
    // } catch (error) {
    //   toast({ title: 'Error', description: 'Could not deactivate trial.', variant: 'destructive' });
    // }
    setIsDeactivatingTrial(false);
  };

  if (subscriptionLoading) {
    return <div className="container mx-auto p-4"><p>Loading billing information...</p></div>;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Billing Management</CardTitle>
          <CardDescription>Manage your subscription and billing details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPlanDetails && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Current Plan: {currentPlanDetails.name}</h3>
              <p>Price: {formatPrice(currentPlanDetails.basePrice)} / month</p>
              {isTrialActive && trialEndsAt && (
                <p className="text-green-600 font-semibold">Active Trial ends on: {new Date(trialEndsAt).toLocaleDateString()}</p>
              )}
              {planEndDate && !isTrialActive && (
                <p>Your current plan is active until: {new Date(planEndDate).toLocaleDateString()}</p>
              )}
              {!planEndDate && !isTrialActive && !activePlan && (
                <p>You do not have an active subscription.</p>
              )}
            </section>
          )}

          {!activePlan && !isTrialActive && (
            <section className="text-center py-4">
              <p className="mb-4">You don't have an active subscription or trial.</p>
              <Button onClick={() => navigate('/pricing')}>View Pricing Plans</Button>
            </section>
          )}
          
          {(activePlan || isTrialActive) && <Separator />}

          {isTrialActive && trialEndsAt && (
            <section>
              <h3 className="text-lg font-semibold mb-2">Manage Your Trial</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Your free trial for the {currentPlanDetails?.name || 'selected'} plan is active until {new Date(trialEndsAt).toLocaleDateString()}.
                You can deactivate it at any time.
              </p>
              <Button 
                variant="outline"
                onClick={handleDeactivateTrial} 
                disabled={isDeactivatingTrial || !isTrialActive}
              >
                {isDeactivatingTrial ? 'Deactivating...' : 'Deactivate Trial'}
              </Button>
            </section>
          )}

          {activePlan && !isTrialActive && planEndDate && (
             <section>
              <h3 className="text-lg font-semibold mb-2">Manage Your Subscription</h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Your subscription for the {currentPlanDetails?.name || 'current'} plan is active until {new Date(planEndDate).toLocaleDateString()}.
                If you cancel, your access will continue until this date, but it will not renew.
                (Note: Auto-renewal is not yet implemented, so cancellation currently means immediate plan removal for simplicity in this version).
              </p>
              <Button 
                variant="destructive"
                onClick={handleCancelSubscription} 
                disabled={isCancelling || !activePlan || isTrialActive}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </section>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            For changes to payment methods or detailed invoice history, please contact support (feature coming soon).
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BillingPage;
