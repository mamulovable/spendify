export interface Feature {
  name: string;
  description?: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  badge?: string;
  features: Feature[];
}

export interface PlanDuration {
  months: number;
  discount: number;
}

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individuals getting started',
    basePrice: 1500, // in NGN
    features: [
      { name: 'Upload Bank Statements', included: true },
      { name: 'Charts & Visualizations', included: true },
      { name: 'Expense Tracker', included: true },
      { name: 'Basic Transaction Analysis', included: true },
      { name: 'Category Breakdown', included: true },
      { name: 'Export to PDF', included: true },
      { name: 'Financial Goals', included: false },
      { name: 'Compare Analyses', included: false },
      { name: 'Advanced Analytics', included: false },
      { name: 'AI Financial Advisor', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For power users who need more features',
    basePrice: 3000,
    badge: 'Most Popular',
    features: [
      { name: 'Upload Bank Statements', included: true },
      { name: 'Charts & Visualizations', included: true },
      { name: 'Expense Tracker', included: true },
      { name: 'Basic Transaction Analysis', included: true },
      { name: 'Category Breakdown', included: true },
      { name: 'Export to PDF', included: true },
      { name: 'Financial Goals', included: true },
      { name: 'Compare Analyses', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'AI Financial Advisor', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full features for serious financial analysis',
    basePrice: 5000,
    features: [
      { name: 'Upload Bank Statements', included: true },
      { name: 'Charts & Visualizations', included: true },
      { name: 'Expense Tracker', included: true },
      { name: 'Basic Transaction Analysis', included: true },
      { name: 'Category Breakdown', included: true },
      { name: 'Export to PDF', included: true },
      { name: 'Financial Goals', included: true },
      { name: 'Compare Analyses', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'AI Financial Advisor', included: true },
      { name: 'Priority Support', included: true },
    ],
  },
];

export const DURATIONS: PlanDuration[] = [
  { months: 1, discount: 0 },
  { months: 6, discount: 0.1 }, // 10% discount
  { months: 12, discount: 0.2 }, // 20% discount
];

export const calculatePrice = (plan: Plan, duration: PlanDuration): number => {
  const monthlyPrice = plan.basePrice;
  const totalPrice = monthlyPrice * duration.months;
  const discountedPrice = totalPrice * (1 - duration.discount);
  return Math.round(discountedPrice);
};

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}; 