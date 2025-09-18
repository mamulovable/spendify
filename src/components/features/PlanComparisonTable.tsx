import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, Sparkles, Star, Clock, Gift, ChevronDown, ChevronUp } from 'lucide-react';

// Define plan types and features
type PlanType = 'regular' | 'ltd';
type PlanTier = 'basic' | 'premium' | 'ultimate';

interface PlanFeature {
  name: string;
  description?: string;
  tiers: {
    basic: boolean | string | number;
    premium: boolean | string | number;
    ultimate: boolean | string | number;
  };
}

interface PlanPricing {
  regular: {
    basic: { monthly: number; yearly: number };
    premium: { monthly: number; yearly: number };
    ultimate: { monthly: number; yearly: number };
  };
  ltd: {
    basic: number;
    premium: number;
    ultimate: number;
  };
}

// Define plan features
const planFeatures: PlanFeature[] = [
    {
        name: 'Upload statements per month',
        tiers: { basic: '80', premium: '200', ultimate: 'Unlimited' }
    },
    {
        name: 'AI Transaction Categorization',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Saved Analyses',
        tiers: { basic: '20', premium: '50', ultimate: 'Unlimited' }
    },
    {
        name: 'AI Financial Insights',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Budget Comparison Tool',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Saved Analyses Archive',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Chart Visualizations',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Goal Setting',
        tiers: { basic: true, premium: true, ultimate: true }
    },
    {
        name: 'Full budgeting & analytics access',
        tiers: { basic: false, premium: true, ultimate: true }
    },
    {
        name: 'Custom Categories',
        tiers: { basic: false, premium: true, ultimate: true }
    },
    {
        name: 'AI Financial Advisor',
        description: 'Get personalized financial advice',
        tiers: { basic: false, premium: true, ultimate: true }
    },
    {
        name: 'AI Advisor Queries',
        tiers: { basic: false, premium: '10', ultimate: 'Unlimited' }
    },
    {
        name: 'Priority feature requests & roadmap access',
        tiers: { basic: false, premium: false, ultimate: true }
    },
];

// Define plan pricing
const planPricing: PlanPricing = {
  regular: {
    basic: { monthly: 9, yearly: 90 },
    premium: { monthly: 15, yearly: 150 },
    ultimate: { monthly: 49, yearly: 490 },
  },
  ltd: {
    basic: 59,
    premium: 89,
    ultimate: 299,
  },
};

// Calculate savings
const calculateSavings = (planType: PlanType, tier: PlanTier): string => {
  if (planType === 'ltd') {
    const regularYearlyPrice = planPricing.regular[tier].yearly;
    const ltdPrice = planPricing.ltd[tier];
    const firstYearSavings = regularYearlyPrice - ltdPrice;
    const lifetimeSavings = `${firstYearSavings}+ (lifetime)`;
    return lifetimeSavings;
  }
  return '0';
};

/**
 * PlanComparisonTable Component
 * 
 * A responsive table that compares LTD plans with regular subscription plans,
 * highlighting the advantages of the LTD offers.
 */
const PlanComparisonTable = () => {
  const [planType, setPlanType] = useState<PlanType>('ltd');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  // Toggle between LTD and regular plans
  const togglePlanType = () => {
    setPlanType(planType === 'ltd' ? 'regular' : 'ltd');
  };

  // Toggle billing cycle (only for regular plans)
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  // Toggle expanded features
  const toggleExpandedFeatures = () => {
    setExpandedFeatures(!expandedFeatures);
  };

  // Determine which features to show based on expanded state
  const visibleFeatures = expandedFeatures 
    ? planFeatures 
    : planFeatures.slice(0, 6);

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium">Plan Comparison</h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-full p-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full text-xs px-3 py-1 h-auto",
                  planType === 'ltd' && "bg-primary text-primary-foreground"
                )}
                onClick={() => setPlanType('ltd')}
              >
                <Gift className="h-3 w-3 mr-1" />
                Lifetime plan LTD
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full text-xs px-3 py-1 h-auto",
                  planType === 'regular' && "bg-primary text-primary-foreground"
                )}
                onClick={() => setPlanType('regular')}
              >
                <Clock className="h-3 w-3 mr-1" />
                Regular Plans
              </Button>
            </div>
            
            {planType === 'regular' && (
              <div className="flex items-center bg-muted/50 rounded-full p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full text-xs px-3 py-1 h-auto",
                    billingCycle === 'monthly' && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full text-xs px-3 py-1 h-auto",
                    billingCycle === 'yearly' && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Plan comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-4 px-4 font-medium text-muted-foreground">Features</th>
                <th className="py-4 px-4 w-[22%]">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Mini</div>
                    <div className="mt-1 flex items-center justify-center">
                      {planType === 'ltd' ? (
                        <div className="text-lg font-bold">${planPricing.ltd.basic}</div>
                      ) : (
                        <div className="text-lg font-bold">
                          ${planPricing.regular.basic[billingCycle]}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      )}
                    </div>
                    {planType === 'ltd' && (
                      <div className="mt-1 text-xs text-green-600 font-medium">
                        Save ${calculateSavings('ltd', 'basic')}
                      </div>
                    )}
                  </div>
                </th>
                <th className="py-4 px-4 w-[22%]">
                  <div className="flex flex-col items-center relative">
                    {/* Popular badge */}
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                        Most Popular
                      </div>
                    </div>
                    <div className="text-sm font-medium">Solo</div>
                    <div className="mt-1 flex items-center justify-center">
                      {planType === 'ltd' ? (
                        <div className="text-lg font-bold">${planPricing.ltd.premium}</div>
                      ) : (
                        <div className="text-lg font-bold">
                          ${planPricing.regular.premium[billingCycle]}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      )}
                    </div>
                    {planType === 'ltd' && (
                      <div className="mt-1 text-xs text-green-600 font-medium">
                        Save ${calculateSavings('ltd', 'premium')}
                      </div>
                    )}
                  </div>
                </th>
                <th className="py-4 px-4 w-[22%]">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium">Pro</div>
                    <div className="mt-1 flex items-center justify-center">
                      {planType === 'ltd' ? (
                        <div className="text-lg font-bold">${planPricing.ltd.ultimate}</div>
                      ) : (
                        <div className="text-lg font-bold">
                          ${planPricing.regular.ultimate[billingCycle]}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                      )}
                    </div>
                    {planType === 'ltd' && (
                      <div className="mt-1 text-xs text-green-600 font-medium">
                        Save ${calculateSavings('ltd', 'ultimate')}
                      </div>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Payment frequency row - only for LTD plans */}
              {planType === 'ltd' && (
                <tr className="border-b border-border/50 bg-primary/5">
                  <td className="py-3 px-4 font-medium">Payment</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">One-time</span>
                      <span className="text-xs text-muted-foreground">Lifetime access</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">One-time</span>
                      <span className="text-xs text-muted-foreground">Lifetime access</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">One-time</span>
                      <span className="text-xs text-muted-foreground">Lifetime access</span>
                    </div>
                  </td>
                </tr>
              )}

              {/* Feature rows */}
              {visibleFeatures.map((feature, index) => (
                <tr 
                  key={index} 
                  className={cn(
                    "border-b border-border/50",
                    index % 2 === 0 && "bg-muted/30"
                  )}
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      {feature.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">{feature.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.tiers.basic === 'boolean' ? (
                      feature.tiers.basic ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span>{feature.tiers.basic}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.tiers.premium === 'boolean' ? (
                      feature.tiers.premium ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span>{feature.tiers.premium}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.tiers.ultimate === 'boolean' ? (
                      feature.tiers.ultimate ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span>{feature.tiers.ultimate}</span>
                    )}
                  </td>
                </tr>
              ))}

              {/* LTD-specific benefits */}
              {planType === 'ltd' && (
                <>
                  <tr className="border-b border-border/50 bg-primary/5">
                    <td className="py-3 px-4 font-medium">Lifetime Updates</td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/50 bg-primary/5">
                    <td className="py-3 px-4 font-medium">No Recurring Fees</td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Show more/less features button */}
        {planFeatures.length > 6 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpandedFeatures}
              className="text-primary"
            >
              {expandedFeatures ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less Features
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show All Features
                </>
              )}
            </Button>
          </div>
        )}

        {/* CTA section */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Button variant="outline" size="sm" className="w-full">
              Get Mini
            </Button>
          </div>
          <div className="text-center">
            <Button size="sm" className="w-full bg-primary">
              <Star className="h-3 w-3 mr-1" />
              Get Solo
            </Button>
          </div>
          <div className="text-center">
            <Button variant="outline" size="sm" className="w-full">
              Get Pro
            </Button>
          </div>
        </div>

        {/* LTD disclaimer */}
        {planType === 'ltd' && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            <p> Lifetime Deal - One-time payment, lifetime access. Limited time offer.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlanComparisonTable;