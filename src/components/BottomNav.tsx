import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Receipt, Upload, PieChart, Save, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to}
        className={cn(
          "flex flex-col items-center justify-center gap-1 py-1 flex-1",
          "hover:text-primary active:scale-[0.97] transition-all duration-200",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t">
      <div className="flex items-center justify-around px-2 py-1">
        <NavItem to="/dashboard" icon={Receipt} label="Home" />
        <NavItem to="/dashboard/upload" icon={Upload} label="Upload" />
        <NavItem to="/dashboard/analyze" icon={PieChart} label="Analyze" />
        <NavItem to="/dashboard/saved" icon={Save} label="Saved" />
        <NavItem to="/dashboard/charts" icon={BarChart} label="Charts" />
      </div>
    </nav>
  );
};

export default BottomNav;
