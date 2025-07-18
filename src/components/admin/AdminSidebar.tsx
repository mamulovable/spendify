import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdmin } from '@/contexts/AdminContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Settings,
  PiggyBank,
  BarChart3,
  Headphones,
  MessageSquare,
  Database,
  Shield,
  FileStack,
  BrainCircuit,
  Flag,
  Bell,
  LineChart,
  DollarSign,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  section?: string;
}

const sidebarItems: SidebarItem[] = [
  // Dashboard
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'view_dashboard',
    section: 'dashboard'
  },
  
  // User Management
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: 'manage_users',
    section: 'users'
  },
  {
    title: 'User Activity',
    href: '/admin/users/activity',
    icon: Users,
    permission: 'manage_users',
    section: 'users'
  },
  
  // Analytics & Insights
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'view_analytics',
    section: 'analytics'
  },
  {
    title: 'User Metrics',
    href: '/admin/analytics/users',
    icon: LineChart,
    permission: 'view_analytics',
    section: 'analytics'
  },
  {
    title: 'Usage Analytics',
    href: '/admin/analytics/usage',
    icon: BarChart3,
    permission: 'view_analytics',
    section: 'analytics'
  },
  
  // Revenue & Billing
  {
    title: 'Revenue',
    href: '/admin/revenue',
    icon: DollarSign,
    permission: 'manage_finance',
    section: 'revenue'
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    permission: 'manage_subscriptions',
    section: 'revenue'
  },
  {
    title: 'AppSumo Codes',
    href: '/admin/appsumo',
    icon: PiggyBank,
    permission: 'manage_subscriptions',
    section: 'revenue'
  },
  
  // Document Processing
  {
    title: 'Document Queue',
    href: '/admin/documents/queue',
    icon: FileStack,
    permission: 'manage_documents',
    section: 'documents'
  },
  {
    title: 'Processing Results',
    href: '/admin/documents/results',
    icon: FileText,
    permission: 'manage_documents',
    section: 'documents'
  },
  {
    title: 'AI Models',
    href: '/admin/documents/models',
    icon: BrainCircuit,
    permission: 'manage_documents',
    section: 'documents'
  },
  
  // Support & User Queries
  {
    title: 'Support Tickets',
    href: '/admin/support/tickets',
    icon: Headphones,
    permission: 'manage_support',
    section: 'support'
  },
  {
    title: 'User Queries',
    href: '/admin/support/queries',
    icon: MessageSquare,
    permission: 'manage_support',
    section: 'support'
  },
  
  // AI Feedback Loop
  {
    title: 'AI Feedback',
    href: '/admin/ai/feedback',
    icon: BrainCircuit,
    permission: 'manage_ai',
    section: 'ai'
  },
  {
    title: 'Training Data',
    href: '/admin/ai/training',
    icon: BrainCircuit,
    permission: 'manage_ai',
    section: 'ai'
  },
  
  // Admin Settings
  {
    title: 'Feature Flags',
    href: '/admin/settings/features',
    icon: Flag,
    permission: 'manage_settings',
    section: 'settings'
  },
  {
    title: 'App Configuration',
    href: '/admin/settings/config',
    icon: Settings,
    permission: 'manage_settings',
    section: 'settings'
  },
  {
    title: 'Announcements',
    href: '/admin/settings/announcements',
    icon: Bell,
    permission: 'manage_settings',
    section: 'settings'
  },
  
  // Security & Logs
  {
    title: 'Admin Users',
    href: '/admin/security/admins',
    icon: Shield,
    permission: 'manage_security',
    section: 'security'
  },
  {
    title: 'Audit Logs',
    href: '/admin/security/logs',
    icon: Database,
    permission: 'manage_security',
    section: 'security'
  },
  {
    title: 'Security Alerts',
    href: '/admin/security/alerts',
    icon: Shield,
    permission: 'manage_security',
    section: 'security'
  }
];

export function AdminSidebar() {
  const { hasPermission } = useAdmin();
  const location = useLocation();

  // Group sidebar items by section
  const groupedItems = sidebarItems.reduce((acc, item) => {
    const section = item.section || 'other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  // Section titles mapping
  const sectionTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'User Management',
    analytics: 'Analytics & Insights',
    revenue: 'Revenue & Billing',
    documents: 'Document Processing',
    support: 'Support & User Queries',
    ai: 'AI Feedback Loop',
    settings: 'Admin Settings',
    security: 'Security & Logs',
    other: 'Other'
  };

  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block w-64">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link to="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Spendify Admin</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-60px)] px-4 py-6">
        <nav className="flex flex-col gap-6">
          {Object.entries(groupedItems).map(([section, items]) => {
            // Filter out items that the user doesn't have permission for
            const filteredItems = items.filter(item => 
              !item.permission || hasPermission(item.permission)
            );
            
            // Skip sections with no visible items
            if (filteredItems.length === 0) return null;
            
            return (
              <div key={section} className="space-y-2">
                <div className="px-2 py-1">
                  <h3 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                    {sectionTitles[section]}
                  </h3>
                </div>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = location.pathname === item.href || 
                                    (item.href !== '/admin' && location.pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link key={item.href} to={item.href}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-2 h-9 px-2",
                            isActive && "bg-secondary"
                          )}
                          size="sm"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{item.title}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
