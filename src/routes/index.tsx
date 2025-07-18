import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { StatementProvider } from '@/contexts/StatementContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Pricing from '@/pages/Pricing';
import BillingPage from '@/pages/BillingPage';
import PaystackTest from '@/pages/PaystackTest';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExpenseTracker from '@/pages/ExpenseTracker';
import AppSumoRedeem from '@/pages/AppSumoRedeem';
import { AdminRoot } from '@/components/admin/AdminRoot';

// Import admin routes
import adminRoutes from './adminRoutes';

// Lazy load pages
const DashboardHome = lazy(() => import('@/pages/DashboardHome'));
const Upload = lazy(() => import('@/pages/Upload'));
const Analyze = lazy(() => import('@/pages/Analyze'));
const SavedAnalyses = lazy(() => import('@/pages/SavedAnalyses'));
const Charts = lazy(() => import('@/pages/Charts'));
const Compare = lazy(() => import('@/pages/Compare'));
const AdvancedAnalytics = lazy(() => import('@/pages/AdvancedAnalytics'));
const AdvancedAnalysis = lazy(() => import('@/pages/AdvancedAnalysis'));
const FinancialGoals = lazy(() => import('@/pages/FinancialGoals'));
const AIFinancialAdvisor = lazy(() => import('@/pages/AIFinancialAdvisor'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const BudgetDashboard = lazy(() => import('@/pages/BudgetDashboard'));
const BudgetForm = lazy(() => import('@/pages/BudgetForm'));

const Features = lazy(() => import('@/pages/Features'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const Contact = lazy(() => import('@/pages/Contact'));
const ThankYou = lazy(() => import('@/pages/ThankYou'));
const FAQ = lazy(() => import('@/pages/FAQ'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Main application routes
const appRoutes = [
  {
    element: (
      <AuthProvider>
        <AdminProvider>
          <SubscriptionProvider>
            <StatementProvider>
              <Layout />
              <Toaster />
            </StatementProvider>
          </SubscriptionProvider>
        </AdminProvider>
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <Index />
      },
      {
        path: '/features',
        element: <Suspense fallback={<LoadingSpinner />}><Features /></Suspense>
      },
      {
        path: '/about',
        element: <Suspense fallback={<LoadingSpinner />}><About /></Suspense>
      },
      {
        path: '/blog',
        element: <Suspense fallback={<LoadingSpinner />}><Blog /></Suspense>
      },
      {
        path: '/contact',
        element: <Suspense fallback={<LoadingSpinner />}><Contact /></Suspense>
      },
      {
        path: '/thankyou',
        element: <Suspense fallback={<LoadingSpinner />}><ThankYou /></Suspense>
      },
      {
        path: '/faq',
        element: <Suspense fallback={<LoadingSpinner />}><FAQ /></Suspense>
      },
      {
        path: '/auth',
        element: <Auth />
      },
      {
        path: '/pricing',
        element: <Pricing />
      },
      {
        path: '/billing',
        element: <ProtectedRoute><BillingPage /></ProtectedRoute>
      },
      {
        path: '/dashboard',
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <Suspense fallback={<LoadingSpinner />}><DashboardHome /></Suspense>
          },
          {
            path: 'upload',
            element: <Suspense fallback={<LoadingSpinner />}><Upload /></Suspense>
          },
          {
            path: 'analyze',
            element: <Suspense fallback={<LoadingSpinner />}><Analyze /></Suspense>
          },
          {
            path: 'saved',
            element: <Suspense fallback={<LoadingSpinner />}><SavedAnalyses /></Suspense>
          },
          {
            path: 'charts',
            element: <Suspense fallback={<LoadingSpinner />}><Charts /></Suspense>
          },
          {
            path: 'compare',
            element: <Suspense fallback={<LoadingSpinner />}><Compare /></Suspense>
          },
          {
            path: 'advanced-analytics',
            element: <Suspense fallback={<LoadingSpinner />}><AdvancedAnalytics /></Suspense>
          },
          {
            path: 'advanced-analysis',
            element: <Suspense fallback={<LoadingSpinner />}><AdvancedAnalysis /></Suspense>
          },
          {
            path: 'financial-goals',
            element: <Suspense fallback={<LoadingSpinner />}><FinancialGoals /></Suspense>
          },
          {
            path: 'ai-advisor',
            element: <Suspense fallback={<LoadingSpinner />}><AIFinancialAdvisor /></Suspense>
          },
          {
            path: 'transactions',
            element: <Suspense fallback={<LoadingSpinner />}><Transactions /></Suspense>
          },
          {
            path: 'budgets',
            element: <Suspense fallback={<LoadingSpinner />}><BudgetDashboard /></Suspense>
          },
          {
            path: 'budgets/:id',
            element: <Suspense fallback={<LoadingSpinner />}><BudgetForm /></Suspense>
          }
        ]
      },
      {
        path: '/paystack-test',
        element: <PaystackTest />
      },
      {
        path: '/expense-tracker',
        element: <ProtectedRoute><ExpenseTracker /></ProtectedRoute>
      },
      {
        path: '/redeem',
        element: <AppSumoRedeem />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },

  // Admin routes wrapper
  {
    path: '/admin',
    element: (
      <AuthProvider>
        <AdminProvider>
          <SubscriptionProvider>
            <StatementProvider>
              <AdminRoot />
              <Toaster />
            </StatementProvider>
          </SubscriptionProvider>
        </AdminProvider>
      </AuthProvider>
    ),
    children: adminRoutes[0].children
  }
];

const router = createBrowserRouter(appRoutes);

export default router;
