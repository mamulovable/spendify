export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName?: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  createdByName?: string | null;
}

export interface AdminUserFormData {
  email: string;
  fullName: string;
  password?: string;
  roleId: string;
  isActive: boolean;
}

export interface AdminRoleFormData {
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

export interface Permission {
  key: string;
  label: string;
  description: string;
  category: string;
}

export const AVAILABLE_PERMISSIONS: Permission[] = [
  // Dashboard
  {
    key: 'view_dashboard',
    label: 'View Dashboard',
    description: 'Access to view the admin dashboard',
    category: 'Dashboard'
  },
  
  // User Management
  {
    key: 'manage_users',
    label: 'Manage Users',
    description: 'Create, update, and delete user accounts',
    category: 'User Management'
  },
  {
    key: 'view_user_details',
    label: 'View User Details',
    description: 'View detailed user information',
    category: 'User Management'
  },
  
  // Analytics
  {
    key: 'view_analytics',
    label: 'View Analytics',
    description: 'Access to analytics and reporting',
    category: 'Analytics'
  },
  
  // Finance
  {
    key: 'manage_finance',
    label: 'Manage Finance',
    description: 'Access to financial data and reports',
    category: 'Finance'
  },
  {
    key: 'manage_subscriptions',
    label: 'Manage Subscriptions',
    description: 'Manage user subscriptions and billing',
    category: 'Finance'
  },
  
  // Documents
  {
    key: 'manage_documents',
    label: 'Manage Documents',
    description: 'Access to document processing system',
    category: 'Documents'
  },
  
  // Support
  {
    key: 'manage_support',
    label: 'Manage Support',
    description: 'Handle support tickets and user queries',
    category: 'Support'
  },
  
  // AI
  {
    key: 'manage_ai',
    label: 'Manage AI',
    description: 'Configure AI models and training data',
    category: 'AI'
  },
  
  // Settings
  {
    key: 'manage_settings',
    label: 'Manage Settings',
    description: 'Configure application settings',
    category: 'Settings'
  },
  
  // Security
  {
    key: 'manage_security',
    label: 'Manage Security',
    description: 'Access to security settings and logs',
    category: 'Security'
  },
  {
    key: 'manage_admins',
    label: 'Manage Admins',
    description: 'Create and manage admin users',
    category: 'Security'
  },
  {
    key: 'system_settings',
    label: 'System Settings',
    description: 'Configure system-level settings',
    category: 'Security'
  }
];