import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, adminUser, loading } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin || !adminUser) {
    // Redirect to admin login, but save the attempted URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
