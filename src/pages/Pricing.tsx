import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown } from 'lucide-react';
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
  const { activePlan, updateSubscription } = useSubscription();
  const [selectedDuration, setSelectedDuration] = useState<PlanDuration>(DURATIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

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

    // If it's the current plan, don't do anything
    if (activePlan === plan.id) {
      toast({
        title: "Current Plan",
        description: "You are already subscribed to this plan.",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Initialize payment
      initializePayment(
        plan,
        selectedDuration,
        user.email,
        {
          user_id: user.id,
          user_email: user.email,
        },
        async (reference) => {
          try {
            console.log('Payment successful, updating subscription...');
            // Payment successful, update subscription
            await updateSubscription(plan.id);
            toast({
              title: "Payment Successful",
              description: "Your subscription has been activated.",
            });
            // Wait a moment before redirecting to ensure the subscription is updated
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } catch (error) {
            console.error('Subscription update failed:', error);
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
          // Payment window closed
          console.log('Payment window closed by user');
          setIsProcessing(false);
          toast({
            title: "Payment Cancelled",
            description: "You can try again when you're ready.",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
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

              <Button
                className="w-full"
                size="lg"
                variant={isCurrentPlan ? "secondary" : "default"}
                onClick={() => handleSubscribe(plan)}
                disabled={isProcessing || isCurrentPlan}
              >
                {isProcessing ? "Processing..." : 
                 isCurrentPlan ? "Current Plan" : "Get Started"}
              </Button>
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