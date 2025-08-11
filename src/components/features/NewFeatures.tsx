import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShieldAlert, CalendarClock, TrendingUp, Store, HeartPulse, Receipt, ArrowRight } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';

const features = [
  {
    id: 'security',
    title: 'Scam Alerts & Security',
    description: 'Monitor and protect your accounts from suspicious activities.',
    icon: ShieldAlert,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=security',
    color: 'text-red-400',
  },
  {
    id: 'recurring',
    title: 'Recurring Expenses',
    description: 'Identify and manage subscription services and recurring payments.',
    icon: CalendarClock,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=recurring',
    color: 'text-blue-400',
  },
  {
    id: 'cashflow',
    title: 'Cash Flow Analysis',
    description: 'Analyze money flow in and out of your accounts.',
    icon: TrendingUp,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=cashflow',
    color: 'text-green-400',
  },
  {
    id: 'merchants',
    title: 'Merchant Intelligence',
    description: 'Deep dive into your spending at specific merchants and vendors.',
    icon: Store,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=merchants',
    color: 'text-purple-400',
  },
  {
    id: 'health',
    title: 'Financial Health Score',
    description: 'Overall assessment of your financial wellness.',
    icon: HeartPulse,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=health',
    color: 'text-teal-400',
  },
  {
    id: 'tax',
    title: 'Tax & Expense Categorization',
    description: 'Help with tax preparation and business expense tracking.',
    icon: Receipt,
    visual: <ImagePlaceholder />,
    link: '/dashboard/more-analytics?tab=tax',
    color: 'text-indigo-400',
  },
];

const NewFeatures = () => {
  const [activeTab, setActiveTab] = useState(features[0].id);
  const activeFeature = features.find(f => f.id === activeTab);

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm text-primary uppercase tracking-wide mb-2">New Features</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Advanced Analytics Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock a deeper understanding of your finances with our new suite of AI-powered analytics tools.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/3">
            <div className="sticky top-32 space-y-2">
              {features.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-center transition-all duration-300",
                    activeTab === feature.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4">
                    <div className={cn(
                      "rounded-full p-2 w-10 h-10 flex items-center justify-center",
                       activeTab === feature.id ? "bg-primary/20" : "bg-muted"
                    )}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 text-foreground">{feature.title}</h3>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="md:w-2/3 md:h-[520px]">
            {activeFeature && (
              <div className="bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-6 h-full flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-foreground">{activeFeature.title}</h3>
                <p className="text-muted-foreground mb-6">{activeFeature.description}</p>
                <div className="flex-grow rounded-lg overflow-hidden border border-border">
                  {activeFeature.visual}
                </div>
              </div>
            )}
          </div>
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
