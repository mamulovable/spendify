import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Infinity as InfinityIcon, 
  Clock, 
  CreditCard, 
  Zap, 
  Shield, 
  Gift, 
  BadgeCheck, 
  Sparkles
} from 'lucide-react';

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}

const BenefitCard = ({ icon: Icon, title, description, color, delay }: BenefitCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  // Color mapping for background and text colors
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
    cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/20", text: "text-cyan-600 dark:text-cyan-400" },
    green: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-600 dark:text-green-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
    red: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/20", text: "text-indigo-600 dark:text-indigo-400" },
    pink: { bg: "bg-pink-100 dark:bg-pink-900/20", text: "text-pink-600 dark:text-pink-400" },
    primary: { bg: "bg-primary/10", text: "text-primary" }
  };
  
  const colorClasses = colorMap[color] || colorMap.primary;
  
  return (
    <div
      className={cn(
        "transition-all duration-500 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
        "hover:scale-[1.03] hover:transition-transform hover:duration-200"
      )}
    >
      <Card className="h-full border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-4",
            colorClasses.bg
          )}>
            <Icon className={cn("w-6 h-6", colorClasses.text)} />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * ValuePropositionCards Component
 * 
 * Displays a grid of benefit cards highlighting the value proposition
 * of the AppSumo Lifetime Deal.
 */
const ValuePropositionCards = () => {
  const benefits: BenefitCardProps[] = [
    {
      icon: InfinityIcon,
      title: "Lifetime Access",
      description: "Pay once and get lifetime access to the platform with no recurring subscription fees ever.",
      color: "blue",
      delay: 100
    },
    {
      icon: Clock,
      title: "Future-Proof Investment",
      description: "Access to all future updates and improvements to the platform as they're released.",
      color: "cyan",
      delay: 200
    },
    {
      icon: CreditCard,
      title: "Massive Savings",
      description: "Save hundreds or even thousands of dollars compared to monthly subscription costs over time.",
      color: "green",
      delay: 300
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Redeem your code and get immediate access to all features included in your LTD plan.",
      color: "amber",
      delay: 400
    },
    {
      icon: Shield,
      title: "Risk-Free Purchase",
      description: "AppSumo's 60-day money-back guarantee ensures you can try the platform risk-free.",
      color: "red",
      delay: 500
    },
    {
      icon: Gift,
      title: "Exclusive LTD Bonuses",
      description: "Get special bonuses and features available only to AppSumo LTD customers.",
      color: "purple",
      delay: 600
    },
    {
      icon: BadgeCheck,
      title: "Premium Support",
      description: "Access to dedicated customer support to help you make the most of your investment.",
      color: "indigo",
      delay: 700
    },
    {
      icon: Sparkles,
      title: "No Feature Limitations",
      description: "Enjoy full access to all features without artificial limitations or paywalls.",
      color: "pink",
      delay: 800
    }
  ];

  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h2 
          className={cn(
            "text-3xl font-bold mb-4 transition-all duration-500 transform",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
          )}
        >
          Why Choose Our AppSumo Lifetime Deal?
        </h2>
        <p 
          className={cn(
            "text-muted-foreground max-w-2xl mx-auto transition-all duration-500 delay-200",
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          Get unbeatable value with our limited-time offer. One payment, lifetime access, and all the features you need to manage your finances effectively.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <BenefitCard key={index} {...benefit} />
        ))}
      </div>
      
      <div 
        className={cn(
          "mt-12 text-center transition-all duration-500 delay-1000",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Limited Time Offer:</span> This AppSumo deal is only available for a limited time. Act now to secure your lifetime access!
        </p>
      </div>
    </div>
  );
};

export default ValuePropositionCards;