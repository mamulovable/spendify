import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import PageTransition from './components/PageTransition';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import Analyze from './pages/Analyze';
import SavedAnalyses from './pages/SavedAnalyses';
import Charts from './pages/Charts';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { StatementProvider } from './contexts/StatementContext';
import { AuthProvider } from './contexts/AuthContext';
import Compare from './pages/Compare';
import Pricing from './pages/Pricing';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import AdvancedAnalytics from '@/pages/AdvancedAnalytics';
import FinancialGoals from '@/pages/FinancialGoals';
import PaystackTest from '@/pages/PaystackTest';
import AIFinancialAdvisor from '@/pages/AIFinancialAdvisor';
import Transactions from '@/pages/Transactions';
import BudgetDashboard from './pages/BudgetDashboard';
import BudgetForm from './pages/BudgetForm';
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><Index /></PageTransition>} />
      <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/login" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/register" element={<PageTransition><Auth /></PageTransition>} />
      <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
      
      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}>
        <Route index element={<PageTransition><DashboardHome /></PageTransition>} />
        <Route path="upload" element={<PageTransition><Upload /></PageTransition>} />
        <Route path="analyze" element={<PageTransition><Analyze /></PageTransition>} />
        <Route path="saved" element={<PageTransition><SavedAnalyses /></PageTransition>} />
        <Route path="charts" element={<PageTransition><Charts /></PageTransition>} />
        <Route path="compare" element={<PageTransition><Compare /></PageTransition>} />
        <Route path="pricing" element={<PageTransition><Pricing /></PageTransition>} />
        <Route path="advanced-analytics" element={<PageTransition><AdvancedAnalytics /></PageTransition>} />
        <Route path="financial-goals" element={<PageTransition><FinancialGoals /></PageTransition>} />
        <Route path="ai-advisor" element={<PageTransition><AIFinancialAdvisor /></PageTransition>} />
        <Route path="transactions" element={<PageTransition><Transactions /></PageTransition>} />
        <Route path="budgets" element={<PageTransition><BudgetDashboard /></PageTransition>} />
        <Route path="budgets/:id" element={<PageTransition><BudgetForm /></PageTransition>} />
      </Route>
      
      {/* Redirect old paths to dashboard */}
      <Route path="/upload" element={<Navigate to="/dashboard/upload" replace />} />
      <Route path="/analyze" element={<Navigate to="/dashboard/analyze" replace />} />
      <Route path="/saved" element={<Navigate to="/dashboard/saved" replace />} />
      <Route path="/charts" element={<Navigate to="/dashboard/charts" replace />} />
      <Route path="/compare" element={<Navigate to="/dashboard/compare" replace />} />
      
      <Route path="/paystack-test" element={<PaystackTest />} />
      
      <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <StatementProvider>
          <Router>
            <AnimatedRoutes />
            <Toaster />
          </Router>
        </StatementProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
