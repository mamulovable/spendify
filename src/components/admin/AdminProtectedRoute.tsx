import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function AdminProtectedRoute({ 
  children, 
  requiredPermission 
}: AdminProtectedRouteProps) {
  const { isAdmin, adminUser, loading, hasPermission } = useAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is an admin
  if (!isAdmin || !adminUser) {
    // Redirect to admin login, but save the attempted URL
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user has required permission (if specified)
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="bg-destructive/10 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have the required permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Required permission: <code className="bg-muted px-1 py-0.5 rounded">{requiredPermission}</code>
          </p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
