import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CalendarClock, TrendingUp, Store, HeartPulse, Receipt, ArrowRight } from 'lucide-react';
import ScamAlertsVisual from './ScamAlertsVisual';
import RecurringExpensesVisual from './RecurringExpensesVisual';
import CashFlowVisual from './CashFlowVisual';
import MerchantIntelligenceVisual from './MerchantIntelligenceVisual';
import FinancialHealthVisual from './FinancialHealthVisual';
import TaxCategorizationVisual from './TaxCategorizationVisual';

const features = [
  {
    title: 'Scam Alerts & Security',
    description: 'Monitor and protect your accounts from suspicious activities.',
    icon: ShieldAlert,
    visual: <ScamAlertsVisual />,
    link: '/dashboard/more-analytics?tab=security',
    color: 'text-red-400',
  },
  {
    title: 'Recurring Expenses',
    description: 'Identify and manage subscription services and recurring payments.',
    icon: CalendarClock,
    visual: <RecurringExpensesVisual />,
    link: '/dashboard/more-analytics?tab=recurring',
    color: 'text-blue-400',
  },
  {
    title: 'Cash Flow Analysis',
    description: 'Analyze money flow in and out of your accounts.',
    icon: TrendingUp,
    visual: <CashFlowVisual />,
    link: '/dashboard/more-analytics?tab=cashflow',
    color: 'text-green-400',
  },
  {
    title: 'Merchant Intelligence',
    description: 'Deep dive into your spending at specific merchants and vendors.',
    icon: Store,
    visual: <MerchantIntelligenceVisual />,
    link: '/dashboard/more-analytics?tab=merchants',
    color: 'text-purple-400',
  },
  {
    title: 'Financial Health Score',
    description: 'Overall assessment of your financial wellness.',
    icon: HeartPulse,
    visual: <FinancialHealthVisual />,
    link: '/dashboard/more-analytics?tab=health',
    color: 'text-teal-400',
  },
  {
    title: 'Tax & Expense Categorization',
    description: 'Help with tax preparation and business expense tracking.',
    icon: Receipt,
    visual: <TaxCategorizationVisual />,
    link: '/dashboard/more-analytics?tab=tax',
    color: 'text-indigo-400',
  },
];

const NewFeatures = () => {
  return (
    <section className="py-24 px-6 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-primary uppercase tracking-wide mb-2">New Features</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Advanced Analytics Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock a deeper understanding of your finances with our new suite of AI-powered analytics tools.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link to={`/auth?redirect=${encodeURIComponent(feature.link)}`} key={index} className="block bg-gray-800/50 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 flex flex-col no-underline text-white">
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-full bg-gray-700 mr-4 ${feature.color}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4 h-12">{feature.description}</p>
                <div className="h-48 mb-4 rounded-lg overflow-hidden border border-gray-700">
                  {feature.visual}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-16">
            <Link to="/auth?redirect=/dashboard/more-analytics">
                <Button size="lg" className="rounded-md px-8 gap-2 h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                    View All Analytics
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default NewFeatures;
