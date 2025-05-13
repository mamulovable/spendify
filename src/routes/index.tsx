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
import ExpenseTracker from '@/pages/ExpenseTracker';

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

// Lazy load admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminUserDetails = lazy(() => import('@/pages/admin/UserDetails'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/Subscriptions'));
const AdminSubscriptionDetails = lazy(() => import('@/pages/admin/SubscriptionDetails'));
const AdminPlans = lazy(() => import('@/pages/admin/Plans'));
const AdminDocuments = lazy(() => import('@/pages/admin/Documents'));
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminReports = lazy(() => import('@/pages/admin/Reports'));
const AdminSettings = lazy(() => import('@/pages/admin/Settings'));
const AdminNotifications = lazy(() => import('@/pages/admin/Notifications'));

import EmailTemplates from '@/pages/admin/EmailTemplates';
import Campaigns from '@/pages/admin/Campaigns';
import UserSegments from '@/pages/admin/UserSegments';
import Backups from '@/pages/admin/Backups';
import DataCleanup from '@/pages/admin/DataCleanup';
import ReleaseNotes from '@/pages/admin/ReleaseNotes';
import SystemUpdates from '@/pages/admin/SystemUpdates';
const AdminLogin = lazy(() => import('@/pages/admin/Login'));

const Features = lazy(() => import('@/pages/Features'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const Contact = lazy(() => import('@/pages/Contact'));
const ThankYou = lazy(() => import('@/pages/ThankYou'));
const FAQ = lazy(() => import('@/pages/FAQ'));

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
        path: '/features',
        element: <Suspense fallback={null}><Features /></Suspense>
      },
      {
        path: '/about',
        element: <Suspense fallback={null}><About /></Suspense>
      },
      {
        path: '/blog',
        element: <Suspense fallback={null}><Blog /></Suspense>
      },
      {
        path: '/contact',
        element: <Suspense fallback={null}><Contact /></Suspense>
      },
      {
        path: '/thankyou',
        element: <Suspense fallback={null}><ThankYou /></Suspense>
      },
      {
        path: '/faq',
        element: <Suspense fallback={null}><FAQ /></Suspense>
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
            path: 'advanced-analysis',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdvancedAnalysis /></Suspense>
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
        path: '/expense-tracker',
        element: <ProtectedRoute><ExpenseTracker /></ProtectedRoute>
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
            path: 'users/:userId',
            element: <AdminUserDetails />,
          },
          {
            path: 'subscriptions',
            element: <AdminSubscriptions />,
          },
          {
            path: 'subscriptions/:subscriptionId',
            element: <AdminSubscriptionDetails />,
          },
          {
            path: 'plans',
            element: <AdminPlans />,
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
            path: 'reports',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminReports /></Suspense>,
          },
          {
            path: 'settings',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminSettings /></Suspense>,
          },
          {
            path: 'notifications',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><AdminNotifications /></Suspense>,
          },
          {
            path: 'email-templates',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><EmailTemplates /></Suspense>,
          },
          {
            path: 'campaigns',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Campaigns /></Suspense>,
          },
          {
            path: 'user-segments',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><UserSegments /></Suspense>,
          },
          {
            path: 'backups',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><Backups /></Suspense>,
          },
          {
            path: 'data-cleanup',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><DataCleanup /></Suspense>,
          },
          {
            path: 'release-notes',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><ReleaseNotes /></Suspense>,
          },
          {
            path: 'system-updates',
            element: <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}><SystemUpdates /></Suspense>,
          }
        ]
      }
    ]
  }
]);

export default router;
