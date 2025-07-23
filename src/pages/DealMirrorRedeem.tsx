import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Receipt, ArrowRight, CheckCircle, Gift, ChevronRight, ArrowUp, LogIn, UserPlus, Infinity, Rocket, Headphones, Star, Maximize, ChevronDown } from 'lucide-react';
import ExpenseTrackingDemo from '@/components/features/ExpenseTrackingDemo';
import AIAdvisorDemo from '@/components/features/AIAdvisorDemo';
import BudgetManagementDemo from '@/components/features/BudgetManagementDemo';
import AnalyticsDashboardDemo from '@/components/features/AnalyticsDashboardDemo';
import DocumentProcessingDemo from '@/components/features/DocumentProcessingDemo';
import PlanComparisonTable from '@/components/features/PlanComparisonTable';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { SignInForm } from '@/components/auth/SignInForm';
import { LTDPlanSelection, LTDPlanType } from '@/components/auth/LTDPlanSelection';
import { EnhancedCodeRedemptionForm } from '@/components/auth/EnhancedCodeRedemptionForm';
import { useAuth } from '@/contexts/AuthContext';
import { DEALMIRROR_BRANDING } from '@/config/platformBranding';
import { cn } from '@/lib/utils';

/**
 * FAQ Item Component
 * 
 * Expandable FAQ item with proper accessibility
 */
interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-muted-foreground">
          {typeof answer === 'string' ? (
            <p>{answer}</p>
          ) : (
            <div>{answer}</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * DealMirror LTD Redemption Landing Page
 * 
 * This page serves as the landing page for DealMirror customers to:
 * - Learn about SpendlyAI features through interactive visualizations
 * - Understand LTD benefits
 * - Register for an account
 * - Redeem their DealMirror codes
 * 
 * Requirements:
 * - 1.1: Display dedicated DealMirror LTD landing page at /dealmirror
 * - 1.2: Show DealMirror-specific branding and messaging
 * - 5.1: Display "DealMirror Exclusive Lifetime Deal" branding
 * - 5.2: Show DealMirror-specific messaging in hero section
 */
const DealMirrorRedeem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAppSumoUser } = useAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeButton, setActiveButton] = useState<'register' | 'signin' | null>(null);
  
  // Enhanced authentication flow state
  const [currentStep, setCurrentStep] = useState<'auth' | 'plan-selection' | 'code-redemption'>('auth');
  const [selectedPlan, setSelectedPlan] = useState<LTDPlanType | null>(null);
  
  // Get DealMirror branding configuration
  const branding = DEALMIRROR_BRANDING;
  
  // Smooth scroll to section function
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      // Add a small delay to ensure the page is fully loaded
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);
  
  // Handle successful authentication (registration or sign-in)
  const handleAuthSuccess = useCallback(() => {
    setCurrentStep('plan-selection');
    scrollToSection('#redeem');
  }, [scrollToSection]);
  
  // Handle plan selection
  const handlePlanSelect = useCallback((planId: LTDPlanType) => {
    setSelectedPlan(planId);
    setCurrentStep('code-redemption');
  }, []);
  
  // Handle going back to plan selection
  const handleBackToPlanSelection = useCallback(() => {
    setCurrentStep('plan-selection');
    setSelectedPlan(null);
  }, []);
  
  // Handle successful code redemption
  const handleRedemptionSuccess = useCallback(() => {
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  }, [navigate]);
  
  // Scroll to section on hash change or initial load
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        // Add a small delay to ensure the page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          
          // Set active button based on hash
          if (location.hash === '#register') {
            setActiveButton('register');
          } else if (location.hash === '#signin') {
            setActiveButton('signin');
          }
        }, 100);
      }
    } else {
      // Scroll to top when no hash is present
      window.scrollTo(0, 0);
    }
  }, [location.hash]);
  
  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle button click with visual feedback
  const handleButtonClick = useCallback((buttonType: 'register' | 'signin', sectionId: string) => {
    setActiveButton(buttonType);
    scrollToSection(sectionId);
    
    // Reset active state after animation completes
    setTimeout(() => {
      setActiveButton(null);
    }, 500);
  }, [scrollToSection]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* DealMirror Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm">
        <Container>
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-4 w-4" />
            <span>{branding.messaging.banner}</span>
          </div>
        </Container>
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/30 py-2 border-b">
        <Container>
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
            <span className="font-medium">{branding.breadcrumb}</span>
          </nav>
        </Container>
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -left-24 w-48 h-48 border border-primary/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 border border-primary/10 rounded-full"></div>
        
        <Container className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-pulse">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                {branding.messaging.hero.badge}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {branding.messaging.hero.title.split(branding.messaging.hero.subtitle)[0]}
                <span className="text-primary">{branding.messaging.hero.subtitle}</span>
                {branding.messaging.hero.title.split(branding.messaging.hero.subtitle)[1]}
              </h1>
              <p className="text-xl text-muted-foreground">
                {branding.messaging.hero.description}
              </p>
              <div className="pt-2">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>No monthly fees</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>All future updates</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    <span>Premium support</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className={cn(
                    "gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300",
                    activeButton === 'register' && "scale-[0.98] opacity-90"
                  )}
                  onClick={() => handleButtonClick('register', '#register')}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Register Now
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={cn(
                    "border-primary/20 hover:bg-primary/5 transition-all duration-300",
                    activeButton === 'signin' && "scale-[0.98] bg-primary/5"
                  )}
                  onClick={() => handleButtonClick('signin', '#signin')}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Already Registered? Sign In
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl shadow-lg flex items-center justify-center overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
                
                {/* Hero visualization */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
                  <div className="w-full max-w-md bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <span className="font-medium">SpendlyAI Dashboard</span>
                      </div>
                      <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {branding.messaging.exclusiveBadges.lifetime}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-2 bg-primary/20 rounded-full w-3/4"></div>
                      <div className="h-2 bg-primary/15 rounded-full w-full"></div>
                      <div className="h-2 bg-primary/10 rounded-full w-5/6"></div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-16 bg-primary/10 rounded-md"></div>
                      <div className="h-16 bg-primary/15 rounded-md"></div>
                      <div className="h-16 bg-primary/10 rounded-md"></div>
                    </div>
                    
                    <div className="mt-4 flex justify-center">
                      <div className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                        {branding.messaging.exclusiveBadges.hero}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Animated elements */}
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/30 animate-pulse"></div>
                <div className="absolute bottom-6 left-6 h-4 w-4 rounded-full bg-primary/20 animate-ping"></div>
              </div>
              
              {/* Feature badges */}
              <div className="hidden md:flex absolute -bottom-4 -right-4 bg-background shadow-lg rounded-lg px-3 py-2 border border-border">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{branding.messaging.exclusiveBadges.feature}</span>
                </div>
              </div>
              <div className="hidden md:flex absolute -top-4 -left-4 bg-background shadow-lg rounded-lg px-3 py-2 border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Lifetime Deal</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-30 w-full bg-background/95 backdrop-blur-sm border-b">
        <Container>
          <nav className="flex space-x-4 overflow-x-auto py-4 scrollbar-hide">
            <a href="#features" className="text-sm font-medium text-primary border-b-2 border-primary px-3 py-2 whitespace-nowrap">Features</a>
            <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 whitespace-nowrap">LTD Benefits</a>
            <a href="#register" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 whitespace-nowrap">Register</a>
            <a href="#redeem" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 whitespace-nowrap">Redeem Code</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 whitespace-nowrap">FAQ</a>
          </nav>
        </Container>
      </div>

      {/* Feature Showcase Section */}
      <section id="features" className="py-16 bg-muted/50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Experience SpendlyAI Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive demonstrations of our powerful features will be displayed here.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Expense Tracking Demo - Interactive Component */}
            <div className="lg:col-span-2 row-span-2">
              <ExpenseTrackingDemo />
            </div>
            
            {/* AI Financial Advisor Demo - Interactive Component */}
            <div className="row-span-2">
              <AIAdvisorDemo />
            </div>
            
            {/* Budget Management Demo - Interactive Component */}
            <div className="lg:col-span-2">
              <BudgetManagementDemo />
            </div>
            
            {/* Analytics Dashboard Demo - Interactive Component */}
            <div className="lg:col-span-2">
              <AnalyticsDashboardDemo />
            </div>
            
            {/* Document Processing Demo - Interactive Component */}
            <div className="lg:col-span-2">
              <DocumentProcessingDemo />
            </div>
            
            {/* Other feature cards */}
            <div className="bg-background rounded-lg p-6 shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="h-40 bg-primary/10 rounded-md mb-4 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Feature Visualization</p>
              </div>
              <h3 className="text-xl font-medium mb-2">Financial Goals</h3>
              <p className="text-muted-foreground">
                Set and track progress towards your financial goals.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* LTD Benefits Section */}
      <section id="benefits" className="py-16">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{branding.messaging.benefits.title}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {branding.messaging.benefits.description}
            </p>
          </div>
          
          {/* Plan Comparison Table */}
          <div className="mb-8">
            <PlanComparisonTable />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Lifetime Access",
                description: "One-time payment for permanent access to SpendlyAI with no recurring fees ever.",
                icon: "infinity",
                color: "bg-blue-500/10 text-blue-500",
                delay: 0
              },
              {
                title: "Future-Proof Investment",
                description: "Get access to all future updates and improvements at no additional cost.",
                icon: "rocket",
                color: "bg-purple-500/10 text-purple-500",
                delay: 100
              },
              {
                title: "Premium Support",
                description: "Enjoy dedicated customer support with priority response times.",
                icon: "headphones",
                color: "bg-green-500/10 text-green-500",
                delay: 200
              },
              {
                title: "Early Feature Access",
                description: "Be the first to try new features before they're released to regular subscribers.",
                icon: "star",
                color: "bg-amber-500/10 text-amber-500",
                delay: 300
              },
              {
                title: "Higher Usage Limits",
                description: "Enjoy generous usage limits for all features compared to regular subscription plans.",
                icon: "maximize",
                color: "bg-indigo-500/10 text-indigo-500",
                delay: 400
              },
              {
                title: `Exclusive ${branding.name} Bonuses`,
                description: `Special perks and bonuses available only to ${branding.name} LTD customers.`,
                icon: "gift",
                color: "bg-pink-500/10 text-pink-500",
                delay: 500
              }
            ].map((benefit, i) => (
              <div 
                key={i} 
                className="group bg-background rounded-lg p-6 shadow-sm border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                style={{ animationDelay: `${benefit.delay}ms` }}
              >
                {/* Background decoration */}
                <div className="absolute -right-6 -top-6 w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-transparent group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute -left-6 -bottom-6 w-12 h-12 rounded-full bg-gradient-to-tr from-primary/5 to-transparent group-hover:scale-150 transition-transform duration-500"></div>
                
                {/* Icon */}
                <div className={`h-12 w-12 rounded-full ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon === "infinity" && <Infinity className="h-6 w-6" />}
                  {benefit.icon === "rocket" && <Rocket className="h-6 w-6" />}
                  {benefit.icon === "headphones" && <Headphones className="h-6 w-6" />}
                  {benefit.icon === "star" && <Star className="h-6 w-6" />}
                  {benefit.icon === "maximize" && <Maximize className="h-6 w-6" />}
                  {benefit.icon === "gift" && <Gift className="h-6 w-6" />}
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20 text-center">
            <h3 className="text-xl font-medium mb-3">{branding.messaging.benefits.cta.title}</h3>
            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
              {branding.messaging.benefits.cta.description}
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group"
              onClick={() => scrollToSection('#register')}
            >
              <Gift className="h-4 w-4 mr-2 group-hover:animate-bounce" />
              {branding.messaging.benefits.cta.button}
            </Button>
          </div>
        </Container>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-16 bg-muted/50">
        <Container>
          <div className="max-w-md mx-auto bg-background rounded-lg p-8 shadow-sm border border-border/50">
            <h2 className="text-2xl font-bold mb-6 text-center">Register Your Account</h2>
            <p className="text-center text-muted-foreground mb-6">
              Create your SpendlyAI account to redeem your {branding.name} code.
            </p>
            <RegistrationForm 
              onSuccess={handleAuthSuccess}
              onSignInClick={() => handleButtonClick('signin', '#signin')}
            />
          </div>
        </Container>
      </section>

      {/* Sign In Section */}
      <section id="signin" className="py-16">
        <Container>
          <div className="max-w-md mx-auto bg-background rounded-lg p-8 shadow-sm border border-border/50">
            <h2 className="text-2xl font-bold mb-6 text-center">Sign In to Your Account</h2>
            <p className="text-center text-muted-foreground mb-6">
              Sign in to your existing account to redeem your {branding.name} code.
            </p>
            <SignInForm 
              onSuccess={handleAuthSuccess}
              onRegisterClick={() => handleButtonClick('register', '#register')}
            />
          </div>
        </Container>
      </section>

      {/* Code Redemption Section - Enhanced Flow */}
      <section id="redeem" className="py-16">
        <Container>
          <div className="max-w-2xl mx-auto bg-background rounded-lg p-8 shadow-sm border border-border/50">
            {!user && (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Get Started with Your {branding.name} Deal</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be signed in to redeem your {branding.name} code.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => scrollToSection('#register')}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => scrollToSection('#signin')}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </div>
              </div>
            )}
            
            {user && isAppSumoUser && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="text-xl font-medium text-green-800 mb-2">{branding.name} Code Already Redeemed</h3>
                <p className="text-green-700 mb-4">
                  Your account is already activated with a {branding.name} lifetime plan.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
            
            {user && !isAppSumoUser && (
              <>
                {/* Plan Selection Step */}
                {currentStep === 'plan-selection' && (
                  <LTDPlanSelection
                    onPlanSelect={handlePlanSelect}
                    isLoading={false}
                  />
                )}
                
                {/* Enhanced Code Redemption Step */}
                {currentStep === 'code-redemption' && selectedPlan && (
                  <EnhancedCodeRedemptionForm
                    selectedPlan={selectedPlan}
                    onSuccess={handleRedemptionSuccess}
                    onBack={handleBackToPlanSelection}
                    source="dealmirror"
                  />
                )}
                
                {/* Fallback to old flow if user is authenticated but currentStep is 'auth' */}
                {currentStep === 'auth' && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
                    <p className="text-muted-foreground mb-6">
                      Select your {branding.name} LTD plan to get started.
                    </p>
                    <Button 
                      onClick={() => setCurrentStep('plan-selection')}
                      className="bg-primary text-primary-foreground"
                    >
                      Choose Your Plan
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-muted/50">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Common questions about the {branding.name} deal and redemption process.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: `What is the ${branding.name} lifetime deal?`,
                answer: `The ${branding.name} lifetime deal gives you permanent access to SpendlyAI with no recurring fees. Pay once and use SpendlyAI forever, including all future updates and improvements.`
              },
              {
                question: 'How do I redeem my code?',
                answer: `First, create an account or sign in to your existing account. Then select your plan type and enter your ${branding.name} code. The system will validate your code and activate your lifetime subscription immediately.`
              },
              {
                question: 'What if my code doesn\'t work?',
                answer: branding.support.helpText.map((text, i) => (
                  <div key={i} className="mb-2">• {text}</div>
                ))
              },
              {
                question: 'Can I upgrade my plan later?',
                answer: 'Your lifetime deal includes all the features of your selected plan forever. If you need additional features, you can contact support to discuss upgrade options.'
              },
              {
                question: 'What happens to my data if I already have an account?',
                answer: 'All your existing data, including expenses, budgets, and settings, will be preserved when you upgrade to the lifetime plan. Nothing will be lost during the redemption process.'
              },
              {
                question: 'Do I get future updates?',
                answer: 'Yes! Your lifetime deal includes all future updates, new features, and improvements to SpendlyAI at no additional cost.'
              },
              {
                question: 'What kind of support do I get?',
                answer: `As a ${branding.name} lifetime customer, you get priority support with faster response times. You can contact our support team through the in-app help system or email.`
              },
              {
                question: 'Can I use SpendlyAI on multiple devices?',
                answer: 'Yes, you can access SpendlyAI from any device with a web browser. Your data syncs automatically across all your devices.'
              },
              {
                question: 'Is there a money-back guarantee?',
                answer: `The money-back guarantee is handled by ${branding.name}. Please refer to ${branding.name}'s refund policy for details about returns and refunds.`
              },
              {
                question: 'How do I get help if I have issues?',
                answer: branding.support.contactInfo
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </Container>
      </section>
      
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default DealMirrorRedeem;