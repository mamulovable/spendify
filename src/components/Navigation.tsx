import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation, Link } from 'react-router-dom';
import { BarChart, Home, PieChart, ArrowLeftRight, Upload, Save, CreditCard, TrendingUp, Target, Bot, Receipt } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SubscriptionLimits } from '@/types/subscription';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
  requiresFeature?: keyof Omit<SubscriptionLimits, 'maxStatements' | 'maxSavedAnalyses'>;
}

function NavLink({ href, icon: Icon, label, color, requiresFeature }: NavLinkProps) {
  const location = useLocation();
  const { limits, activePlan } = useSubscription();
  const isDisabled = requiresFeature && !limits[requiresFeature];

  const linkContent = (
    <div
      className={cn(
        'text-sm group flex p-3 w-full justify-start font-medium rounded-lg transition',
        location.pathname === href
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground',
        isDisabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
      )}
    >
      <div className="flex items-center flex-1">
        <Icon className={cn('h-5 w-5 mr-3', color)} />
        {label}
      </div>
    </div>
  );

  if (isDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{linkContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Requires {activePlan ? 'higher' : 'Pro'} plan</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Link to={href}>{linkContent}</Link>;
}

const routes: NavLinkProps[] = [
  {
    label: 'Home',
    icon: Home,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Upload',
    icon: Upload,
    href: '/dashboard/upload',
    color: 'text-violet-500',
  },
  {
    label: 'Transactions',
    icon: Receipt,
    href: '/dashboard/transactions',
    color: 'text-yellow-600',
  },
  {
    label: 'Basic Analysis',
    icon: PieChart,
    href: '/dashboard/analyze',
    color: 'text-pink-700',
  },
  {
    label: 'Advanced Analytics',
    icon: TrendingUp,
    href: '/dashboard/advanced-analytics',
    color: 'text-emerald-500',
    requiresFeature: 'hasAdvancedAnalytics',
  },
  {
    label: 'Saved',
    icon: Save,
    href: '/dashboard/saved',
    color: 'text-orange-700',
  },
  {
    label: 'Compare',
    icon: ArrowLeftRight,
    href: '/dashboard/compare',
    color: 'text-blue-700',
    requiresFeature: 'canCompare',
  },
  {
    label: 'Pricing',
    icon: CreditCard,
    href: '/dashboard/pricing',
    color: 'text-gray-500',
  },
  {
    label: 'Financial Goals',
    icon: Target,
    href: '/dashboard/financial-goals',
    color: 'text-purple-500',
    requiresFeature: 'hasFinancialGoals'
  },
  {
    label: 'AI Financial Advisor',
    icon: Bot,
    href: '/dashboard/ai-advisor',
    color: 'text-indigo-500',
    requiresFeature: 'hasAIFinancialAdvisor'
  },
];

export function Navigation() {
  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {routes.map((route) => (
            <NavLink key={route.href} {...route} />
          ))}
        </div>
      </div>
    </div>
  );
} 