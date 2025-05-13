import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PLANS, DURATIONS, Plan, PlanDuration, calculatePrice, formatPrice } from '@/config/pricing';
import { initializePayment } from '@/services/paystackService';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Dashboard from '@/pages/Dashboard';

export default function Pricing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { activePlan, trialEndsAt, trialType, cardAdded, updateSubscription, loading: subscriptionLoading } = useSubscription();
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>(DURATIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTrialWithCard = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or sign up to start a trial.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (isProcessing || subscriptionLoading) return;

    setIsProcessing(true);
    try {
      // Initialize payment to verify card (amount = 0)
      await initializePayment(
        plan,
        DURATIONS[0], // Monthly duration for card verification
        user.email!,
        { user_id: user.id, user_email: user.email!, is_card_verification: 'true' },
        async (reference) => {
          try {
            // Card verification successful, start 30-day trial
            await updateSubscription(plan.id, { isTrialStart: true, withCard: true });
            toast({
              title: "30-day Trial Started!",
              description: `Your card has been verified (₦100 hold will be refunded) and your 30-day trial for the ${plan.name} plan has begun.`,
              duration: 5000,
            });
            setTimeout(() => navigate('/dashboard'), 1500);
          } catch (error) {
            console.error('Trial start failed:', error);
            toast({
              title: "Trial Start Failed",
              description: error instanceof Error ? error.message : "Could not start your trial. Please try again or contact support.",
              variant: "destructive",
            });
          }
        },
        () => {
          toast({
            title: "Card Verification Cancelled",
            description: "You can still start a 7-day trial without card verification, or try again to get 30 days. Note that a ₦100 hold will be placed on your card for verification.",
          });
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('Card verification failed:', error);
      toast({
        title: "Card Verification Failed",
        description: error instanceof Error ? error.message : "Could not verify your card. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or sign up to subscribe to a plan.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (isProcessing || subscriptionLoading) return;

    const isUserOnActiveTrial = trialEndsAt && trialEndsAt > new Date();
    const isSelectedPlanTheCurrentActivePlan = activePlan === plan.id;

    // Scenario 1: User is already on the selected plan as a paid subscriber (not a trial).
    if (isSelectedPlanTheCurrentActivePlan && activePlan && !isUserOnActiveTrial) {
        toast({ title: "Current Plan", description: "You are already subscribed to this plan." });
        return;
    }

    // Scenario 2: Determine if we should attempt to start a new trial for the selected plan.
    // A new trial is only offered if the user has no existing active plan (paid or trial).
    let attemptNewTrial = false;
    if (!activePlan) { // No plan at all, user is completely free.
        attemptNewTrial = true;
    } else if (isUserOnActiveTrial) {
        // User is on an active trial. Clicking any plan means they intend to pay, not start another trial.
        attemptNewTrial = false; 
    } else { // User has an active *paid* plan.
        attemptNewTrial = false; // Cannot start a new trial if already on a paid plan.
    }

    if (attemptNewTrial) {
        setIsProcessing(true);
        try {
            await updateSubscription(plan.id, { isTrialStart: true, withCard: false }); // 7-day trial without card
            toast({
                title: "Trial Started!",
                description: `Your 7-day free trial for the ${plan.name} plan has begun. Add your card anytime to extend to 30 days!`,
                duration: 6000,
            });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error('Trial start failed:', error);
            toast({
                title: "Trial Start Failed",
                description: error instanceof Error ? error.message : "Could not start your trial. Please try again or contact support.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    } else {
        // Scenario 3: Proceed to payment for the selected plan.
        // This covers: Converting an active trial (for this plan or another) to this paid plan,
        // switching from one paid plan to another, or subscribing after a trial has expired.
        setIsProcessing(true);
        try {
            if (isUserOnActiveTrial) {
                const currentTrialPlanName = PLANS.find(p => p.id === activePlan)?.name || activePlan || "your current plan";
                if (isSelectedPlanTheCurrentActivePlan) {
                    toast({
                        title: "Activating Full Subscription",
                        description: `Your trial for ${currentTrialPlanName} will end, and you'll start a paid subscription.`,                        
                        duration: 7000
                    });
                } else {
                    toast({
                        title: "Switching Subscription",
                        description: `Your trial for ${currentTrialPlanName} will end. You're starting a paid subscription for ${plan.name}.`,
                        duration: 7000
                    });
                }
            }
            
            initializePayment(
                plan,
                selectedDuration,
                user.email!, 
                { user_id: user.id, user_email: user.email! },
                async (reference) => { // onSuccess callback
                    try {
                        console.log('Payment successful, reference:', reference, 'Updating subscription...');
                        await updateSubscription(plan.id, { isTrialStart: false }); // Start paid subscription
                        toast({
                            title: "Payment Successful",
                            description: "Your subscription has been activated.",
                        });
                        setTimeout(() => navigate('/dashboard'), 1000);
                    } catch (error) {
                        console.error('Subscription update failed post-payment:', error);
                        toast({
                            title: "Subscription Update Failed",
                            description: "Payment was successful but subscription update failed. Please contact support.",
                            variant: "destructive",
                        });
                    } finally {
                         // setIsProcessing(false); // Will be set by the outer finally or onClosed
                    }
                },
                () => { // onClosed callback (payment window closed by user)
                    console.log('Payment window closed by user');
                    toast({
                        title: "Payment Cancelled",
                        description: "You chose to cancel the payment. You can subscribe anytime!",
                        variant: "default",
                    });
                    setIsProcessing(false); // Ensure processing is reset here
                }
            );
        } catch (error) {
            console.error('Payment initialization failed:', error);
            toast({
                title: "Payment Error",
                description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
                variant: "destructive",
            });
            setIsProcessing(false); // Ensure processing is reset on payment init error
        }
        // setIsProcessing(false) generally handled by callbacks now, but if initPayment itself is synchronous and fails, it's caught.
        // If initializePayment doesn't throw for all its failure modes and doesn't call a callback, then setIsProcessing(false) might need to be here too.
        // For now, assuming callbacks or catch will handle it.
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start with a 7-day free trial. Cancel anytime. No credit card required for trial.
        </p>
        {activePlan && (
          <div className="mt-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              <Crown className="w-5 h-5 mr-2 inline-block" />
              Current Plan: {PLANS.find(p => p.id === activePlan)?.name || activePlan}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue={selectedDuration.months.toString()} className="w-full max-w-xs">
          <TabsList className="grid w-full grid-cols-3">
            {DURATIONS.map((duration) => (
              <TabsTrigger
                key={duration.months}
                value={duration.months.toString()}
                onClick={() => setSelectedDuration(duration)}
                className="text-sm"
              >
                {duration.months === 1 ? 'Monthly' : 
                 duration.months === 6 ? '6 Months' : 'Yearly'}
                {duration.discount > 0 && (
                  <span className="ml-1 text-xs text-green-600">
                    -{duration.discount * 100}%
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLANS.map((plan) => {
          const price = calculatePrice(plan, selectedDuration);
          const monthlyPrice = price / selectedDuration.months;
          const isCurrentPlan = activePlan === plan.id;

          return (
            <Card key={plan.id} className={`relative p-6 flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
              {plan.badge && (
                <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                  {plan.badge}
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute top-0 left-0 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                  Current Plan
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold">
                  {formatPrice(monthlyPrice)}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
                {selectedDuration.months > 1 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatPrice(price)} billed every {selectedDuration.months} months
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-4 mb-6">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "Login Required",
                        description: "Please login or sign up to buy a plan.",
                        variant: "destructive",
                      });
                      navigate('/login');
                      return;
                    }
                    setIsProcessing(true);
                    initializePayment(
                      plan,
                      selectedDuration,
                      user.email!,
                      { user_id: user.id, user_email: user.email! },
                      async (reference) => {
                        try {
                          await updateSubscription(plan.id, { isTrialStart: false });
                          toast({
                            title: "Payment Successful",
                            description: "Your subscription has been activated.",
                          });
                          setTimeout(() => navigate('/dashboard'), 1000);
                        } catch (error) {
                          toast({
                            title: "Subscription Update Failed",
                            description: "Payment was successful but subscription update failed. Please contact support.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsProcessing(false);
                        }
                      },
                      () => {
                        toast({
                          title: "Payment Cancelled",
                          description: "You chose to cancel the payment. You can subscribe anytime!",
                          variant: "default",
                        });
                        setIsProcessing(false);
                      }
                    );
                  }}
                  className="w-full"
                  disabled={isProcessing || subscriptionLoading}
                  variant="default"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    `Buy Now (${formatPrice(monthlyPrice)}/mo)`
                  )}
                </Button>
                {!user ? (
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full"
                    disabled={isProcessing || subscriptionLoading}
                  >
                    Login to Start Trial
                  </Button>
                ) : !activePlan ? (
                  <>
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      className="w-full"
                      disabled={isProcessing || subscriptionLoading}
                      variant="outline"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        'Start 7-day Trial'
                      )}
                    </Button>
                    <div>
                      <Button
                        onClick={() => handleTrialWithCard(plan)}
                        className="w-full"
                        disabled={isProcessing || subscriptionLoading}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          'Get 30-day Trial (Verify Card - ₦100 hold)'
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        We'll place a ₦100 hold on your card for verification. This amount will be refunded.
                      </p>
                    </div>
                  </>
                ) : trialEndsAt && trialType === 'seven_day' && !cardAdded ? (
                  <>
                    <div>
                      <Button
                        onClick={() => handleTrialWithCard(plan)}
                        className="w-full"
                        disabled={isProcessing || subscriptionLoading}
                        variant="outline"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing
                          </>
                        ) : (
                          'Extend to 30 Days (Verify Card - ₦100 hold)'
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        We'll place a ₦100 hold on your card for verification. This amount will be refunded.
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      className="w-full"
                      disabled={isProcessing || subscriptionLoading}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        `Subscribe Now ${formatPrice(monthlyPrice)}/mo`
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    className="w-full"
                    disabled={isProcessing || subscriptionLoading || isCurrentPlan}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      `Subscribe ${formatPrice(monthlyPrice)}/mo`
                    )}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

        <div className="mt-12 text-center">
            <p className="text-muted-foreground">
                All plans include a 7-day free trial. Cancel anytime during the trial period.
                <br />
                Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact our team</a>
            </p>
        </div>
    </div>
);

  return <Dashboard>{content}</Dashboard>;
}