import { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Receipt, Upload, PieChart as PieChartIcon, ArrowRight, LogIn, 
  ChevronRight, BarChart3, BrainCircuit, 
  TrendingUp, SparkleIcon, Lightbulb, ShieldCheck,
  DollarSign, ShoppingBag, Home, Car, Check, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PLANS, DURATIONS, calculatePrice, formatPrice } from '@/config/pricing';

const Index = () => {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('tab1');
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (heroRef.current) {
        // Parallax effect
        heroRef.current.style.transform = `translateY(${scrollY * 0.1}px)`;
        heroRef.current.style.opacity = `${1 - scrollY * 0.001}`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
    return (
      <div 
        className={cn(
          "p-6 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md",
          "hover:shadow-lg hover:border-primary/30 transition-all duration-300",
          "animate-slide-up"
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    );
  };

  const CompanyLogo = ({ name, delay = 0 }) => (
    <div 
      className="text-sm md:text-base font-medium text-muted-foreground/70 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {name}
    </div>
  );

  const TestimonialCard = ({ quote, author, company, delay = 0 }) => (
    <Card 
      className="animate-slide-up backdrop-blur-sm bg-background/80"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="mb-4 text-primary">
          <svg width="45" height="36" viewBox="0 0 45 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M13.9 18.7C16.1 20.3 17.2 22.3 17.2 24.7C17.2 27 16.4 28.8 14.8 30.1C13.2 31.4 11.2 32.1 8.9 32.1C6.5 32.1 4.4 31.3 2.6 29.7C0.9 28 0 25.8 0 23.2C0 20.7 0.7 18.3 2.2 15.9C3.7 13.5 6.2 10.8 9.7 7.9L13.9 12.1C11.1 14.5 9.5 16.4 9.2 18H9.5C10.8 18 12.3 18.2 13.9 18.7ZM40.6 18.7C42.8 20.3 43.9 22.3 43.9 24.7C43.9 27 43.1 28.8 41.5 30.1C39.9 31.4 37.9 32.1 35.6 32.1C33.2 32.1 31.1 31.3 29.3 29.7C27.6 28 26.7 25.8 26.7 23.2C26.7 20.7 27.4 18.3 28.9 15.9C30.4 13.5 32.9 10.8 36.4 7.9L40.6 12.1C37.8 14.5 36.2 16.4 35.9 18H36.2C37.5 18 39 18.2 40.6 18.7Z" fill="currentColor"/>
          </svg>
        </div>
        <p className="text-lg mb-6">{quote}</p>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{company}</p>
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ icon: Icon, title, value, trend, color }) => (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm">
      <div className="flex items-center mb-2">
        <div className={`mr-2 rounded-full p-2 ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-zinc-500 dark:text-zinc-400 text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className={`text-sm ${trend.color}`}>{trend.value}</div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-background/0 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0" />
        
        <div 
          ref={heroRef}
          className="max-w-6xl mx-auto text-center md:text-left relative z-10 pt-16 flex flex-col md:flex-row items-center"
        >
          <div className="md:w-1/2 mb-10 md:mb-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-scale-in">
            <Receipt className="w-4 h-4" />
              <span>AI-Powered Financial Analysis</span>
          </div>
          
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
              Spending Analysis
              <span className="md:block text-3xl md:text-4xl text-muted-foreground/70 mt-2">Understand where your money goes</span>
          </h1>
          
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Upload your bank statements and get AI-powered insights to optimize your spending habits and make smarter financial decisions
          </p>
          
            <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {user ? (
              <Link to="/dashboard/upload">
                  <Button size="lg" className="rounded-md px-6 gap-2 h-12 bg-blue-500 hover:bg-blue-600">
                  <Upload className="w-4 h-4" />
                    Upload Statement
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                  <Button size="lg" className="rounded-md px-6 gap-2 h-12 bg-blue-500 hover:bg-blue-600">
                    <Upload className="w-4 h-4" />
                    Upload Statement
                </Button>
              </Link>
            )}
            
              <Link to="/dashboard/analyze" className="mt-4 sm:mt-0">
                <Button size="lg" variant="outline" className="rounded-md px-6 gap-2 h-12">
                  <PieChart className="w-4 h-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/5 to-primary/20 rounded-2xl p-3">
                {/* App Screenshot */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">AI Expense Buddy</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>Home</span>
                      <span className="font-medium">Dashboard</span>
                      <span>Upload</span>
                      <span>Analyze</span>
                      <span>Saved</span>
                      <span>Charts</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">Spending Analysis</h2>
                        <p className="text-zinc-500 text-sm">Example data shown. Please upload a statement for real insights.</p>
                      </div>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-xs px-4 py-1 h-auto rounded-md">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Statement
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-zinc-500 text-xs mb-1 flex items-center">
                          <DollarSign className="w-3 h-3 mr-1 text-blue-500" />
                          Total Expenses
                        </div>
                        <div className="text-xl font-bold">$4,490</div>
                        <div className="text-green-500 text-xs">+12% from last month</div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-zinc-500 text-xs mb-1 flex items-center">
                          <ShoppingBag className="w-3 h-3 mr-1 text-green-500" />
                          Top Category
                        </div>
                        <div className="text-xl font-bold">Shopping</div>
                        <div className="text-zinc-500 text-xs">28% from last month</div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-zinc-500 text-xs mb-1 flex items-center">
                          <Receipt className="w-3 h-3 mr-1 text-amber-500" />
                          Transactions
                        </div>
                        <div className="text-xl font-bold">8</div>
                        <div className="text-red-500 text-xs">-3% from last month</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 border-b mb-4 text-sm">
                      <div className="border-b-2 border-blue-500 pb-2 font-medium">Categories</div>
                      <div className="text-zinc-500 pb-2">Transactions</div>
                      <div className="text-zinc-500 pb-2">AI Insights</div>
                      <div className="text-zinc-500 pb-2">Saved Analyses</div>
                    </div>
                    
                    <div className="flex">
                      <div className="w-1/2 pr-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm">Shopping</span>
                            </div>
                            <span className="text-sm font-medium">$1240.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">28%</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm">Housing</span>
                            </div>
                            <span className="text-sm font-medium">$1800.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">40%</div>
                        </div>
                      </div>
                      
                      <div className="w-1/2">
                        <div className="rounded-full overflow-hidden h-40 w-40 mx-auto">
                          <div className="h-full w-full bg-white rounded-full p-4">
                            <div className="h-full w-full rounded-full border-8 border-blue-500 border-t-green-500 border-r-amber-500 border-b-red-500 border-l-purple-500"></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-center text-xs gap-2 mt-2">
                          <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Shopping</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Housing</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span> Transportation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-tr from-primary/10 to-primary/5 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
        
        {/* Gradient decorative element */}
        <div className="absolute -bottom-32 left-0 right-0 h-64 bg-gradient-radial from-primary/5 to-transparent opacity-70 z-0" />
      </section>
      
      {/* Trusted by section */}
      <section className="py-16 px-6 relative">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-8">Trusted by innovative teams</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
            <CompanyLogo name="Hotjar" delay={0} />
            <CompanyLogo name="Loom" delay={100} />
            <CompanyLogo name="Lattice" delay={200} />
            <CompanyLogo name="Evernote" delay={300} />
            <CompanyLogo name="Hotjar" delay={400} />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-background/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-wide mb-2">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-driven features for smarter investing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your financial management with powerful AI insights and automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={BrainCircuit} 
              title="AI-Powered Analysis" 
              description="Intelligent algorithms analyze your transactions to identify patterns and provide actionable insights."
              delay={0}
            />
            <FeatureCard 
              icon={BarChart3} 
              title="Interactive Dashboards" 
              description="Visualize your financial data with beautiful charts and graphs for better decision making."
              delay={100}
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Performance Tracking" 
              description="Monitor your financial progress over time and measure performance against your goals."
              delay={200}
            />
            <FeatureCard 
              icon={SparkleIcon} 
              title="Smart Categorization" 
              description="Automatically categorize your expenses with machine learning that improves over time."
              delay={300}
            />
            <FeatureCard 
              icon={Lightbulb} 
              title="Personalized Insights" 
              description="Get tailored recommendations based on your unique spending habits and financial goals."
              delay={400}
            />
            <FeatureCard 
              icon={ShieldCheck} 
              title="Secure & Private" 
              description="Enterprise-grade security ensures your financial data is always protected and private."
              delay={500}
            />
          </div>
        </div>
      </section>
      
      {/* Who can use it section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-wide mb-2">For Everyone</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Who can benefit from AI Expense Buddy?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed for anyone looking to take control of their finances
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Individual */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Individuals</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track personal spending and saving habits
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Identify areas for potential savings
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Plan for future financial goals
                </li>
              </ul>
            </div>
            
            {/* Families */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Families</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Manage household expenses effectively
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Budget for education, healthcare, and more
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set and track family financial goals
                </li>
              </ul>
            </div>
            
            {/* Small Businesses */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Small Businesses</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track business expenses and revenue
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Optimize cash flow management
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Streamline tax preparation
                </li>
              </ul>
            </div>
            
            {/* Students */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Students</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Manage limited student budgets
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track education expenses and loans
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Learn financial literacy early
                </li>
              </ul>
            </div>
            
            {/* Financial Professionals */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Advisors</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Analyze client spending patterns
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Provide data-driven financial advice
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create detailed financial reports
                </li>
              </ul>
            </div>
            
            {/* Retirees */}
            <div className="bg-white dark:bg-zinc-800/40 rounded-xl p-8 shadow-sm border border-border/50 hover:border-primary/30 transition-duration-300">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Retirees</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Manage fixed-income budgets
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Track healthcare and essential expenses
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Plan for long-term financial security
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      {/* Product showcase */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See how it works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An intuitive platform that simplifies your financial management
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="md:w-1/3">
              <div className="sticky top-32 space-y-4">
                <button 
                  onClick={() => setActiveTab('tab1')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tab1' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tab1' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <PieChart className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Categories Analysis</h3>
                    <p className="text-sm text-muted-foreground">Visualize your spending by category with interactive charts</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('tab2')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tab2' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tab2' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Transactions</h3>
                    <p className="text-sm text-muted-foreground">Browse and filter your transaction history easily</p>
                  </div>
                </button>

                {/* Merchants Tab Button */}
                <button 
                  onClick={() => setActiveTab('tabMerchants')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tabMerchants' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tabMerchants' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <ShoppingBag className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Merchants</h3>
                    <p className="text-sm text-muted-foreground">See where you spend most and track merchant trends</p>
                  </div>
                </button>

                {/* Merchant Analytics Tab Button */}
                <button 
                  onClick={() => setActiveTab('tabMerchantAnalytics')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tabMerchantAnalytics' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tabMerchantAnalytics' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <BarChart3 className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Merchant Analytics</h3>
                    <p className="text-sm text-muted-foreground">Deep-dive into merchant-level insights and patterns</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('tab3')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tab3' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tab3' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <SparkleIcon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">AI Insights</h3>
                    <p className="text-sm text-muted-foreground">Get intelligent recommendations based on your spending</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('tab4')}
                  className={cn(
                    "w-full text-left p-4 rounded-lg flex items-start transition-all duration-300",
                    activeTab === 'tab4' 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="mr-4 mt-1">
                    <div className={cn(
                      "rounded-full p-2 w-8 h-8 flex items-center justify-center",
                      activeTab === 'tab4' ? "bg-primary/20" : "bg-muted"
                    )}>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Saved Analyses</h3>
                    <p className="text-sm text-muted-foreground">Access your historical financial analyses anytime</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="md:w-2/3 bg-gradient-to-br from-primary/5 to-primary/20 p-3 rounded-xl shadow-lg">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">AI Expense Buddy</span>
                  </div>
                </div>
                  
                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Spending Analysis</h2>
                  </div>
                  
                  <div className="flex gap-2 border-b mb-6 text-sm">
                    <div className={cn(
                      "border-b-2 pb-2 px-2 font-medium",
                      activeTab === 'tab1' ? "border-blue-500 text-blue-500" : "border-transparent text-zinc-500"
                    )}>Categories</div>
                    <div className={cn(
                      "border-b-2 pb-2 px-2 font-medium",
                      activeTab === 'tab2' ? "border-blue-500 text-blue-500" : "border-transparent text-zinc-500"
                    )}>Transactions</div>
                    <div className={cn(
                      "border-b-2 pb-2 px-2 font-medium",
                      activeTab === 'tab3' ? "border-blue-500 text-blue-500" : "border-transparent text-zinc-500"
                    )}>AI Insights</div>
                    <div className={cn(
                      "border-b-2 pb-2 px-2 font-medium",
                      activeTab === 'tab4' ? "border-blue-500 text-blue-500" : "border-transparent text-zinc-500"
                    )}>Saved Analyses</div>
                  </div>
                  
                  {activeTab === 'tab1' && (
                    <div className="flex">
                      <div className="w-1/2 pr-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                              <span className="text-sm">Shopping</span>
                            </div>
                            <span className="text-sm font-medium">$1240.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">28%</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm">Housing</span>
                            </div>
                            <span className="text-sm font-medium">$1800.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">40%</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                              <span className="text-sm">Transportation</span>
                            </div>
                            <span className="text-sm font-medium">$450.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">10%</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-sm">Food & Dining</span>
                            </div>
                            <span className="text-sm font-medium">$680.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">15%</div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                              <span className="text-sm">Miscellaneous</span>
                            </div>
                            <span className="text-sm font-medium">$320.00</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: '7%' }}></div>
                          </div>
                          <div className="text-xs text-zinc-500">7%</div>
                        </div>
                      </div>
                      
                      <div className="w-1/2 flex flex-col items-center justify-center">
                        <div className="relative h-48 w-48 mx-auto">
                          <div className="absolute inset-0 rounded-full shadow-inner border-8 border-blue-500 border-t-green-500 border-r-amber-500 border-b-red-500 border-l-purple-500"></div>
                        </div>
                        <div className="flex flex-wrap justify-center text-xs gap-2 mt-4">
                          <span className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Shopping</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Housing</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-amber-500 rounded-full mr-1"></span> Transportation</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span> Food & Dining</span>
                          <span className="flex items-center"><span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span> Miscellaneous</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'tab2' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 text-sm">2023-06-15</td>
                            <td className="py-3 px-4 text-sm font-medium">Whole Foods Market</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Food & Dining</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">$78.35</td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 text-sm">2023-06-14</td>
                            <td className="py-3 px-4 text-sm font-medium">Amazon.com</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Shopping</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">$124.99</td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 text-sm">2023-06-13</td>
                            <td className="py-3 px-4 text-sm font-medium">Uber</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">Transportation</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">$24.50</td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 text-sm">2023-06-10</td>
                            <td className="py-3 px-4 text-sm font-medium">Rent Payment</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Housing</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">$1800.00</td>
                          </tr>
                          <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 text-sm">2023-06-08</td>
                            <td className="py-3 px-4 text-sm font-medium">Starbucks</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Food & Dining</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-medium">$5.65</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {activeTab === 'tabMerchants' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-md bg-blue-500/5 border border-blue-500/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <ShoppingBag className="w-4 h-4 text-blue-500" />
                          Top Merchants
                        </h4>
                        <p className="text-muted-foreground">
                          Discover which merchants you spend the most with. Easily spot your top vendors and track spending habits by store or service.
                        </p>
                        <ul className="mt-4 space-y-2">
                          <li className="flex justify-between text-sm"><span>Amazon.com</span> <span className="font-medium">$1,200</span></li>
                          <li className="flex justify-between text-sm"><span>Uber</span> <span className="font-medium">$450</span></li>
                          <li className="flex justify-between text-sm"><span>Whole Foods Market</span> <span className="font-medium">$300</span></li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'tabMerchantAnalytics' && (
  <div className="space-y-6">
    <div className="p-4 rounded-md bg-purple-500/5 border border-purple-500/20">
      <h4 className="font-medium flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-purple-500" />
        Merchant Analytics
      </h4>
      <p className="text-muted-foreground mb-4">
        Get advanced analytics on your merchant transactions. Visualize frequency, total spend, and trends for each merchant to optimize where your money goes.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Donut Chart (Top Merchants by Spend) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h5 className="text-base font-semibold mb-2 text-white">Top Merchants by Spend</h5>
          <div className="h-[180px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Amazon.com', value: 1200, fill: '#FFD600' },
                    { name: 'Uber', value: 450, fill: '#00CFFF' },
                    { name: 'Whole Foods Market', value: 300, fill: '#00E676' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  stroke="#232946"
                  paddingAngle={2}
                >
                  <Cell key="cell-0" fill="#FFD600" />
                  <Cell key="cell-1" fill="#00CFFF" />
                  <Cell key="cell-2" fill="#00E676" />
                </Pie>
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bar Chart (Merchant Frequency) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h5 className="text-base font-semibold mb-2 text-white">Merchant Transaction Frequency</h5>
          <div className="h-[180px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Amazon.com', frequency: 8 },
                { name: 'Uber', frequency: 15 },
                { name: 'Whole Foods Market', frequency: 5 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
                <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#232946', color: '#fff', border: 'none' }} />
                <Bar dataKey="frequency" fill="#FFD600" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Line/Area Chart (Merchant Spend Trend) */}
      <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center mt-8">
        <h5 className="text-base font-semibold mb-2 text-white">Merchant Spend Trend</h5>
        <div className="h-[180px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[
              { name: 'Amazon.com', totalSpent: 1200 },
              { name: 'Uber', totalSpent: 450 },
              { name: 'Whole Foods Market', totalSpent: 300 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
              <XAxis dataKey="name" stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
              <YAxis stroke="#fff" tick={{ fill: '#fff', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#232946', color: '#fff', border: 'none' }} />
              <Line type="monotone" dataKey="totalSpent" stroke="#00CFFF" strokeWidth={3} dot={{ r: 4, fill: '#00CFFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
)}

                  {activeTab === 'tab3' && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <SparkleIcon className="w-4 h-4 text-primary" />
                          Spending Insight
                        </h4>
                        <p className="text-muted-foreground">
                          Your housing expenses account for 40% of your total spending this month. The recommended budget for housing is typically 30% of income.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          Category Analysis
                        </h4>
                        <p className="text-muted-foreground">
                          Your shopping expenses have increased by 28% compared to last month. Consider reviewing these purchases for potential savings.
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-md bg-green-500/5 border border-green-500/20">
                        <h4 className="font-medium flex items-center gap-2 mb-2">
                          <ArrowRight className="w-4 h-4 text-green-500" />
                          Savings Recommendation
                        </h4>
                        <p className="text-muted-foreground">
                          Based on your spending patterns, you could save approximately $320 per month by reducing discretionary spending in the "Shopping" category.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {activeTab === 'tab4' && (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">June 2023 Analysis</h3>
                            <p className="text-sm text-muted-foreground">June 30, 2023</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="text-green-600">$5,240</span> / <span className="text-red-600">$4,490</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">May 2023 Analysis</h3>
                            <p className="text-sm text-muted-foreground">May 31, 2023</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="text-green-600">$5,120</span> / <span className="text-red-600">$4,380</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg hover:border-primary/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">April 2023 Analysis</h3>
                            <p className="text-sm text-muted-foreground">April 30, 2023</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className="text-green-600">$4,980</span> / <span className="text-red-600">$4,210</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-background/80 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our customers say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their financial management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="This platform has completely changed how I manage my finances. The AI insights are genuinely helpful and have saved me thousands of dollars."
              author="Sarah Johnson"
              company="Marketing Director"
              delay={0}
            />
            <TestimonialCard 
              quote="The visualization tools are exceptional. I can finally understand my spending patterns at a glance and make better financial decisions."
              author="Michael Chen"
              company="Software Engineer"
              delay={100}
            />
            <TestimonialCard 
              quote="I've tried many financial tools, but this one stands out with its intelligent automation and user-friendly interface. Highly recommended!"
              author="Emily Rodriguez"
              company="Small Business Owner"
              delay={200}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your financial management?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who have revolutionized their approach to personal finance with our AI-powered platform
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard/upload">
                <Button size="lg" className="rounded-md px-8 gap-2 h-12">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="rounded-md px-8 gap-2 h-12">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
            
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-md px-8 h-12">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-background/70 to-background/100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Pricing Plans</h2>
          <p className="text-lg text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Start with a <span className="font-semibold text-primary">7-day free trial</span>. Cancel anytime. No credit card required for trial.
          </p>
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
              const isCurrentPlan = user && user.activePlan === plan.id;
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
                          window.location.href = '/login';
                          return;
                        }
                        // Buy Now logic (simulate payment)
                        // ...
                      }}
                      className="w-full"
                      disabled={false}
                      variant="default"
                    >
                      Buy Now ({formatPrice(monthlyPrice)}/mo)
                    </Button>
                    {!user ? (
                      <Button
                        onClick={() => window.location.href = '/login'}
                        className="w-full"
                        disabled={false}
                      >
                        Login to Start Trial
                      </Button>
                    ) : !user.activePlan ? (
                      <>
                        <Button
                          onClick={() => {/* Start 7-day trial logic */}}
                          className="w-full"
                          disabled={false}
                          variant="outline"
                        >
                          Start 7-day Trial
                        </Button>
                        <div>
                          <Button
                            onClick={() => {/* 30-day trial with card logic */}}
                            className="w-full"
                            disabled={false}
                          >
                            Get 30-day Trial (Verify Card - ₦100 hold)
                          </Button>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            We'll place a ₦100 hold on your card for verification. This amount will be refunded.
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-background/80 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent z-0" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our customers say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their financial management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="This platform has completely changed how I manage my finances. The AI insights are genuinely helpful and have saved me thousands of dollars."
              author="Sarah Johnson"
              company="Marketing Director"
              delay={0}
            />
            <TestimonialCard 
              quote="The visualization tools are exceptional. I can finally understand my spending patterns at a glance and make better financial decisions."
              author="Michael Chen"
              company="Software Engineer"
              delay={100}
            />
            <TestimonialCard 
              quote="I've tried many financial tools, but this one stands out with its intelligent automation and user-friendly interface. Highly recommended!"
              author="Emily Rodriguez"
              company="Small Business Owner"
              delay={200}
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your financial management?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who have revolutionized their approach to personal finance with our AI-powered platform
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard/upload">
                <Button size="lg" className="rounded-md px-8 gap-2 h-12">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="rounded-md px-8 gap-2 h-12">
                  Get Started Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
            
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-md px-8 h-12">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 text-xl font-bold mb-4 md:mb-0">
              <PieChart className="w-6 h-6 text-primary" />
              SpendifyGuru
            </div>
            
            <div className="flex flex-wrap gap-8">
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 SpendifyGuru. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
