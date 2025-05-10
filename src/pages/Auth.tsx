import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, OnboardingAnswers } from '@/contexts/AuthContext'; 
import { useSubscription } from '@/contexts/SubscriptionContext'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast'; 

// Import Onboarding Steps
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3';
import OnboardingStepPlanSelection from '@/components/onboarding/OnboardingStepPlanSelection'; 
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4'; 

const TOTAL_ONBOARDING_STEPS = 5; 

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, updateUserOnboardingData, user } = useAuth(); 
  const { updateSubscription } = useSubscription(); 
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding State
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0); 
  const [onboardingAnswers, setOnboardingAnswers] = useState<Partial<OnboardingAnswers>>({}); 
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const signedUpUser = await signUp(email, password); 
      if (signedUpUser) {
        setCurrentOnboardingStep(1);
        toast({
          title: "Account Created!",
          description: "Please check your email to verify. Let's personalize your experience.",
        });
      } 
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentOnboardingStep < TOTAL_ONBOARDING_STEPS) {
        setCurrentOnboardingStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentOnboardingStep > 1) {
        setCurrentOnboardingStep(prev => prev - 1);
    }
  };

  const updateOnboardingData = (newData: Partial<OnboardingAnswers>) => {
    setOnboardingAnswers(prev => ({ ...prev, ...newData }));
  };

  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    try {
      await updateUserOnboardingData(onboardingAnswers as OnboardingAnswers); 

      // Start the trial for the selected plan
      if (onboardingAnswers.selectedPlanId) {
        await updateSubscription(onboardingAnswers.selectedPlanId, true); 
        toast({ 
          title: "Free Trial Started!",
          description: `Your 7-day trial for the selected plan has begun.`,
        });
      } else {
        toast({
          title: "Onboarding Complete",
          description: "Your preferences are saved. No trial plan was selected.",
          variant: "default"
        });
      }
      navigate(from, { replace: true }); 
    } catch (error) {
      console.error('Failed to save onboarding data or start trial:', error);
      toast({
        title: "Error",
        description: "Could not complete onboarding or start trial. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentOnboardingStep(0); 
      setOnboardingAnswers({});
    }
  };
  
  useEffect(() => {
    if (user && currentOnboardingStep === 0) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, currentOnboardingStep]);

  if (currentOnboardingStep > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 pt-20 md:pt-4">
        {currentOnboardingStep === 1 && (
          <OnboardingStep1 
            onNext={handleNextStep} 
            setData={updateOnboardingData} 
            currentData={{ documentTypes: onboardingAnswers.documentTypes || '' }} 
            totalSteps={TOTAL_ONBOARDING_STEPS}
            currentStepNumber={1}
          />
        )}
        {currentOnboardingStep === 2 && (
          <OnboardingStep2 
            onNext={handleNextStep} 
            onPrevious={handlePreviousStep} 
            setData={updateOnboardingData} 
            currentData={{ mainGoal: onboardingAnswers.mainGoal || '' }} 
            totalSteps={TOTAL_ONBOARDING_STEPS}
            currentStepNumber={2}
          />
        )}
        {currentOnboardingStep === 3 && (
          <OnboardingStep3 
            onNext={handleNextStep} 
            onPrevious={handlePreviousStep} 
            setData={updateOnboardingData} 
            currentData={{ analysisFrequency: onboardingAnswers.analysisFrequency || '' }} 
            totalSteps={TOTAL_ONBOARDING_STEPS}
            currentStepNumber={3}
          />
        )}
        {currentOnboardingStep === 4 && ( 
          <OnboardingStepPlanSelection
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            setData={updateOnboardingData}
            currentData={{ selectedPlanId: onboardingAnswers.selectedPlanId }}
            totalSteps={TOTAL_ONBOARDING_STEPS}
            currentStepNumber={4}
          />
        )}
        {currentOnboardingStep === 5 && ( 
          <OnboardingStep4 
            onFinish={handleFinishOnboarding} 
            onPrevious={handlePreviousStep} 
            setData={updateOnboardingData} 
            currentData={{ interestedTools: onboardingAnswers.interestedTools || [] }} 
            totalSteps={TOTAL_ONBOARDING_STEPS}
            currentStepNumber={5}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-md mx-auto pt-32 px-6 pb-20">
        <Link to="/" className="flex items-center text-muted-foreground mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="w-full animate-scale-in">
          <CardHeader>
            <CardTitle>Welcome to Spendify Guru</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to start analyzing your statements
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input 
                      id="email-signin" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">Password</Label>
                    <Input 
                      id="password-signin" 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || currentOnboardingStep > 0}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input 
                      id="email-signup" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input 
                      id="password-signup" 
                      type="password" 
                      placeholder="•••••••• (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      autoComplete="new-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || currentOnboardingStep > 0}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
