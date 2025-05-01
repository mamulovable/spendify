import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/Navigation';

interface DashboardProps {
  children?: React.ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <Navigation />
      </div>
      <main className="md:pl-72">
        <div className="min-h-screen">
          <Navbar />
          <div className="container mx-auto pt-8">
            {children || <Outlet />}
          </div>
          <Toaster />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
