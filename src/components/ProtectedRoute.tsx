import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

const featureRoutes = {
  '/dashboard/compare': 'canCompare',
  '/dashboard/advanced-analytics': 'hasAdvancedAnalytics',
  '/dashboard/financial-goals': 'hasFinancialGoals',
  '/dashboard/ai-advisor': 'hasAIFinancialAdvisor',
  // Add other feature-gated routes here
} as const;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { limits } = useSubscription();
  const location = useLocation();

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check feature access
  const requiredFeature = featureRoutes[location.pathname as keyof typeof featureRoutes];
  if (requiredFeature && !limits[requiredFeature]) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
