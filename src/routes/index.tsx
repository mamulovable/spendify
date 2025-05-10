import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { AdminRoot } from '@/components/admin/AdminRoot';
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

// Lazy load pages
const DashboardHome = lazy(() => import('@/pages/DashboardHome'));
const Upload = lazy(() => import('@/pages/Upload'));
const Analyze = lazy(() => import('@/pages/Analyze'));
const SavedAnalyses = lazy(() => import('@/pages/SavedAnalyses'));
const Charts = lazy(() => import('@/pages/Charts'));
const Compare = lazy(() => import('@/pages/Compare'));
const AdvancedAnalytics = lazy(() => import('@/pages/AdvancedAnalytics'));
const FinancialGoals = lazy(() => import('@/pages/FinancialGoals'));
const AIFinancialAdvisor = lazy(() => import('@/pages/AIFinancialAdvisor'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const BudgetDashboard = lazy(() => import('@/pages/BudgetDashboard'));
const BudgetForm = lazy(() => import('@/pages/BudgetForm'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/Subscriptions'));
const AdminDocuments = lazy(() => import('@/pages/admin/Documents'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));
const AdminLogin = lazy(() => import('@/pages/admin/Login'));

const router = createBrowserRouter([
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
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><DashboardHome /></Suspense>
          },
          {
            path: 'upload',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Upload /></Suspense>
          },
          {
            path: 'analyze',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Analyze /></Suspense>
          },
          {
            path: 'saved',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><SavedAnalyses /></Suspense>
          },
          {
            path: 'charts',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Charts /></Suspense>
          },
          {
            path: 'compare',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Compare /></Suspense>
          },
          {
            path: 'advanced-analytics',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdvancedAnalytics /></Suspense>
          },
          {
            path: 'financial-goals',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><FinancialGoals /></Suspense>
          },
          {
            path: 'ai-advisor',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AIFinancialAdvisor /></Suspense>
          },
          {
            path: 'transactions',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Transactions /></Suspense>
          },
          {
            path: 'budgets',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><BudgetDashboard /></Suspense>
          },
          {
            path: 'budgets/:id',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><BudgetForm /></Suspense>
          }
        ]
      },
      {
        path: '/paystack-test',
        element: <PaystackTest />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  },

  // Admin routes
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
    children: [
      {
        path: 'login',
        element: <AdminLogin />,
      },
      {
        path: '',
        element: (
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'subscriptions',
            element: <AdminSubscriptions />,
          },
          {
            path: 'documents',
            element: <AdminDocuments />,
          },
          {
            path: 'analytics',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminAnalytics /></Suspense>,
          },
          {
            path: 'settings',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminSettings /></Suspense>,
          },
          {
            path: 'notifications',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminNotifications /></Suspense>,
          }
        ]
      }
    ]
  }
]);

export default router;
