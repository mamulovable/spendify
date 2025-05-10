import { RouterProvider } from 'react-router-dom';
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
import { AdminProvider } from './contexts/AdminContext';
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
import Layout from './components/Layout';
import BillingPage from './pages/BillingPage';

import router from './routes';

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
