import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Receipt, Upload, PieChart, LogIn, LogOut, Menu, X, Save, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ to, label, icon: Icon, onClick = undefined }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
          "hover:bg-accent/10 active:scale-[0.97]",
          isActive ? "text-primary font-medium" : "text-muted-foreground"
        )}
        onClick={onClick}
      >
        <Icon className={cn(
          "w-5 h-5 transition-transform duration-300", 
          isActive && "text-primary"
        )} />
        <span>{label}</span>
      </Link>
    );
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
            <NavLink to="/" label="Home" icon={Receipt} />
            
            {user ? (
              <>
                <NavLink to="/dashboard" label="Dashboard" icon={Receipt} />
                <NavLink to="/dashboard/upload" label="Upload" icon={Upload} />
                <NavLink to="/dashboard/analyze" label="Analyze" icon={PieChart} />
                <NavLink to="/dashboard/saved" label="Saved" icon={Save} />
                <NavLink to="/dashboard/charts" label="Charts" icon={BarChart} />
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
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300",
        isScrolled ? "glass-effect shadow-subtle backdrop-blur-lg" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold text-foreground">AI Expense Buddy</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-2">
          <NavLink to="/" label="Home" icon={Receipt} />
          
          {user ? (
            <>
              <NavLink to="/dashboard" label="Dashboard" icon={Receipt} />
              <NavLink to="/dashboard/upload" label="Upload" icon={Upload} />
              <NavLink to="/dashboard/analyze" label="Analyze" icon={PieChart} />
              <NavLink to="/dashboard/saved" label="Saved" icon={Save} />
              <NavLink to="/dashboard/charts" label="Charts" icon={BarChart} />
              <NavLink to="/pricing" label="Pricing" icon={Receipt} />
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-4 py-2 rounded-full"
                onClick={() => signOut()}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <NavLink to="/auth" label="Sign In" icon={LogIn} />
          )}
        </nav>
        
        <MobileMenu />
      </div>
    </header>
  );
};

export default Navbar;
