import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Receipt, Upload, PieChart, LogIn, LogOut, Menu, Save, BarChart, CreditCard, Home, ArrowLeftRight, TrendingUp, Target, Bot, Fingerprint } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { limits, activePlan } = useSubscription();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, label, icon: Icon, color = '', requiresFeature = undefined }) => {
    const isActive = location.pathname === to;
    const isDisabled = requiresFeature && !limits[requiresFeature];
    
    const linkContent = (
      <Link 
        to={to}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
          "hover:bg-accent/10 active:scale-[0.97]",
          isActive ? "text-primary font-medium" : "text-muted-foreground",
          isDisabled && "opacity-50 pointer-events-none"
        )}
      >
        <Icon className={cn("w-4 h-4", color, isActive && "text-primary")} />
        <span className="text-sm">{label}</span>
      </Link>
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

    return linkContent;
  };

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-6 mt-6">
          <Link to="/" className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">AI Expense Buddy</span>
          </Link>
          
          <nav className="flex flex-col space-y-1">
            {user ? (
              <>
                <NavLink to="/dashboard" label="Dashboard" icon={Receipt} />
                <NavLink to="/dashboard/upload" label="Upload" icon={Upload} />
                <NavLink to="/dashboard/analyze" label="Analyze" icon={PieChart} />
                <NavLink to="/dashboard/saved" label="Saved" icon={Save} />
                <NavLink to="/dashboard/charts" label="Charts" icon={BarChart} />
                <NavLink to="/pricing" label="Pricing" icon={CreditCard} />
                <NavLink to="/billing" label="Billing" icon={Receipt} />
                {isAdmin && <NavLink to="/admin" label="Admin Panel" icon={Target} />}
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer text-muted-foreground hover:bg-accent/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </div>
              </>
            ) : (
              <NavLink to="/auth" label="Sign In" icon={LogIn} />
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 px-4 transition-all duration-300",
        isScrolled ? "glass-effect shadow-subtle backdrop-blur-lg" : "bg-background/95"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold text-foreground hidden sm:inline">AI Expense Buddy</span>
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto">
            <NavLink to="/dashboard" label="Home" icon={Home} color="text-sky-500" />
            <NavLink to="/dashboard/upload" label="Upload" icon={Upload} color="text-violet-500" />
            <NavLink to="/dashboard/analyze" label="Basic Analysis" icon={PieChart} color="text-pink-700" />
            <NavLink to="/dashboard/saved" label="Saved" icon={Save} color="text-orange-700" />
            <NavLink to="/dashboard/advanced-analysis" label="Advanced Analysis" icon={Fingerprint} color="text-amber-600" requiresFeature="advancedAnalysis" />
            <NavLink 
              to="/pricing" 
              label="Pricing" 
              icon={CreditCard} 
              color="text-emerald-500"
            />
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    <span className="hidden sm:inline">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Features</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/compare" className="flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4 text-blue-700" />
                      <span>Compare Periods</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/advanced-analysis" className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-amber-600" />
                      <span>Advanced Analysis</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/financial-goals" className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span>Financial Goals</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/expense-tracker" className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Expense Tracker</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/ai-advisor" className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span>AI Advisor</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/pricing" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Pricing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/billing" className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-gray-500" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
