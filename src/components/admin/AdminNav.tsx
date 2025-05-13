import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Settings,
  Bell,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
    permission: 'manage_users',
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: <CreditCard className="w-5 h-5" />,
    permission: 'manage_subscriptions',
  },
  {
    title: 'Documents',
    href: '/admin/documents',
    icon: <FileText className="w-5 h-5" />,
    permission: 'manage_documents',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    permission: 'view_analytics',
  },
  // Communication & Maintenance features
  {
    title: 'Email Templates',
    href: '/admin/email-templates',
    icon: <FileText className="w-5 h-5" />,
    permission: 'manage_communication',
  },
  {
    title: 'Campaigns',
    href: '/admin/campaigns',
    icon: <BarChart3 className="w-5 h-5" />,
    permission: 'manage_communication',
  },
  {
    title: 'User Segments',
    href: '/admin/user-segments',
    icon: <Users className="w-5 h-5" />,
    permission: 'manage_communication',
  },
  {
    title: 'Backups',
    href: '/admin/backups',
    icon: <FileText className="w-5 h-5" />,
    permission: 'manage_maintenance',
  },
  {
    title: 'Data Cleanup',
    href: '/admin/data-cleanup',
    icon: <FileText className="w-5 h-5" />,
    permission: 'manage_maintenance',
  },
  {
    title: 'Release Notes',
    href: '/admin/release-notes',
    icon: <BarChart3 className="w-5 h-5" />,
    permission: 'view_release_notes',
  },
  {
    title: 'System Updates',
    href: '/admin/system-updates',
    icon: <Settings className="w-5 h-5" />,
    permission: 'manage_maintenance',
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: <Bell className="w-5 h-5" />,
    permission: 'manage_notifications',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
    permission: 'manage_settings',
  },
];

export function AdminNav() {
  const { hasPermission } = useAdmin();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        // Skip items that require permissions the user doesn't have
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                'hover:bg-gray-100 hover:text-gray-900',
                'focus:outline-none focus:bg-gray-100',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
