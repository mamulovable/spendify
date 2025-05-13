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
  FileStack,
  PiggyBank,
  BarChart3,
  Headphones,
  MessageSquare,
  Database,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'view_dashboard'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'view_dashboard'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    permission: 'manage_users'
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    permission: 'manage_subscriptions'
  },
  {
    title: 'Plans',
    href: '/admin/plans',
    icon: PiggyBank,
    permission: 'manage_subscriptions'
  },
  {
    title: 'Documents',
    href: '/admin/documents',
    icon: FileText,
    permission: 'view_dashboard'
  },
  {
    title: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    permission: 'view_dashboard'
  },
  {
    title: 'Financial',
    href: '/admin/finance',
    icon: PiggyBank,
    permission: 'manage_finance'
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    
  },
  {
    title: 'Support',
    href: '/admin/support',
    icon: Headphones,
    permission: 'manage_support'
  },
  {
    title: 'Communications',
    href: '/admin/communications',
    icon: MessageSquare,
    permission: 'manage_communications'
  },
  {
    title: 'Maintenance',
    href: '/admin/maintenance',
    icon: Database,
    permission: 'manage_maintenance'
  }
];

export function AdminSidebar() {
  const { hasPermission } = useAdmin();
  const location = useLocation();

  return (
    <div className="hidden border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link to="/admin" className="flex items-center gap-2 font-semibold">
          <span className="text-xl">Spendify Admin</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-60px)] px-4 py-6">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
