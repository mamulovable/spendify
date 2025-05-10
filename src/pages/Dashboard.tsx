import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto pt-8">
        {children || <Outlet />}
      </div>
      <Toaster />
    </div>
  );
};

export default Dashboard;
