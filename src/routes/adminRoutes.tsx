import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy load admin pages
const AdminLogin = lazy(() => import('@/pages/admin/Login'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));

// User Management
const AdminUsers = lazy(() => import('@/pages/admin/Users'));
const AdminUserDetails = lazy(() => import('@/pages/admin/UserDetails'));
const AdminUserActivity = lazy(() => import('@/pages/admin/UserActivity'));

// Analytics & Insights
const AdminAnalytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminUserMetrics = lazy(() => import('@/pages/admin/UserMetrics'));
const AdminUsageAnalytics = lazy(() => import('@/pages/admin/UsageAnalytics'));

// Revenue & Billing
const AdminRevenue = lazy(() => import('@/pages/admin/Revenue'));
const AdminSubscriptions = lazy(() => import('@/pages/admin/Subscriptions'));
const AdminSubscriptionDetails = lazy(() => import('@/pages/admin/SubscriptionDetails'));
const AdminAppSumo = lazy(() => import('@/pages/admin/AppSumo'));

// Document Processing
const AdminDocumentQueue = lazy(() => import('@/pages/admin/DocumentQueue'));
const AdminDocumentResults = lazy(() => import('@/pages/admin/DocumentResults'));
const AdminAIModels = lazy(() => import('@/pages/admin/AIModels'));

// Support & User Queries
const AdminSupportTickets = lazy(() => import('@/pages/admin/SupportTickets'));
const AdminTicketDetail = lazy(() => import('@/pages/admin/TicketDetail'));
const AdminUserQueries = lazy(() => import('@/pages/admin/UserQueries'));

// AI Feedback Loop
const AdminAIFeedback = lazy(() => import('@/pages/admin/AIFeedback'));
const AdminTrainingData = lazy(() => import('@/pages/admin/TrainingData'));

// Admin Settings
const AdminFeatureFlags = lazy(() => import('@/pages/admin/FeatureFlags'));
const AdminFeatureFlagDetail = lazy(() => import('@/pages/admin/FeatureFlagDetail'));
const AdminModuleConfig = lazy(() => import('@/pages/admin/ModuleConfig'));
const AdminAppConfig = lazy(() => import('@/pages/admin/AppConfig'));
const AdminAnnouncements = lazy(() => import('@/pages/admin/Announcements'));

// Security & Logs
const AdminUserManagement = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));
const AdminSecurityAlerts = lazy(() => import('@/pages/admin/SecurityAlerts'));

// Create a wrapper for lazy-loaded components with Suspense
const LazyComponent = ({ component: Component }: { component: React.ComponentType<any> }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// Protected route with permission check
const ProtectedAdminRoute = ({ 
  component: Component, 
  requiredPermission 
}: { 
  component: React.ComponentType<any>;
  requiredPermission?: string;
}) => (
  <AdminProtectedRoute requiredPermission={requiredPermission}>
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  </AdminProtectedRoute>
);

// Define admin routes
const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    children: [
      {
        path: 'login',
        element: <LazyComponent component={AdminLogin} />,
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
            element: <ProtectedAdminRoute component={AdminDashboard} requiredPermission="view_dashboard" />,
          },
          
          // User Management
          {
            path: 'users',
            element: <ProtectedAdminRoute component={AdminUsers} requiredPermission="manage_users" />,
          },
          {
            path: 'users/:userId',
            element: <ProtectedAdminRoute component={AdminUserDetails} requiredPermission="manage_users" />,
          },
          {
            path: 'users/activity',
            element: <ProtectedAdminRoute component={AdminUserActivity} requiredPermission="manage_users" />,
          },
          
          // Analytics & Insights
          {
            path: 'analytics',
            element: <ProtectedAdminRoute component={AdminAnalytics} requiredPermission="view_analytics" />,
          },
          {
            path: 'analytics/users',
            element: <ProtectedAdminRoute component={AdminUserMetrics} requiredPermission="view_analytics" />,
          },
          {
            path: 'analytics/usage',
            element: <ProtectedAdminRoute component={AdminUsageAnalytics} requiredPermission="view_analytics" />,
          },
          
          // Revenue & Billing
          {
            path: 'revenue',
            element: <ProtectedAdminRoute component={AdminRevenue} requiredPermission="manage_finance" />,
          },
          {
            path: 'subscriptions',
            element: <ProtectedAdminRoute component={AdminSubscriptions} requiredPermission="manage_subscriptions" />,
          },
          {
            path: 'subscriptions/:subscriptionId',
            element: <ProtectedAdminRoute component={AdminSubscriptionDetails} requiredPermission="manage_subscriptions" />,
          },
          {
            path: 'appsumo',
            element: <ProtectedAdminRoute component={AdminAppSumo} requiredPermission="manage_subscriptions" />,
          },
          
          // Document Processing
          {
            path: 'documents/queue',
            element: <ProtectedAdminRoute component={AdminDocumentQueue} requiredPermission="manage_documents" />,
          },
          {
            path: 'documents/results',
            element: <ProtectedAdminRoute component={AdminDocumentResults} requiredPermission="manage_documents" />,
          },
          {
            path: 'documents/models',
            element: <ProtectedAdminRoute component={AdminAIModels} requiredPermission="manage_documents" />,
          },
          
          // Support & User Queries
          {
            path: 'support/tickets',
            element: <ProtectedAdminRoute component={AdminSupportTickets} requiredPermission="manage_support" />,
          },
          {
            path: 'support/tickets/:ticketId',
            element: <ProtectedAdminRoute component={AdminTicketDetail} requiredPermission="manage_support" />,
          },
          {
            path: 'support/queries',
            element: <ProtectedAdminRoute component={AdminUserQueries} requiredPermission="manage_support" />,
          },
          
          // AI Feedback Loop
          {
            path: 'ai/feedback',
            element: <ProtectedAdminRoute component={AdminAIFeedback} requiredPermission="manage_ai" />,
          },
          {
            path: 'ai/training',
            element: <ProtectedAdminRoute component={AdminTrainingData} requiredPermission="manage_ai" />,
          },
          
          // Admin Settings
          {
            path: 'settings/features',
            element: <ProtectedAdminRoute component={AdminFeatureFlags} requiredPermission="manage_settings" />,
          },
          {
            path: 'settings/features/:id',
            element: <ProtectedAdminRoute component={AdminFeatureFlagDetail} requiredPermission="manage_settings" />,
          },
          {
            path: 'settings/modules',
            element: <ProtectedAdminRoute component={AdminModuleConfig} requiredPermission="manage_settings" />,
          },
          {
            path: 'settings/config',
            element: <ProtectedAdminRoute component={AdminAppConfig} requiredPermission="manage_settings" />,
          },
          {
            path: 'settings/announcements',
            element: <ProtectedAdminRoute component={AdminAnnouncements} requiredPermission="manage_settings" />,
          },
          
          // Security & Logs
          {
            path: 'security/admins',
            element: <ProtectedAdminRoute component={AdminUserManagement} requiredPermission="manage_security" />,
          },
          {
            path: 'security/logs',
            element: <ProtectedAdminRoute component={AdminAuditLogs} requiredPermission="manage_security" />,
          },
          {
            path: 'security/alerts',
            element: <ProtectedAdminRoute component={AdminSecurityAlerts} requiredPermission="manage_security" />,
          },
          
          // Catch-all route for admin section
          {
            path: '*',
            element: <Navigate to="/admin" replace />,
          }
        ]
      }
    ]
  }
];

export default adminRoutes;