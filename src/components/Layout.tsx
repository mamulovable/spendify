import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import BottomNav from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full px-3 pt-16 pb-20 md:pb-8 md:px-4">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
};

export default Layout;
